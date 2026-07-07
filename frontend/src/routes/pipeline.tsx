import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AlertTriangle, ArrowRight, Check, Circle, CircleDot, Cpu, Loader2, Zap } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { pipelineStages } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline status · Carbon Passport" },
      { name: "description", content: "Live six-stage agent pipeline — legible, resumable, cited." },
    ],
  }),
  component: Pipeline,
});

function Pipeline() {
  const active = pipelineStages.find((s) => s.status === "active");
  return (
    <AppShell crumb="Pipeline">
      <PageHeader
        n="04"
        zh="流水线"
        title="Six stages · legible while it runs"
        subtitle="Every stage persists before the next starts. A DashScope timeout never re-bills finished work."
        right={
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-carbon/30 bg-carbon/5 text-[11.5px] font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-carbon pulse-dot" />
            LIVE · resumable
          </div>
        }
      />

      {/* Conditional banner (04 wireframe: shown only when classifier needs confirmation) */}
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-warning/40 bg-warning/[0.08] p-4 flex items-start gap-3"
      >
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-medium">We need you to confirm one detail</div>
          <div className="mt-0.5 text-[12.5px] text-muted-foreground">Classifier confidence 61% on Flash pass · your hint disagrees. Never a silent override.</div>
        </div>
        <Link
          to="/confirm"
          className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-warning/15 text-warning border border-warning/30 text-[12px] font-medium hover:bg-warning/25 transition"
        >
          Resolve <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </motion.div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        {/* Vertical tracker */}
        <div className="panel p-6">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-4">
            <Zap className="h-3.5 w-3.5 text-primary" /> Stage tracker · S-0417
          </div>
          <ol className="relative pl-4">
            <span className="absolute left-[15px] top-2 bottom-2 w-px bg-border" aria-hidden />
            {pipelineStages.map((s, i) => {
              const done = s.status === "done";
              const active = s.status === "active";
              return (
                <motion.li
                  key={s.n}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                  className="relative pl-8 pb-6 last:pb-0"
                >
                  <span className={cn(
                    "absolute left-0 top-0.5 h-6 w-6 rounded-full flex items-center justify-center border-2",
                    done && "bg-carbon/15 border-carbon text-carbon",
                    active && "bg-primary/15 border-primary text-primary",
                    !done && !active && "bg-card border-border text-muted-foreground",
                  )}>
                    {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    {active && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {!done && !active && <Circle className="h-2 w-2 fill-current" />}
                  </span>
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10.5px] font-mono text-muted-foreground">STAGE {s.n}</span>
                        <span className="text-[10.5px] font-mono text-muted-foreground/70">· {s.zh}</span>
                      </div>
                      <div className="mt-0.5 text-[14px] font-medium">{s.key}</div>
                      <div className={cn(
                        "mt-1 text-[12px] font-mono",
                        active ? "text-primary" : "text-muted-foreground",
                      )}>
                        {active && "▸ "}{s.model}
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground shrink-0">
                      {s.elapsed ?? "—"}
                    </div>
                  </div>
                  {active && (
                    <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden shimmer">
                      <div className="h-full w-2/5 bg-primary rounded-full" />
                    </div>
                  )}
                </motion.li>
              );
            })}
          </ol>
        </div>

        {/* Side info */}
        <div className="space-y-3">
          <div className="panel p-5">
            <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Current stage detail</div>
            <div className="mt-2 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              <span className="text-[15px] font-medium">Classifying CN code</span>
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

          <Link
            to="/results"
            className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-md border border-border bg-card text-[13px] font-medium hover:bg-surface-2 transition"
          >
            Skip to results (demo) <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
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
