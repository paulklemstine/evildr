import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // All API calls proxy to the Cloudflare Worker (which routes to Pollinations)
      "/api": {
        target: "https://drevil-proxy.drevil.workers.dev",
        changeOrigin: true,
      },
    },
  },
  build: {
    target: "esnext",
    sourcemap: true,
  },
  optimizeDeps: {
    exclude: ["kokoro-js"],
  },
});
