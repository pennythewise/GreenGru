import { useCallback, useEffect, useState } from "react";

import {
  emissionsBreakdown as defaultEmissions,
  processMatrix as defaultMatrix,
  ratioSliders as defaultSliders,
  tierGauge as defaultTierGauge,
} from "@/lib/dashboard-data";

export type DashboardSnapshot = {
  tierGauge: { value: number; nextTier: string; zh: string; pointsToNext?: number };
  ratioSliders: { key: string; label: string; zh: string; value: number; target: number; unit: string }[];
  emissionsBreakdown: { key: string; label: string; value: number; color: string }[];
  processMatrix: {
    stage: string;
    zh: string;
    key?: string;
    energy: string;
    intensity: string;
    metering: string;
    audit: string;
    intensity_tco2e_per_tonne?: number;
  }[];
  cisaGrade?: string;
  intensity?: number;
  updatedAt?: string;
};

const STORAGE_KEY = "greengru-dashboard-snapshot";

export function defaultSnapshot(): DashboardSnapshot {
  return {
    tierGauge: { ...defaultTierGauge, pointsToNext: 32 },
    ratioSliders: defaultSliders,
    emissionsBreakdown: defaultEmissions,
    processMatrix: defaultMatrix,
  };
}

export function useDashboardSnapshot() {
  const [snapshot, setSnapshotState] = useState<DashboardSnapshot>(defaultSnapshot);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSnapshotState({ ...defaultSnapshot(), ...JSON.parse(raw) });
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  const setSnapshot = useCallback((next: DashboardSnapshot) => {
    setSnapshotState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* quota */
    }
  }, []);

  const applyPipelineSnapshot = useCallback((partial: DashboardSnapshot) => {
    setSnapshot({ ...defaultSnapshot(), ...partial });
  }, [setSnapshot]);

  return { snapshot, setSnapshot, applyPipelineSnapshot };
}
