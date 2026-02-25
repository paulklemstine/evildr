/**
 * DrEvil API Proxy — Cloudflare Worker (Multi-Provider Failover)
 *
 * Routes:
 *   POST /api/llm/chat/completions      → Fast backends (game turns)
 *   POST /api/llm-deep/chat/completions  → Deep thinking backends (analysis)
 *   GET  /api/image/{prompt}?...         → Pollinations (appends API key server-side)
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
 * Fast backends — optimized for low latency game turns.
 * Gemini → Groq → SambaNova → fast OpenRouter models (no thinking models).
 */
function getBackendsFast(env) {
  const backends = [];

  // 1. Google Gemini (primary — ~1-3s with flash-lite)
  if (env.LLM_API_KEY) {
    backends.push({
      name: "gemini",
      target: env.LLM_TARGET || "https://generativelanguage.googleapis.com/v1beta/openai",
      key: env.LLM_API_KEY,
      model: null, // use client's model (gemini-2.5-flash-lite)
    });
  }

  // 2. Groq (fast inference hardware, ~2-5s, 10-30 RPM)
  if (env.GROQ_KEY) {
    backends.push({
      name: "groq",
      target: "https://api.groq.com/openai/v1",
      key: env.GROQ_KEY,
      model: "llama-3.3-70b-versatile",
    });
  }

  // 3. SambaNova (fast inference, 20 RPM)
  if (env.SAMBANOVA_KEY) {
    backends.push({
      name: "sambanova",
      target: "https://api.sambanova.ai/v1",
      key: env.SAMBANOVA_KEY,
      model: "Meta-Llama-3.3-70B-Instruct",
    });
  }

  // 4. OpenRouter — fast non-thinking models only (200 req/day each)
  if (env.OPENROUTER_KEY) {
    const fastModels = [
      "meta-llama/llama-3.3-70b-instruct:free",              // 128K ctx, fast
      "google/gemma-3-27b-it:free",                           // 131K ctx, Google quality
      "mistralai/mistral-small-3.1-24b-instruct:free",        // 128K ctx, strong instruction following
      "qwen/qwen3-coder:free",                                // 262K ctx, good at structured output
      "stepfun/step-3.5-flash:free",                          // 256K ctx, fast
      "nvidia/nemotron-3-nano-30b-a3b:free",                  // 256K ctx
      "upstage/solar-pro-3:free",                             // 128K ctx
      "arcee-ai/trinity-large-preview:free",                  // 131K ctx
      "z-ai/glm-4.5-air:free",                               // 131K ctx
      "openai/gpt-oss-20b:free",                              // 131K ctx
      "qwen/qwen3-next-80b-a3b-instruct:free",               // 262K ctx
      "google/gemma-3-12b-it:free",                           // 32K ctx
      "nvidia/nemotron-nano-12b-v2-vl:free",                  // 128K ctx
      "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", // 32K ctx, uncensored
    ];
    for (const model of fastModels) {
      backends.push({
        name: `openrouter:${model.split("/")[1].split(":")[0]}`,
        target: "https://openrouter.ai/api/v1",
        key: env.OPENROUTER_KEY,
        model,
      });
    }
  }

  // 5. OpenCode Zen — free models (no credit card needed)
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

  return backends;
}

/**
 * Deep backends — optimized for quality analysis (background tasks).
 * Large thinking models first, then fallback to Gemini.
 */
function getBackendsDeep(env) {
  const backends = [];

  // 1. OpenRouter — large thinking/reasoning models (slow but thorough)
  if (env.OPENROUTER_KEY) {
    const deepModels = [
      "qwen/qwen3-235b-a22b-thinking-2507",             // 131K ctx, deep reasoning
      "nousresearch/hermes-3-llama-3.1-405b:free",       // 131K ctx, largest free model
      "openai/gpt-oss-120b:free",                        // 131K ctx, large open model
    ];
    for (const model of deepModels) {
      backends.push({
        name: `openrouter:${model.split("/")[1].split(":")[0]}`,
        target: "https://openrouter.ai/api/v1",
        key: env.OPENROUTER_KEY,
        model,
      });
    }
  }

  // 2. OpenCode Zen — strong reasoning models
  if (env.OPENCODE_KEY) {
    backends.push({
      name: "opencode:kimi-k2.5",
      target: "https://opencode.ai/zen/v1",
      key: env.OPENCODE_KEY,
      model: "kimi-k2.5-free",
    });
  }

  // 3. Fallback to Gemini
  if (env.LLM_API_KEY) {
    backends.push({
      name: "gemini",
      target: env.LLM_TARGET || "https://generativelanguage.googleapis.com/v1beta/openai",
      key: env.LLM_API_KEY,
      model: null,
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

/**
 * Route an LLM request through a list of backends with failover.
 */
async function routeLLM(backends, bodyObj) {
  let lastResult = null;

  for (const backend of backends) {
    try {
      const result = await tryBackend(backend, bodyObj);

      if (result.ok) {
        return new Response(result.data, {
          status: 200,
          headers: {
            "Content-Type": result.contentType || "application/json",
            "X-LLM-Backend": backend.name,
            ...CORS_HEADERS,
          },
        });
      }

      console.log(`Backend "${backend.name}" returned ${result.status}, trying next...`);
      lastResult = result;
      continue;
    } catch (err) {
      console.log(`Backend "${backend.name}" network error: ${err.message}, trying next...`);
      lastResult = { ok: false, status: 502, data: JSON.stringify({ error: `Network error: ${err.message}` }) };
      continue;
    }
  }

  return new Response(lastResult?.data || JSON.stringify({ error: "All LLM backends failed" }), {
    status: lastResult?.status || 502,
    headers: {
      "Content-Type": "application/json",
      "X-LLM-Backend": "none",
      ...CORS_HEADERS,
    },
  });
}

/**
 * Handle report CRUD via Cloudflare KV.
 *
 * Routes:
 *   POST   /api/reports              — Upload/update a session report
 *   GET    /api/reports              — List all reports (metadata only)
 *   GET    /api/reports/:sessionId   — Get full report for a session
 *   DELETE /api/reports/:sessionId   — Delete a report
 */
async function handleReports(request, env, path) {
  const KV = env.REPORTS;
  if (!KV) {
    return new Response(JSON.stringify({ error: "Reports storage not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  // POST /api/reports — upload a report
  if (request.method === "POST" && path === "/api/reports") {
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    const { sessionId, userId, mode, genre, startedAt, turnCount, turns, analyses } = body;
    if (!sessionId || !userId) {
      return new Response(JSON.stringify({ error: "sessionId and userId required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    const now = Date.now();
    const metadata = {
      userId,
      mode: mode || "unknown",
      genre: genre || null,
      startedAt: startedAt || now,
      turnCount: turnCount || 0,
      hasAnalysis: Array.isArray(analyses) && analyses.length > 0,
      uploadedAt: now,
    };

    // Store full report with metadata for listing
    await KV.put(`report:${sessionId}`, JSON.stringify(body), { metadata });

    return new Response(JSON.stringify({ ok: true, sessionId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  // GET /api/reports — list all reports (metadata only)
  if (request.method === "GET" && path === "/api/reports") {
    const list = await KV.list({ prefix: "report:" });
    const reports = list.keys.map(k => ({
      sessionId: k.name.replace("report:", ""),
      ...k.metadata,
    }));
    // Sort by uploadedAt descending
    reports.sort((a, b) => (b.uploadedAt || 0) - (a.uploadedAt || 0));

    return new Response(JSON.stringify({ reports }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  // GET /api/reports/:sessionId — get full report
  const getMatch = path.match(/^\/api\/reports\/([^/]+)$/);
  if (request.method === "GET" && getMatch) {
    const sessionId = decodeURIComponent(getMatch[1]);
    const data = await KV.get(`report:${sessionId}`);
    if (!data) {
      return new Response(JSON.stringify({ error: "Report not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }
    return new Response(data, {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  // DELETE /api/reports/:sessionId
  const delMatch = path.match(/^\/api\/reports\/([^/]+)$/);
  if (request.method === "DELETE" && delMatch) {
    const sessionId = decodeURIComponent(delMatch[1]);
    await KV.delete(`report:${sessionId}`);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
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
      // --- Deep LLM Proxy (thinking models for background analysis) ---
      if (path.startsWith("/api/llm-deep")) {
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

        const backends = getBackendsDeep(env);
        if (backends.length === 0) {
          return new Response(JSON.stringify({ error: "No deep LLM backends configured" }), {
            status: 503,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
          });
        }

        return routeLLM(backends, bodyObj);
      }

      // --- Fast LLM Proxy (game turns — low latency) ---
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

        const backends = getBackendsFast(env);
        if (backends.length === 0) {
          return new Response(JSON.stringify({ error: "No LLM backends configured" }), {
            status: 503,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
          });
        }

        return routeLLM(backends, bodyObj);
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

      // --- Reports API (Cloudflare KV) ---
      if (path.startsWith("/api/reports")) {
        return handleReports(request, env, path);
      }

      // --- Health check ---
      if (path === "/" || path === "/health") {
        const fast = getBackendsFast(env);
        const deep = getBackendsDeep(env);
        return new Response(JSON.stringify({
          status: "ok",
          service: "drevil-proxy",
          fast: fast.map(b => b.name),
          deep: deep.map(b => b.name),
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
