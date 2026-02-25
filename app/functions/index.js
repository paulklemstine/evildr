import { onRequest } from "firebase-functions/v2/https";
import { defineString } from "firebase-functions/params";

// Secrets configured via: firebase functions:secrets:set LLM_API_KEY / IMAGE_API_KEY
const llmApiKey = defineString("LLM_API_KEY");
const imageApiKey = defineString("IMAGE_API_KEY");

const LLM_TARGET = "https://opencode.ai/zen/v1";
const IMAGE_TARGET = "https://gen.pollinations.ai";

/**
 * Unified API proxy. Routes:
 *   POST /api/llm/chat/completions → OpenCode Zen (injects Bearer token)
 *   GET  /api/image/{prompt}?...   → Pollinations (appends key param)
 */
export const api = onRequest(
  { cors: true, maxInstances: 20 },
  async (req, res) => {
    const path = req.path; // e.g. "/api/llm/chat/completions" or "/api/image/..."

    try {
      // --- LLM Proxy ---
      if (path.startsWith("/api/llm")) {
        const targetPath = path.replace(/^\/api\/llm/, "");
        const targetUrl = `${LLM_TARGET}${targetPath}`;

        const upstream = await fetch(targetUrl, {
          method: req.method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${llmApiKey.value()}`,
          },
          body: req.method === "POST" ? JSON.stringify(req.body) : undefined,
        });

        const data = await upstream.text();
        res.status(upstream.status);
        // Forward content-type
        const ct = upstream.headers.get("content-type");
        if (ct) res.set("Content-Type", ct);
        res.send(data);
        return;
      }

      // --- Image Proxy ---
      if (path.startsWith("/api/image")) {
        const targetPath = path.replace(/^\/api\/image/, "/image");
        const qs = req.url.includes("?")
          ? req.url.substring(req.url.indexOf("?"))
          : "";
        const separator = qs ? "&" : "?";
        const targetUrl = `${IMAGE_TARGET}${targetPath}${qs}${separator}key=${imageApiKey.value()}`;

        // Redirect to Pollinations — the image is fetched directly by the browser
        res.redirect(302, targetUrl);
        return;
      }

      res.status(404).json({ error: "Not found" });
    } catch (err) {
      console.error("Proxy error:", err);
      res.status(502).json({ error: "Proxy error", message: String(err) });
    }
  }
);
