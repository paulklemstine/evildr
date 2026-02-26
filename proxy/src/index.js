/**
 * DrEvil API Proxy — Cloudflare Worker (Pollinations)
 *
 * All LLM and image calls go through Pollinations.ai.
 * The client specifies the model; the proxy adds auth.
 *
 * Routes:
 *   POST /api/llm/chat/completions      → Pollinations (game turns, wisdom, image prompts)
 *   POST /api/llm-deep/chat/completions  → Pollinations (background analysis)
 *   GET  /api/image/{prompt}?...         → Pollinations image generation
 *   *    /api/reports                    → Cloudflare KV (session reports)
 *
 * Secrets (set via `wrangler secret put`):
 *   IMAGE_API_KEY  — Pollinations API key (used for both LLM and image)
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Maximum time to wait for a Pollinations LLM response
// Orchestrator calls with mistral can take 30-60s for complex multi-section output
const LLM_TIMEOUT_MS = 120000;

/**
 * Proxy an LLM chat completion request to Pollinations.
 * Passes through the client's model choice (mistral, nova-fast, etc.).
 */
async function proxyLLM(request, env) {
  const body = await request.text();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

  try {
    const response = await fetch("https://gen.pollinations.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.IMAGE_API_KEY}`,
      },
      body,
      signal: controller.signal,
    });

    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
        "X-LLM-Backend": "pollinations",
        ...CORS_HEADERS,
      },
    });
  } catch (err) {
    const msg = err.name === "AbortError" ? "Request timeout" : err.message;
    return new Response(JSON.stringify({ error: { message: msg, type: "proxy_error" } }), {
      status: 502,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Handle lobby presence via Cloudflare KV.
 * Players heartbeat to register, poll to discover others, and unregister on leave.
 * Key pattern: lobby:{peerId} → { peerId, name, gender, userId, updatedAt }
 * TTL: 30 seconds (auto-expires if player stops heartbeating)
 */
async function handleLobby(request, env, path) {
  const KV = env.REPORTS; // Reuse existing KV namespace with lobby: prefix
  if (!KV) {
    return new Response(JSON.stringify({ error: "Storage not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  // POST /api/lobby/heartbeat — register or refresh player presence
  if (request.method === "POST" && path === "/api/lobby/heartbeat") {
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    const { peerId, name, gender, userId } = body;
    if (!peerId || !name || !gender || !userId) {
      return new Response(JSON.stringify({ error: "peerId, name, gender, and userId required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    const entry = { peerId, name, gender, userId, updatedAt: Date.now() };
    // 30-second TTL — entry auto-expires if no heartbeat
    await KV.put(`lobby:${peerId}`, JSON.stringify(entry), { expirationTtl: 30 });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  // GET /api/lobby/players — list all active players
  if (request.method === "GET" && path === "/api/lobby/players") {
    const list = await KV.list({ prefix: "lobby:" });
    const players = [];

    // Fetch each player's data (KV list only returns keys, not values)
    for (const key of list.keys) {
      const raw = await KV.get(key.name);
      if (raw) {
        try {
          players.push(JSON.parse(raw));
        } catch { /* skip corrupt entries */ }
      }
    }

    return new Response(JSON.stringify({ players }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  // DELETE /api/lobby/player/{peerId} — unregister from lobby
  const delMatch = path.match(/^\/api\/lobby\/player\/([^/]+)$/);
  if (request.method === "DELETE" && delMatch) {
    const peerId = decodeURIComponent(delMatch[1]);
    await KV.delete(`lobby:${peerId}`);
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

/**
 * Handle report CRUD via Cloudflare KV.
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
      // --- LLM Proxy (both fast and deep route to Pollinations) ---
      if (path.startsWith("/api/llm")) {
        if (request.method !== "POST") {
          return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
          });
        }
        return proxyLLM(request, env);
      }

      // --- Image Proxy ---
      if (path.startsWith("/api/image")) {
        const targetPath = path.replace(/^\/api\/image/, "/image");
        const search = url.search;
        const separator = search ? "&" : "?";
        const targetUrl = `https://gen.pollinations.ai${targetPath}${search}${separator}key=${env.IMAGE_API_KEY}`;

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

      // --- Lobby API (presence via Cloudflare KV) ---
      if (path.startsWith("/api/lobby")) {
        return handleLobby(request, env, path);
      }

      // --- Reports API (Cloudflare KV) ---
      if (path.startsWith("/api/reports")) {
        return handleReports(request, env, path);
      }

      // --- Health check ---
      if (path === "/" || path === "/health") {
        return new Response(JSON.stringify({
          status: "ok",
          service: "drevil-proxy",
          provider: "pollinations",
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
