import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CheckCircle2, Radio, ShoppingBag, Sparkles, Wrench } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { paths } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Action plan · Carbon Passport" },
      { name: "description", content: "1–3 concrete next moves, cheapest path first — from the cost-aware ranker, never a generic subsidy list." },
    ],
  }),
  component: ActionPlan,
});

const icons = [Radio, ShoppingBag, Wrench];

function ActionPlan() {
  return (
    <AppShell crumb="Action plan">
      <PageHeader
        n="08"
        zh="行动方案"
        title="Turn the score into 1–3 concrete next moves"
        subtitle="Cheapest path first, unless the gap needs a heavier fix. The top card is recommended — tint, not border."
      />

      <div className="grid md:grid-cols-3 gap-4">
        {paths.map((p, i) => {
          const Icon = icons[i];
          const recommended = i === 0;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.4 }}
              className={cn(
                "relative rounded-2xl p-6 overflow-hidden",
                recommended ? "bg-carbon/[0.08] border border-carbon/30 carbon-glow" : "panel",
              )}
            >
              {recommended && (
                <span className="absolute top-4 right-4 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-carbon/20 text-carbon border border-carbon/40">
                  recommended
                </span>
              )}
              <div className="flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground">
                <span className={cn("font-semibold", recommended && "text-carbon")}>PATH {i + 1}</span>
                <span className="text-border">·</span>
                <span>{p.zh}</span>
              </div>
              <div className={cn(
                "mt-3 h-11 w-11 rounded-lg flex items-center justify-center",
                recommended ? "bg-carbon/15 text-carbon" : "bg-surface-2 text-muted-foreground",
              )}>
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <h3 className="mt-3 text-[17px] font-semibold tracking-tight leading-tight">{p.name}</h3>
              <div className={cn("mt-1 text-[11.5px] font-mono", recommended ? "text-carbon" : "text-muted-foreground")}>{p.range}</div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <MiniStat k="Capex" v={p.cost < 1e5 ? `¥${p.cost.toLocaleString()}` : `¥${(p.cost / 1e6).toFixed(1)}M`} />
                <MiniStat k="Saves" v={p.saving ? `${p.saving} t/yr` : "—"} />
                <MiniStat k="¥ / tCO₂e" v={p.costPerT ? `¥${p.costPerT.toLocaleString()}` : "—"} accent={recommended} />
                <MiniStat k="Payback" v={p.payback ? `${p.payback} yr` : "—"} />
              </div>

              <p className="mt-3 text-[12px] text-muted-foreground leading-relaxed">{p.detail}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Zero-gap fallback */}
      <div className="panel p-5">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-carbon/15 text-carbon flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Zero-gap case · fallback</div>
            <div className="mt-1 text-[15px] font-medium">Already at or below EU benchmark · maintain + verify</div>
            <p className="mt-1 text-[12.5px] text-muted-foreground max-w-2xl">
              If you're already at the top CISA tier and below the benchmark, this becomes a single "maintain and verify" card — get measured data verified so the advantage is provable. Never a blank page.
            </p>
          </div>
        </div>
      </div>

      <div className="hairline" />
      <div className="flex items-center gap-2 text-[11.5px] font-mono text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        Ranked by €/tCO₂e closed · deterministic cost ranker (§8.9). LLM writes prose around the numbers it did not compute.
      </div>
    </AppShell>
  );
}

function MiniStat({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="rounded-md bg-card border border-border px-2.5 py-1.5">
      <div className="text-[9.5px] font-mono uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className={cn("mt-0.5 text-[13.5px] font-mono font-medium", accent && "text-carbon")}>{v}</div>
    </div>
  );
}
