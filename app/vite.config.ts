import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // Load .env without VITE_ prefix filter (server-side keys)
  const env = loadEnv(mode, ".", "");

  return {
    plugins: [tailwindcss()],
    server: {
      port: 3000,
      open: true,
      proxy: {
        // Deep LLM proxy: /api/llm-deep/* → Cloudflare Worker (thinking models)
        // Must be listed BEFORE /api/llm to match first
        "/api/llm-deep": {
          target: "https://drevil-proxy.drevil.workers.dev",
          changeOrigin: true,
        },
        // Fast LLM proxy: /api/llm/* → Google Gemini OpenAI-compatible endpoint
        // Injects Authorization header server-side so the key never reaches the browser
        "/api/llm": {
          target: "https://generativelanguage.googleapis.com",
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/llm/, "/v1beta/openai"),
          headers: {
            Authorization: `Bearer ${env.LLM_API_KEY}`,
          },
        },
        // Image proxy: /api/image/* → gen.pollinations.ai/image/*
        // Appends the API key as a query param server-side
        "/api/image": {
          target: "https://gen.pollinations.ai",
          changeOrigin: true,
          rewrite: (path: string) => {
            const rewritten = path.replace(/^\/api\/image/, "/image");
            const separator = rewritten.includes("?") ? "&" : "?";
            return `${rewritten}${separator}key=${env.IMAGE_API_KEY}`;
          },
        },
      },
    },
    build: {
      target: "es2022",
      sourcemap: true,
    },
  };
});
