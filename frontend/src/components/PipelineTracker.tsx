// Live six-stage tracker — random per-stage timing, full progress bars, then authorize CTA.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Circle, Loader2, ShieldCheck } from "lucide-react";

import { PipelineStagePanel, type StageDetail } from "@/components/PipelineStagePanel";
import { pipelineStages as stageMeta } from "@/lib/dashboard-data";
import { useLocale } from "@/lib/locale";
import { pipeline as pipelineStr } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

type Status = "pending" | "active" | "done";
type StageRuntime = { status: Status; elapsed: string | null };

function idleRuntime(): StageRuntime[] {
  return stageMeta.map(() => ({ status: "pending", elapsed: null }));
}

/** Random duration per stage (ms) — feels organic, always completes the bar. */
function randomStageMs(): number {
  return 900 + Math.floor(Math.random() * 2100); // 0.9 – 3.0 s
}

function StageProgressBar({ durationMs, stageKey }: { durationMs: number; stageKey: number }) {
  return (
    <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
      <motion.div
        key={stageKey}
        className="h-full bg-primary rounded-full"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: durationMs / 1000, ease: "linear" }}
      />
    </div>
  );
}

export function PipelineTracker({
  running,
  authorized,
  onAuthorize,
  backendStages,
  pipelineError,
}: {
  running: boolean;
  authorized: boolean;
  onAuthorize: () => void;
  backendStages?: StageDetail[] | null;
  pipelineError?: string | null;
}) {
  const [runtime, setRuntime] = useState<StageRuntime[]>(idleRuntime);
  const [pipelineComplete, setPipelineComplete] = useState(false);
  const [activeStage, setActiveStage] = useState(-1);
  const [activeDurationMs, setActiveDurationMs] = useState(0);
  const durationsRef = useRef<number[]>([]);
  const { isZh, t } = useLocale();

  useEffect(() => {
    if (!running) {
      setRuntime(idleRuntime());
      setPipelineComplete(false);
      setActiveStage(-1);
      return;
    }

    let cancelled = false;
    durationsRef.current = stageMeta.map(() => randomStageMs());

    const run = async () => {
      setPipelineComplete(false);
      setRuntime(idleRuntime());

      for (let i = 0; i < stageMeta.length; i++) {
        if (cancelled) return;
        const dur = durationsRef.current[i] ?? 1200;
        setActiveStage(i);
        setActiveDurationMs(dur);
        setRuntime((prev) =>
          prev.map((r, idx) => (idx === i ? { status: "active", elapsed: null } : r)),
        );

        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, dur);
        });
        if (cancelled) return;

        setRuntime((prev) =>
          prev.map((r, idx) =>
            idx === i ? { status: "done", elapsed: `${(dur / 1000).toFixed(1)} s` } : r,
          ),
        );
      }

      if (!cancelled) {
        setActiveStage(-1);
        setPipelineComplete(true);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [running]);

  useEffect(() => {
    if (!authorized || !pipelineComplete) return;
    setRuntime((prev) =>
      prev.map((r, idx) =>
        idx === stageMeta.length - 1 ? { ...r, status: "done", elapsed: r.elapsed ?? "0.4 s" } : r,
      ),
    );
  }, [authorized, pipelineComplete]);

  const showAuthorizeCta = pipelineComplete && !authorized;

  return (
    <>
      {pipelineError && (
        <div className="mb-3 rounded-md border border-danger/40 bg-danger/[0.06] p-2 text-[11px] text-danger">
          {pipelineError}
        </div>
      )}
      <ol className="relative pl-4">
        <span className="absolute left-[15px] top-2 bottom-2 w-px bg-border" aria-hidden />
        {stageMeta.map((s, i) => {
          const r = runtime[i];
          const done = r.status === "done";
          const isActive = r.status === "active";
          const isAuth = s.requiresAuth;
          const backendStage = backendStages?.[i];
          const showBar = isActive && i === activeStage;

          return (
            <motion.li
              key={s.n}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="relative pl-8 pb-5 last:pb-0"
            >
              <span
                className={cn(
                  "absolute left-0 top-0.5 h-6 w-6 rounded-full flex items-center justify-center border-2",
                  done && "bg-carbon/15 border-carbon text-carbon",
                  isActive && "bg-primary/15 border-primary text-primary",
                  !done && !isActive && "bg-surface border-border text-muted-foreground",
                )}
              >
                {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                {isActive && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {!done && !isActive && <Circle className="h-2 w-2 fill-current" />}
              </span>
              <div className="flex items-baseline justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {t(pipelineStr.stage.en, pipelineStr.stage.zh)} {s.n}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground/70">· {s.zh}</span>
                    {isAuth && showAuthorizeCta && (
                      <span className="text-[10px] font-mono text-warning inline-flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> {t(pipelineStr.needsYou.en, pipelineStr.needsYou.zh)}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[13px] font-medium">{isZh ? s.zh : s.key}</div>
                  <div
                    className={cn(
                      "mt-0.5 text-[11px] font-mono",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {isActive && "▸ "}
                    {s.model}
                  </div>
                  {backendStage && (done || isActive) && (
                    <PipelineStagePanel stage={backendStage} isActive={isActive} isDone={done} />
                  )}
                </div>
                <div className="text-[10.5px] font-mono text-muted-foreground shrink-0">
                  {r.elapsed ?? "—"}
                </div>
              </div>
              {showBar && (
                <StageProgressBar durationMs={activeDurationMs} stageKey={i} />
              )}
            </motion.li>
          );
        })}
      </ol>

      <AnimatePresence>
        {showAuthorizeCta && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="mt-4 rounded-md border border-warning/40 bg-warning/[0.06] p-3"
          >
            <div className="text-[12px] font-medium">
              {t(pipelineStr.requiresAuth.en, pipelineStr.requiresAuth.zh)}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Signs the SHA-256 package and uploads to Baowu (demo — no live upstream POST in MVP).
            </p>
            <button
              type="button"
              onClick={onAuthorize}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-warning text-[oklch(0.14_0.02_220)] text-[12px] font-medium hover:brightness-110 transition"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> {t(pipelineStr.authorizeSend.en, pipelineStr.authorizeSend.zh)}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
