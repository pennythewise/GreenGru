/** Collect loan Stage-3 score inputs from localStorage (dashboard + form + checklist). */

import { docChecklists } from "@/lib/dashboard-data";
import type { DashboardSnapshot } from "@/hooks/useDashboardSnapshot";
import type { LoanApplicationForm } from "@/lib/application-forms/loan-template";

const SNAPSHOT_KEY = "greengru-dashboard-snapshot";
const FORM_KEY = "greengru-application-loan";
const CHECKLIST_KEY = "greengru-checklist-loan";

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

export type LoanScorePayload = {
  scrap_ratio_pct: number;
  green_electricity_pct: number;
  intensity_tco2e_per_t: number;
  metering_pct: number | null;
  checklist: { name: string; done: boolean; file_name?: string | null }[];
  application_form: LoanApplicationForm | null;
};

export function collectLoanScoreInputs(): LoanScorePayload {
  const snapshot = readJson<DashboardSnapshot>(SNAPSHOT_KEY);
  const applicationForm = readJson<LoanApplicationForm>(FORM_KEY);
  const uploads = readJson<Record<string, { done: boolean; fileName?: string }>>(CHECKLIST_KEY);

  const baseItems = docChecklists.loan.items;
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
    meteringSum += m === "ok" ? 95 : m === "warn" ? 78 : 55;
    meteringN += 1;
  }

  return {
    scrap_ratio_pct: sliderValue(snapshot, "scrap", 24.5),
    green_electricity_pct: sliderValue(snapshot, "green", 45.0),
    intensity_tco2e_per_t: snapshot?.intensity ?? 3.506,
    metering_pct: meteringN > 0 ? Math.round((meteringSum / meteringN) * 10) / 10 : null,
    checklist,
    application_form: applicationForm,
  };
}
