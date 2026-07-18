import { useCallback, useRef, useState } from "react";
import { routeStrip } from "@/lib/dashboard-data";
import { runCbamScore, runGrantScore, type CbamScoreResult, type GrantScoreResult } from "@/lib/api";
import { collectCbamScoreInputs } from "@/lib/cbam-score-inputs";
import { collectGrantScoreInputs } from "@/lib/grant-score-inputs";

export type PipelineStageStatus = "pending" | "loading" | "done";

export type PipelineStage = {
  n: number;
  key: string;
  zh: string;
  method: string;
  status: PipelineStageStatus;
  elapsed: string | null;
};

const STAGE_DURATIONS_MS = [400, 1200, 650, 900, 1800];

function initialStages(kb: string, slug?: "loan" | "grant" | "passport"): PipelineStage[] {
  return routeStrip(kb, slug).map((s) => ({
    n: s.n,
    key: s.key,
    zh: s.zh,
    method: s.method,
    status: (s.status === "done" ? "done" : "pending") as PipelineStageStatus,
    elapsed: s.elapsed,
  }));
}

function formatElapsed(ms: number) {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export function useRoutePipeline(kb: string, slug?: "loan" | "grant" | "passport") {
  const [stages, setStages] = useState<PipelineStage[]>(() => initialStages(kb, slug));
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [grantScore, setGrantScore] = useState<GrantScoreResult | null>(null);
  const [cbamScore, setCbamScore] = useState<CbamScoreResult | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const reset = useCallback(() => {
    abortRef.current = true;
    setStages(
      routeStrip(kb, slug).map((s) => ({
        n: s.n,
        key: s.key,
        zh: s.zh,
        method: s.method,
        status: "pending" as const,
        elapsed: null,
      })),
    );
    setComplete(false);
    setRunning(false);
    setGrantScore(null);
    setCbamScore(null);
    setScoreError(null);
  }, [kb, slug]);

  const runPipeline = useCallback(async (): Promise<PipelineStage[]> => {
    if (running) return stages;
    abortRef.current = false;
    setRunning(true);
    setComplete(false);
    setGrantScore(null);
    setCbamScore(null);
    setScoreError(null);

    const meta = routeStrip(kb, slug);
    let current: PipelineStage[] = meta.map((s) => ({
      n: s.n,
      key: s.key,
      zh: s.zh,
      method: s.method,
      status: "pending",
      elapsed: null,
    }));
    setStages(current);

    for (let i = 0; i < meta.length; i++) {
      if (abortRef.current) break;
      const idx = i;
      const duration = STAGE_DURATIONS_MS[i] ?? 800;

      current = current.map((s, j) =>
        j === idx ? { ...s, status: "loading", elapsed: null } : s,
      );
      setStages(current);

      const start = performance.now();

      if (slug === "grant" && meta[idx]?.n === 3) {
        try {
          const inputs = collectGrantScoreInputs();
          const score = await runGrantScore({
            scrap_ratio_pct: inputs.scrap_ratio_pct,
            green_electricity_pct: inputs.green_electricity_pct,
            intensity_tco2e_per_t: inputs.intensity_tco2e_per_t,
            metering_pct: inputs.metering_pct,
            water_reuse_pct: inputs.water_reuse_pct,
            solid_waste_util_pct: inputs.solid_waste_util_pct,
            production_tonnes: inputs.production_tonnes,
            checklist: inputs.checklist,
            application_form: inputs.application_form,
          });
          setGrantScore(score);
        } catch (err) {
          setScoreError(err instanceof Error ? err.message : "Grant score failed");
        }
        await new Promise((r) => setTimeout(r, Math.max(duration, 600)));
      } else if (slug === "passport" && meta[idx]?.n === 3) {
        try {
          const inputs = collectCbamScoreInputs();
          const score = await runCbamScore(inputs);
          setCbamScore(score);
        } catch (err) {
          setScoreError(err instanceof Error ? err.message : "CBAM score failed");
        }
        await new Promise((r) => setTimeout(r, Math.max(duration, 600)));
      } else {
        await new Promise((r) => setTimeout(r, duration));
      }

      const elapsed = formatElapsed(Math.round(performance.now() - start));

      if (abortRef.current) break;

      current = current.map((s, j) =>
        j === idx ? { ...s, status: "done", elapsed } : s,
      );
      setStages(current);
    }

    if (!abortRef.current) {
      setComplete(true);
    }
    setRunning(false);
    return current;
  }, [kb, running, stages, slug]);

  return { stages, running, complete, runPipeline, reset, grantScore, cbamScore, scoreError };
}
