// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import os from "node:os";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

/**
 * Prefer a non-loopback IPv4 when proxying to :8000.
 *
 * On Windows it is common for a dead/foreign uvicorn to keep an exclusive
 * bind on 127.0.0.1:8000 while Carbon Passport correctly listens on 0.0.0.0:8000.
 * Vite's default target http://127.0.0.1:8000 then hits the wrong app → FastAPI
 * `{"detail":"Not Found"}` on every /api/* route. Routing via the LAN address
 * reaches the 0.0.0.0 listener instead.
 *
 * Override with VITE_DEV_API_PROXY (e.g. http://127.0.0.1:8001).
 */
function resolveDevApiProxyTarget(): string {
  const fromEnv = process.env.VITE_DEV_API_PROXY?.trim();
  if (fromEnv) return fromEnv;

  const nets = os.networkInterfaces();
  for (const entries of Object.values(nets)) {
    for (const entry of entries ?? []) {
      const family = entry.family;
      const isV4 = family === "IPv4" || family === 4;
      if (isV4 && !entry.internal) {
        return `http://${entry.address}:8000`;
      }
    }
  }
  return "http://127.0.0.1:8000";
}

const DEV_API_PROXY = resolveDevApiProxyTarget();
if (process.env.NODE_ENV !== "production") {
  console.info(`[vite] API proxy → ${DEV_API_PROXY}`);
}

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
        "/api": { target: DEV_API_PROXY, changeOrigin: true },
        "/health": { target: DEV_API_PROXY, changeOrigin: true },
      },
    },
  },
});
