// Live six-stage tracker, reused on the New submission page (right column) and
// the full Pipeline status page. Stays idle (all pending, no timers) until the
// `running` prop flips true — the parent only does that after a document is
// uploaded and the operator hits Submit, so nothing animates before then.
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, Circle, Loader2, ShieldCheck } from "lucide-react";

import { pipelineStages as stageMeta } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

type Status = "pending" | "active" | "done";
type StageRuntime = { status: Status; elapsed: string | null };

// Simulated per-stage durations (ms) for stages 1-5. Stage 6 (Authorize) has no
// duration — it stays "active" until the operator clicks Authorize & send.
const DURATIONS_MS = [700, 650, 1100, 850, 500];

function idleRuntime(): StageRuntime[] {
  return stageMeta.map(() => ({ status: "pending", elapsed: null }));
}

export function PipelineTracker({
  running,
  authorized,
  onAuthorize,
}: {
  running: boolean;
  authorized: boolean;
  onAuthorize: () => void;
}) {
  const [runtime, setRuntime] = useState<StageRuntime[]>(idleRuntime);

  useEffect(() => {
    if (!running) {
      setRuntime(idleRuntime());
      return;
    }
    let cancelled = false;
    let i = 0;
    const step = () => {
      if (cancelled) return;
      setRuntime((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: "active" } : r)));
      const isLast = i === stageMeta.length - 1;
      if (isLast) return; // final stage waits for manual authorization
      const dur = DURATIONS_MS[i] ?? 600;
      setTimeout(() => {
        if (cancelled) return;
        setRuntime((prev) =>
          prev.map((r, idx) => (idx === i ? { status: "done", elapsed: `${(dur / 1000).toFixed(1)} s` } : r)),
        );
        i += 1;
        step();
      }, dur);
    };
    step();
    return () => { cancelled = true; };
  }, [running]);

  useEffect(() => {
    if (!authorized) return;
    setRuntime((prev) =>
      prev.map((r, idx) => (idx === stageMeta.length - 1 ? { status: "done", elapsed: "0.4 s" } : r)),
    );
  }, [authorized]);

  const authIndex = stageMeta.length - 1;
  const authActive = runtime[authIndex]?.status === "active";

  return (
    <>
    <ol className="relative pl-4">
      <span className="absolute left-[15px] top-2 bottom-2 w-px bg-border" aria-hidden />
      {stageMeta.map((s, i) => {
        const r = runtime[i];
        const done = r.status === "done";
        const isActive = r.status === "active";
        const isAuth = s.requiresAuth;
        return (
          <motion.li
            key={s.n}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className="relative pl-8 pb-5 last:pb-0"
          >
            <span className={cn(
              "absolute left-0 top-0.5 h-6 w-6 rounded-full flex items-center justify-center border-2",
              done && "bg-carbon/15 border-carbon text-carbon",
              isActive && "bg-primary/15 border-primary text-primary",
              !done && !isActive && "bg-surface border-border text-muted-foreground",
            )}>
              {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              {isActive && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {!done && !isActive && <Circle className="h-2 w-2 fill-current" />}
            </span>
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground">STAGE {s.n}</span>
                  <span className="text-[10px] font-mono text-muted-foreground/70">· {s.zh}</span>
                  {isAuth && isActive && !authorized && (
                    <span className="text-[10px] font-mono text-warning inline-flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> needs you
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-[13px] font-medium">{s.key}</div>
                <div className={cn("mt-0.5 text-[11px] font-mono", isActive ? "text-primary" : "text-muted-foreground")}>
                  {isActive && "▸ "}{s.model}
                </div>
              </div>
              <div className="text-[10.5px] font-mono text-muted-foreground shrink-0">{r.elapsed ?? "—"}</div>
            </div>
            {isActive && !isAuth && (
              <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden shimmer">
                <div className="h-full w-2/5 bg-primary rounded-full" />
              </div>
            )}
          </motion.li>
        );
      })}
    </ol>
    {/* Docked below the tracker (not nested under the Stage 6 row) so it reads as
        its own call-to-action once the stage list finishes running. */}
    {authActive && !authorized && (
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-md border border-warning/40 bg-warning/[0.06] p-3"
      >
        <div className="text-[12px] font-medium">Requires your authorization</div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Only stage that leaves your systems — uploads the signed package to Baowu/Ansteel.
        </p>
        <button
          onClick={onAuthorize}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-warning text-[oklch(0.14_0.02_220)] text-[12px] font-medium hover:brightness-110 transition"
        >
          <ShieldCheck className="h-3.5 w-3.5" /> Authorize & send
        </button>
      </motion.div>
    )}
    </>
  );
}
