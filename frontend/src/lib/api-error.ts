/**
 * Turn FastAPI / proxy failure bodies into short, actionable messages.
 * Avoid dumping raw `{"detail":"Not Found"}` into the pipeline UI.
 */

const WRONG_BACKEND_HINT =
  "Port :8000 is answering, but it is not the Carbon Passport API " +
  "(often another local uvicorn still bound to 127.0.0.1:8000). " +
  "Stop that process or set VITE_DEV_API_PROXY to the Carbon Passport URL, " +
  "then restart `npm run dev`.";

function extractDetail(body: string): string | null {
  const trimmed = body.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed) as { detail?: unknown };
    if (typeof parsed.detail === "string") return parsed.detail;
    if (Array.isArray(parsed.detail)) {
      return parsed.detail
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object" && "msg" in item) {
            return String((item as { msg: unknown }).msg);
          }
          return JSON.stringify(item);
        })
        .filter(Boolean)
        .join("; ");
    }
    if (parsed.detail != null) return JSON.stringify(parsed.detail);
  } catch {
    /* plain text body */
  }
  return trimmed.length > 280 ? `${trimmed.slice(0, 280)}…` : trimmed;
}

export async function formatApiFailure(res: Response, what: string): Promise<string> {
  const body = await res.text().catch(() => "");
  const detail = extractDetail(body);

  if (res.status === 404) {
    const looksLikeStarletteNotFound =
      !detail ||
      detail === "Not Found" ||
      detail.toLowerCase() === "not found";
    if (looksLikeStarletteNotFound) {
      return `${what} returned 404. ${WRONG_BACKEND_HINT}`;
    }
    return `${what} not found (404): ${detail}`;
  }

  if (detail) return `${what} failed (${res.status}): ${detail}`;
  return `${what} failed (${res.status})`;
}

export async function throwIfNotOk(res: Response, what: string): Promise<void> {
  if (res.ok) return;
  throw new Error(await formatApiFailure(res, what));
}

/** Confirms Vite is proxying to GreenGru, not another app on the same port. */
export async function assertCarbonPassportBackend(apiBase = ""): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${apiBase}/health`, { method: "GET" });
  } catch {
    throw new Error(
      "Cannot reach backend /health. Start Carbon Passport: " +
        "cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000",
    );
  }

  if (!res.ok) {
    throw new Error(
      `Backend /health returned ${res.status}. ${WRONG_BACKEND_HINT}`,
    );
  }

  let data: { status?: string; service?: string; embedding_model?: string };
  try {
    data = (await res.json()) as typeof data;
  } catch {
    throw new Error(`Backend /health was not JSON. ${WRONG_BACKEND_HINT}`);
  }

  const isOurs =
    data.status === "ok" &&
    (data.service === "carbon-passport" || typeof data.embedding_model === "string");

  if (!isOurs) {
    throw new Error(WRONG_BACKEND_HINT);
  }
}
