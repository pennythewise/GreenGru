/** Collect CBAM Stage-3 score inputs from localStorage (dashboard + passport checklist). */

import { docChecklists } from "@/lib/dashboard-data";
import type { DashboardSnapshot } from "@/hooks/useDashboardSnapshot";

const SNAPSHOT_KEY = "greengru-dashboard-snapshot";
const CHECKLIST_KEY = "greengru-checklist-passport";

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

  // Infer CN / route from checklist completion (explicit fields live on submission, not snapshot)
  const hasCnDoc = checklist.some((c) => c.done && /CN-code|税则号/i.test(c.name));
  const hasRouteDoc = checklist.some((c) => c.done && /Route-of-production|生产工艺/i.test(c.name));

  return {
    cn_code: hasCnDoc ? "7213 / 7214" : null,
    production_route: hasRouteDoc ? "BF-BOF" : "BF-BOF",
    intensity_tco2e_per_t: snapshot?.intensity ?? 3.506,
    metering_pct: meteringN > 0 ? Math.round((meteringSum / meteringN) * 10) / 10 : null,
    scrap_ratio_pct: sliderValue(snapshot, "scrap", 24.5),
    production_tonnes: null,
    checklist,
    process_matrix: snapshot?.processMatrix ?? [],
  };
}
