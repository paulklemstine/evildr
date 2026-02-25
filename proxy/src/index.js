/**
 * DrEvil API Proxy — Cloudflare Worker
 *
 * Routes:
 *   POST /api/llm/chat/completions → Google Gemini (injects Bearer token)
 *   GET  /api/image/{prompt}?...   → Pollinations  (appends API key server-side)
 *
 * Secrets (set via `wrangler secret put`):
 *   LLM_API_KEY   — Google Gemini API key
 *   IMAGE_API_KEY  — Pollinations API key
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // --- LLM Proxy ---
      if (path.startsWith("/api/llm")) {
        const targetPath = path.replace(/^\/api\/llm/, "");
        const targetUrl = `${env.LLM_TARGET}${targetPath}`;

        const body = request.method === "POST" ? await request.text() : undefined;

        const upstream = await fetch(targetUrl, {
          method: request.method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.LLM_API_KEY}`,
          },
          body,
        });

        const data = await upstream.text();
        return new Response(data, {
          status: upstream.status,
          headers: {
            "Content-Type": upstream.headers.get("Content-Type") || "application/json",
            ...CORS_HEADERS,
          },
        });
      }

      // --- Image Proxy ---
      // Fetches the image server-side so the API key is never exposed to the client.
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

        // Stream the image back to the client with proper headers
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
        return new Response(JSON.stringify({ status: "ok", service: "drevil-proxy" }), {
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
