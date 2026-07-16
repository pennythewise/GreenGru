/**
 * Simulated GreenGru Integration API v1 — for Baowu/Ansteel developer docs.
 * Base: /api/v1?api_key=...
 */

const API_BASE = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL ?? "http://localhost:8000");

export const INTEGRATION_DEMO_API_KEY = "greengru-demo-key";

export const INTEGRATION_BASE_URL = import.meta.env.DEV
  ? `${typeof window !== "undefined" ? window.location.origin : "http://localhost:8080"}/api/v1`
  : `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/api/v1`;

export type IntegrationTryResult = {
  ok: boolean;
  status: number;
  url: string;
  body: unknown;
  error?: string;
};

export async function tryIntegrationEndpoint(
  path: string,
  options?: { method?: "GET" | "POST"; body?: object; apiKey?: string },
): Promise<IntegrationTryResult> {
  const apiKey = options?.apiKey ?? INTEGRATION_DEMO_API_KEY;
  const method = options?.method ?? "GET";
  const sep = path.includes("?") ? "&" : "?";
  const url = `${API_BASE}/api/v1${path}${sep}api_key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url, {
      method,
      headers: method === "POST" ? { "Content-Type": "application/json" } : undefined,
      body: method === "POST" && options?.body ? JSON.stringify(options.body) : undefined,
    });
    let body: unknown;
    const text = await res.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    return { ok: res.ok, status: res.status, url, body };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      url,
      body: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
