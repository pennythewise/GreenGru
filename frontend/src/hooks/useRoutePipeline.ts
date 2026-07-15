import { useCallback, useRef, useState } from "react";
import { routeStrip } from "@/lib/dashboard-data";

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

function initialStages(kb: string): PipelineStage[] {
  return routeStrip(kb).map((s) => ({
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

export function useRoutePipeline(kb: string) {
  const [stages, setStages] = useState<PipelineStage[]>(() => initialStages(kb));
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const abortRef = useRef(false);

  const reset = useCallback(() => {
    abortRef.current = true;
    setStages(
      routeStrip(kb).map((s) => ({
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
  }, [kb]);

  const runPipeline = useCallback(async (): Promise<PipelineStage[]> => {
    if (running) return stages;
    abortRef.current = false;
    setRunning(true);
    setComplete(false);

    const meta = routeStrip(kb);
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
      await new Promise((r) => setTimeout(r, duration));
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
  }, [kb, running, stages]);

  return { stages, running, complete, runPipeline, reset };
}
