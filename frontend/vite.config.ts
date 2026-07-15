// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Pin the Vercel Nitro preset when building on Vercel (VERCEL=1). Without
  // this, the Lovable wrapper defaults to cloudflare-module locally — fine for
  // dev, but a Vercel deploy that misses auto-detection would produce the
  // wrong output layout and surface as a platform 404.
  nitro: process.env.VERCEL ? { preset: "vercel" } : true,
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    server: {
      // Proxy API calls through the Vite dev server so the browser never
      // cross-origin fetches to :8000 (fixes "Failed to fetch" when using
      // localhost:8080 or a LAN IP like 172.x.x.x:8080).
      proxy: {
        "/api": { target: "http://127.0.0.1:8000", changeOrigin: true },
        "/health": { target: "http://127.0.0.1:8000", changeOrigin: true },
      },
    },
  },
});
