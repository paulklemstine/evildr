/**
 * DrEvil API Proxy — Cloudflare Worker (Multi-Provider Failover)
 *
 * Routes:
 *   POST /api/llm/chat/completions → Tries multiple LLM backends with automatic failover
 *   GET  /api/image/{prompt}?...   → Pollinations (appends API key server-side)
 *
 * Secrets (set via `wrangler secret put`):
 *   LLM_API_KEY       — Google Gemini API key
 *   OPENROUTER_KEY    — OpenRouter API key (free tier: 200 req/day/model)
 *   OPENCODE_KEY      — OpenCode Zen API key (free models: kimi, minimax, trinity)
 *   GROQ_KEY          — Groq API key (free tier: 10-30 RPM)
 *   SAMBANOVA_KEY     — SambaNova API key (free tier: 20 RPM)
 *   IMAGE_API_KEY     — Pollinations API key
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * Build the ordered list of LLM backends to try.
 * Backends without API keys are skipped automatically.
 */
function getBackends(env) {
  const backends = [];

  // 1. Google Gemini (primary)
  if (env.LLM_API_KEY) {
    backends.push({
      name: "gemini",
      target: env.LLM_TARGET || "https://generativelanguage.googleapis.com/v1beta/openai",
      key: env.LLM_API_KEY,
      model: null, // use client's model
    });
  }

  // 2. OpenRouter — all strong free models (200 req/day each = massive pool)
  if (env.OPENROUTER_KEY) {
    const openRouterFreeModels = [
      // Tier 1: Best quality, large context, strong JSON output
      "meta-llama/llama-3.3-70b-instruct:free",        // 128K ctx, GPT-4 equivalent
      "nousresearch/hermes-3-llama-3.1-405b:free",      // 131K ctx, largest free model
      "qwen/qwen3-235b-a22b-thinking-2507",             // 131K ctx, strong reasoning
      "qwen/qwen3-coder:free",                          // 262K ctx, excellent at structured output
      "openai/gpt-oss-120b:free",                       // 131K ctx, large open model
      "google/gemma-3-27b-it:free",                     // 131K ctx, Google quality
      // Tier 2: Good quality, solid fallbacks
      "mistralai/mistral-small-3.1-24b-instruct:free",  // 128K ctx, strong instruction following
      "stepfun/step-3.5-flash:free",                    // 256K ctx, huge context
      "nvidia/nemotron-3-nano-30b-a3b:free",            // 256K ctx, nvidia quality
      "upstage/solar-pro-3:free",                       // 128K ctx
      "arcee-ai/trinity-large-preview:free",            // 131K ctx
      "z-ai/glm-4.5-air:free",                         // 131K ctx
      "openai/gpt-oss-20b:free",                        // 131K ctx
      "qwen/qwen3-next-80b-a3b-instruct:free",         // 262K ctx
      // Tier 3: Smaller but functional
      "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", // 32K ctx, uncensored
      "google/gemma-3-12b-it:free",                     // 32K ctx
      "nvidia/nemotron-nano-12b-v2-vl:free",            // 128K ctx
    ];
    for (const model of openRouterFreeModels) {
      backends.push({
        name: `openrouter:${model.split("/")[1].split(":")[0]}`,
        target: "https://openrouter.ai/api/v1",
        key: env.OPENROUTER_KEY,
        model,
      });
    }
  }

  // 3. OpenCode Zen — free models (no credit card needed)
  if (env.OPENCODE_KEY) {
    const openCodeFreeModels = [
      "kimi-k2.5-free",              // Moonshot AI, strong reasoning
      "minimax-m2.5-free",           // Minimax, good quality
      "trinity-large-preview-free",  // Arcee AI
    ];
    for (const model of openCodeFreeModels) {
      backends.push({
        name: `opencode:${model.replace("-free", "")}`,
        target: "https://opencode.ai/zen/v1",
        key: env.OPENCODE_KEY,
        model,
      });
    }
  }

  // 4. Groq (fast inference, 10-30 RPM)
  if (env.GROQ_KEY) {
    backends.push({
      name: "groq",
      target: "https://api.groq.com/openai/v1",
      key: env.GROQ_KEY,
      model: "llama-3.3-70b-versatile",
    });
  }

  // 4. SambaNova (20 RPM, 200K tokens/day)
  if (env.SAMBANOVA_KEY) {
    backends.push({
      name: "sambanova",
      target: "https://api.sambanova.ai/v1",
      key: env.SAMBANOVA_KEY,
      model: "Meta-Llama-3.3-70B-Instruct",
    });
  }

  return backends;
}

/**
 * Try calling an LLM backend. Returns { ok, status, body } or throws.
 */
async function tryBackend(backend, bodyObj) {
  const reqBody = { ...bodyObj };
  // Override model if the backend specifies one
  if (backend.model) {
    reqBody.model = backend.model;
  }

  const url = `${backend.target}/chat/completions`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backend.key}`,
    },
    body: JSON.stringify(reqBody),
  });

  const data = await response.text();
  return { ok: response.ok, status: response.status, data, contentType: response.headers.get("Content-Type") };
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // --- LLM Proxy (Multi-Provider Failover) ---
      if (path.startsWith("/api/llm")) {
        if (request.method !== "POST") {
          return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
          });
        }

        const bodyText = await request.text();
        let bodyObj;
        try {
          bodyObj = JSON.parse(bodyText);
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
          });
        }

        const backends = getBackends(env);
        if (backends.length === 0) {
          return new Response(JSON.stringify({ error: "No LLM backends configured" }), {
            status: 503,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
          });
        }

        let lastResult = null;

        for (const backend of backends) {
          try {
            const result = await tryBackend(backend, bodyObj);

            if (result.ok) {
              // Success — return the response
              return new Response(result.data, {
                status: 200,
                headers: {
                  "Content-Type": result.contentType || "application/json",
                  "X-LLM-Backend": backend.name,
                  ...CORS_HEADERS,
                },
              });
            }

            // Any error — try next backend
            console.log(`Backend "${backend.name}" returned ${result.status}, trying next...`);
            lastResult = result;
            continue;
          } catch (err) {
            console.log(`Backend "${backend.name}" network error: ${err.message}, trying next...`);
            lastResult = { ok: false, status: 502, data: JSON.stringify({ error: `Network error: ${err.message}` }) };
            continue;
          }
        }

        // All backends exhausted — return last error
        return new Response(lastResult?.data || JSON.stringify({ error: "All LLM backends failed" }), {
          status: lastResult?.status || 502,
          headers: {
            "Content-Type": "application/json",
            "X-LLM-Backend": "none",
            ...CORS_HEADERS,
          },
        });
      }

      // --- Image Proxy ---
      if (path.startsWith("/api/image")) {
        const targetPath = path.replace(/^\/api\/image/, "/image");
        const search = url.search;
        const separator = search ? "&" : "?";
        const targetUrl = `${env.IMAGE_TARGET}${targetPath}${search}${separator}key=${env.IMAGE_API_KEY}`;

        const upstream = await fetch(targetUrl);

        if (!upstream.ok) {
          return new Response(JSON.stringify({ error: "Image generation failed", status: upstream.status }), {
            status: upstream.status,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
          });
        }

        return new Response(upstream.body, {
          status: 200,
          headers: {
            "Content-Type": upstream.headers.get("Content-Type") || "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
            ...CORS_HEADERS,
          },
        });
      }

      // --- Health check ---
      if (path === "/" || path === "/health") {
        const backends = getBackends(env);
        return new Response(JSON.stringify({
          status: "ok",
          service: "drevil-proxy",
          backends: backends.map(b => b.name),
        }), {
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        });
      }

      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Proxy error", message: String(err) }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }
  },
};
