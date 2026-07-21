import { sendRouteIntent, type CopilotHistoryMessage, type RouteIntentResponse } from "@/lib/api";
import { CONFIDENCE_FLOOR } from "@/lib/route-flow";

export type RouterRoute = {
  key: "loan" | "grant" | "passport";
  label: string;
  conf: number;
  preSelected: boolean;
  reason: string;
};

/** Placeholder rows before the user finishes asking (no confidence shown). */
export const PENDING_ROUTES: RouterRoute[] = [
  { key: "grant", label: "Grant 补贴", conf: 0, preSelected: false, reason: "" },
  { key: "loan", label: "Loan 贷款", conf: 0, preSelected: false, reason: "" },
  { key: "passport", label: "EU license CBAM", conf: 0, preSelected: false, reason: "" },
];

function inferLocal(history: CopilotHistoryMessage[]): RouteIntentResponse {
  const text = history.filter((m) => m.role === "user").map((m) => m.content).join(" ").toLowerCase();
  let loan = 0.12;
  let grant = 0.12;
  let passport = 0.10;

  if (/loan|credit|pboc|refinanc|metering|贷款|信贷|绿色贷款/.test(text)) loan += 0.55;
  if (/grant|subsidy|factory|gb\/t|scrap|补贴|零碳|深绿|工信部/.test(text)) grant += 0.55;
  if (/cbam|eu |export|passport|license|tonnage|碳护照|欧盟|出口/.test(text)) passport += 0.55;
  if (/domestic|no eu|not currently|国内/.test(text)) passport = Math.min(passport, 0.34);

  return {
    loan: Math.min(0.97, loan),
    grant: Math.min(0.97, grant),
    passport: Math.min(0.97, passport),
    reasons: {
      loan: loan >= CONFIDENCE_FLOOR ? "Green credit or metering-upgrade language detected." : "No strong loan signals yet.",
      grant: grant >= CONFIDENCE_FLOOR ? "Factory subsidy / GB/T 36132 language detected." : "Grant signals weak in chat so far.",
      passport: passport >= CONFIDENCE_FLOOR ? "EU export or CBAM language detected." : "No EU-bound tonnage declared in chat.",
    },
    mock: true,
  };
}

export function intentToRoutes(intent: RouteIntentResponse): RouterRoute[] {
  const meta: { key: RouterRoute["key"]; label: string }[] = [
    { key: "grant", label: "Grant 补贴" },
    { key: "loan", label: "Loan 贷款" },
    { key: "passport", label: "EU license CBAM" },
  ];
  return meta.map(({ key, label }) => {
    const conf = intent[key];
    return {
      key,
      label,
      conf,
      preSelected: conf >= CONFIDENCE_FLOOR,
      reason: intent.reasons[key] ?? "",
    };
  });
}

export async function resolveRouteIntent(history: CopilotHistoryMessage[]): Promise<RouterRoute[]> {
  if (history.filter((m) => m.role === "user").length === 0) return PENDING_ROUTES;
  try {
    const intent = await sendRouteIntent(history);
    return intentToRoutes(intent);
  } catch {
    return intentToRoutes(inferLocal(history));
  }
}

export function selectionFromRoutes(routes: RouterRoute[]): Record<string, boolean> {
  return Object.fromEntries(routes.map((r) => [r.key, r.preSelected]));
}
