/** Collect grant-score inputs from browser localStorage (new submission + form + checklist). */

import { docChecklists } from "@/lib/dashboard-data";
import type { DashboardSnapshot } from "@/hooks/useDashboardSnapshot";
import type { GrantApplicationForm } from "@/lib/application-forms/grant-template";

const SNAPSHOT_KEY = "greengru-dashboard-snapshot";
const FORM_KEY = "greengru-application-grant";
const CHECKLIST_KEY = "greengru-checklist-grant";

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

export type GrantScorePayload = {
  scrap_ratio_pct: number;
  green_electricity_pct: number;
  intensity_tco2e_per_t: number;
  metering_pct: number | null;
  water_reuse_pct: number;
  solid_waste_util_pct: number;
  production_tonnes: number | null;
  checklist: { name: string; done: boolean; file_name?: string | null }[];
  application_form: GrantApplicationForm | null;
};

export function collectGrantScoreInputs(): GrantScorePayload {
  const snapshot = readJson<DashboardSnapshot>(SNAPSHOT_KEY);
  const applicationForm = readJson<GrantApplicationForm>(FORM_KEY);
  const uploads = readJson<Record<string, { done: boolean; fileName?: string }>>(CHECKLIST_KEY);

  const baseItems = docChecklists.grant.items;
  const checklist = baseItems.map((it) => {
    const up = uploads?.[it.name];
    const fileName = up?.fileName?.trim();
    return {
      name: it.name,
      done: Boolean(fileName),
      file_name: fileName || null,
    };
  });

  let meteringSum = 0;
  let meteringN = 0;
  for (const row of snapshot?.processMatrix ?? []) {
    const m = row.metering?.toLowerCase();
    meteringSum += m === "ok" ? 95 : m === "warn" ? 78 : 62;
    meteringN += 1;
  }

  return {
    scrap_ratio_pct: sliderValue(snapshot, "scrap", 24.5),
    green_electricity_pct: sliderValue(snapshot, "green", 45.0),
    intensity_tco2e_per_t: snapshot?.intensity ?? 3.506,
    metering_pct: meteringN > 0 ? Math.round((meteringSum / meteringN) * 10) / 10 : null,
    water_reuse_pct: 62.0,
    solid_waste_util_pct: 72.0,
    production_tonnes: null,
    checklist,
    application_form: applicationForm,
  };
}
