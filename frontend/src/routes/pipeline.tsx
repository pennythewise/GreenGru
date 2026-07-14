import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AlertTriangle, ArrowRight, Check, Circle, CircleDot, Cpu, Loader2, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { pipelineStages } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline status · GreenGru" },
      { name: "description", content: "Live six-stage pipeline — legible while it runs, resumable, cited." },
    ],
  }),
  component: Pipeline,
});

function Pipeline() {
  const [authorized, setAuthorized] = useState(false);
  const active = pipelineStages.find((s) => s.status === "active");
  const authStage = pipelineStages[5];
  const complete = authorized;

  return (
    <AppShell crumb="Pipeline">
      <PageHeader
        n="05"
        zh="流水线"
        title="Six stages · legible while it runs"
        subtitle="Every stage persists before the next starts. A DashScope timeout never re-bills finished work."
        right={
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-carbon/30 bg-carbon/5 text-[11.5px] font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-carbon pulse-dot" /> LIVE · resumable
          </div>
        }
      />

      {/* Manual confirm banner — reused pattern (Section 4 in brief) */}
      {!complete && (
        <motion.div
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-warning/40 bg-warning/[0.08] p-4 flex items-start gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] font-medium">We need you to confirm one detail</div>
            <div className="mt-0.5 text-[12.5px] text-muted-foreground">Classifier confidence 61% on Flash pass · your route hint disagrees. Never a silent override.</div>
          </div>
          <Link
            to="/entry"
            className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-warning/15 text-warning border border-warning/40 text-[12px] font-medium hover:bg-warning/25 transition"
          >
            Resolve <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      )}

      {complete ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="panel-lift p-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-carbon/15 text-carbon carbon-glow mx-auto">
            <Check className="h-6 w-6" strokeWidth={3} />
          </div>
          <h2 className="mt-4 text-[22px] font-semibold tracking-tight">Submitted to Upstream</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">Sent to Baowu/Ansteel partner system at 09:52:14 CST · package S-0417 · 6 stages · 4.2 s total.</p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link to="/" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-[13px] font-medium teal-glow hover:brightness-110 transition">
              Back to dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
          <div className="panel p-6">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-4">
              <Zap className="h-3.5 w-3.5 text-teal" /> Stage tracker · S-0417
            </div>
            <ol className="relative pl-4">
              <span className="absolute left-[15px] top-2 bottom-2 w-px bg-border" aria-hidden />
              {pipelineStages.map((s, i) => {
                const done = s.status === "done";
                const isActive = s.status === "active";
                const isAuth = s.requiresAuth;
                return (
                  <motion.li
                    key={s.n}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="relative pl-8 pb-6 last:pb-0"
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
                          <span className="text-[10.5px] font-mono text-muted-foreground">STAGE {s.n}</span>
                          <span className="text-[10.5px] font-mono text-muted-foreground/70">· {s.zh}</span>
                          {isAuth && (
                            <span className="text-[10px] font-mono text-warning inline-flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3" /> operator confirm
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 text-[14px] font-medium">{s.key}</div>
                        <div className={cn("mt-1 text-[12px] font-mono", isActive ? "text-primary" : "text-muted-foreground")}>
                          {isActive && "▸ "}{s.model}
                        </div>
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground shrink-0">{s.elapsed ?? "—"}</div>
                    </div>
                    {isActive && (
                      <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden shimmer">
                        <div className="h-full w-2/5 bg-primary rounded-full" />
                      </div>
                    )}
                    {isAuth && (
                      <div className="mt-3 rounded-md border border-warning/40 bg-warning/[0.06] p-3">
                        <div className="text-[12px] font-medium">Requires your authorization</div>
                        <p className="mt-1 text-[11.5px] text-muted-foreground">
                          This is the only stage that leaves your systems — it uploads the signed package to the Baowu/Ansteel partner API.
                        </p>
                        <button
                          onClick={() => setAuthorized(true)}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-warning text-[oklch(0.14_0.02_220)] text-[12px] font-medium hover:brightness-110 transition"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" /> Authorize & send
                        </button>
                      </div>
                    )}
                  </motion.li>
                );
              })}
            </ol>
          </div>

          <div className="space-y-3">
            <div className="panel p-5">
              <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Current stage detail</div>
              <div className="mt-2 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                <span className="text-[15px] font-medium">{active?.key}</span>
              </div>
              <div className="mt-1 text-[12.5px] font-mono text-primary">▸ {active?.model}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11.5px] font-mono">
                <MiniStat k="Region" v="Beijing" />
                <MiniStat k="Thinking mode" v="off" />
                <MiniStat k="Cache hit" v="82%" />
                <MiniStat k="Tokens so far" v="4,120" />
              </div>
            </div>

            <div className="panel p-5">
              <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Resumability</div>
              <div className="mt-2 text-[13px]">
                Every stage persists its output <span className="text-carbon">before</span> the next starts.
              </div>
              <ul className="mt-3 space-y-1.5 text-[12px] text-muted-foreground">
                <li className="flex items-start gap-2"><CircleDot className="h-3 w-3 mt-0.5 text-carbon shrink-0" /> A DashScope timeout resumes from the last completed stage.</li>
                <li className="flex items-start gap-2"><CircleDot className="h-3 w-3 mt-0.5 text-carbon shrink-0" /> Finished work is never re-billed.</li>
                <li className="flex items-start gap-2"><CircleDot className="h-3 w-3 mt-0.5 text-carbon shrink-0" /> Manual confirm pauses at the last checkpoint.</li>
              </ul>
            </div>

            <button
              onClick={() => setAuthorized(true)}
              disabled={!authStage}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-md border border-border bg-surface text-[13px] font-medium hover:bg-surface-2 transition"
            >
              Skip ahead (demo) <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function MiniStat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md border border-border bg-surface p-2">
      <div className="text-muted-foreground uppercase text-[10px] tracking-wider">{k}</div>
      <div className="mt-0.5 text-foreground">{v}</div>
    </div>
  );
}
