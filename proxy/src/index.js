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

  // 2. OpenRouter (24+ free models, 200 req/day/model)
  if (env.OPENROUTER_KEY) {
    backends.push({
      name: "openrouter",
      target: "https://openrouter.ai/api/v1",
      key: env.OPENROUTER_KEY,
      model: "google/gemini-2.0-flash-exp:free",
    });
    backends.push({
      name: "openrouter-llama",
      target: "https://openrouter.ai/api/v1",
      key: env.OPENROUTER_KEY,
      model: "meta-llama/llama-3.3-70b-instruct:free",
    });
  }

  // 3. Groq (fast inference, 10-30 RPM)
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

            // Rate limited or server error — try next backend
            if (result.status === 429 || result.status >= 500) {
              console.log(`Backend "${backend.name}" returned ${result.status}, trying next...`);
              lastResult = result;
              continue;
            }

            // Client error (400, 404, etc.) — return as-is
            lastResult = result;
            // For 404 (model not found), try next backend
            if (result.status === 404) {
              continue;
            }

            // Other client errors — return immediately
            return new Response(result.data, {
              status: result.status,
              headers: {
                "Content-Type": result.contentType || "application/json",
                "X-LLM-Backend": backend.name,
                ...CORS_HEADERS,
              },
            });
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
