/** Collect CBAM Stage-3 score inputs — defaults to demo mock data when dashboard is empty. */

import { docChecklists } from "@/lib/dashboard-data";
import type { DashboardSnapshot } from "@/hooks/useDashboardSnapshot";

const SNAPSHOT_KEY = "greengru-dashboard-snapshot";
const CHECKLIST_KEY = "greengru-checklist-passport";

/** Demo SME fastener shipment — enough for tariff + industry discount without user setup. */
const MOCK_DEFAULTS = {
  cn_code: "7318 15 88",
  production_route: "BF-BOF",
  intensity_tco2e_per_t: 3.506,
  metering_pct: 78,
  scrap_ratio_pct: 24.5,
  production_tonnes: 1000,
} as const;

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore */
  }
  return null;
}

function sliderValue(snapshot: DashboardSnapshot | null, key: string, fallback: number): number {
  const s = snapshot?.ratioSliders?.find((r) => r.key === key);
  return s?.value ?? fallback;
}

export type CbamScorePayload = {
  cn_code: string | null;
  production_route: string;
  intensity_tco2e_per_t: number;
  metering_pct: number | null;
  scrap_ratio_pct: number;
  production_tonnes: number | null;
  checklist: { name: string; done: boolean; file_name?: string | null }[];
  process_matrix: { stage?: string; metering?: string }[];
};

export function collectCbamScoreInputs(): CbamScorePayload {
  const snapshot = readJson<DashboardSnapshot>(SNAPSHOT_KEY);
  const uploads = readJson<Record<string, { done: boolean; fileName?: string }>>(CHECKLIST_KEY);

  const baseItems = docChecklists.passport.items;
  const checklist = baseItems.map((it) => {
    const up = uploads?.[it.name];
    // Prefer saved uploads; otherwise keep checklist demo `done` flags so Stage 3
    // can score + unlock industry discount without manual setup.
    return {
      name: it.name,
      done: up?.done ?? it.done,
      file_name: up?.fileName ?? null,
    };
  });

  let meteringSum = 0;
  let meteringN = 0;
  for (const row of snapshot?.processMatrix ?? []) {
    const m = row.metering?.toLowerCase();
    meteringSum += m === "ok" ? 95 : m === "warn" ? 78 : 55;
    meteringN += 1;
  }

  return {
    // Demo defaults — no dashboard setup required for Stage-3 tariff UX.
    cn_code: MOCK_DEFAULTS.cn_code,
    production_route: MOCK_DEFAULTS.production_route,
    intensity_tco2e_per_t: snapshot?.intensity ?? MOCK_DEFAULTS.intensity_tco2e_per_t,
    metering_pct:
      meteringN > 0
        ? Math.round((meteringSum / meteringN) * 10) / 10
        : MOCK_DEFAULTS.metering_pct,
    scrap_ratio_pct: sliderValue(snapshot, "scrap", MOCK_DEFAULTS.scrap_ratio_pct),
    production_tonnes: MOCK_DEFAULTS.production_tonnes,
    checklist,
    process_matrix: snapshot?.processMatrix ?? [
      { stage: "Forming", metering: "warn" },
      { stage: "Heat treatment", metering: "ok" },
      { stage: "Finishing", metering: "warn" },
    ],
  };
}
