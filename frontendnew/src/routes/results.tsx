import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, BadgeCheck, FileCheck2, Info, Sparkles, Trophy, Wind } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar } from "recharts";
import { AppShell, PageHeader } from "@/components/AppShell";
import { cbamPhaseIn, cisaGrades, intensityTrend, kpis } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Results & score · Carbon Passport" },
      { name: "description", content: "CBAM tier, CISA grade, net vs gross tariff — the screen every other output depends on." },
    ],
  }),
  component: Results,
});

const chartColors = {
  ember: "var(--color-ember)", carbon: "var(--color-carbon)",
  signal: "var(--color-signal)", warning: "var(--color-warning)",
  danger: "var(--color-danger)", muted: "var(--color-muted-foreground)",
  grid: "oklch(0.20 0.02 250 / 8%)",
};

function Results() {
  return (
    <AppShell crumb="Results">
      <PageHeader
        n="05"
        zh="评分"
        title="CBAM: exposed · CISA: grade C"
        subtitle="Net tariff is what's actually owed this year. Gross is the 2034 steady-state — never blur the 40× gap between them."
        right={
          <div className="flex gap-2">
            <Link to="/passport" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border bg-card text-[12.5px] font-medium hover:bg-surface-2 transition">
              <FileCheck2 className="h-3.5 w-3.5" /> View passport
            </Link>
            <Link to="/financing" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border bg-card text-[12.5px] font-medium hover:bg-surface-2 transition">
              View financing
            </Link>
            <Link to="/plan" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-[12.5px] font-medium ember-glow hover:brightness-110 transition">
              <Sparkles className="h-3.5 w-3.5" /> View action plan
            </Link>
          </div>
        }
      />

      {/* Two big tier badges */}
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="panel p-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-40"
               style={{ background: "radial-gradient(ellipse 400px 200px at 100% 0%, oklch(0.65 0.19 45 / 15%), transparent 60%)" }} />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">EU CBAM · risk tier</div>
              <span className="text-[10.5px] font-mono text-muted-foreground">gap logic §8.5</span>
            </div>
            <div className="mt-3 flex items-baseline gap-3">
              <div className="text-4xl font-semibold tracking-tight text-primary">Exposed</div>
              <div className="text-[12px] font-mono text-muted-foreground">/ Signed / High / Marginal / De-minimis?</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-primary/25 bg-primary/[0.06] p-3">
                <div className="text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground">Net tariff · this year</div>
                <div className="mt-1 font-mono text-[36px] font-semibold text-primary leading-none">€{kpis.netTariff}<span className="text-[14px] text-muted-foreground">/t</span></div>
                <div className="mt-1.5 text-[11px] font-mono text-muted-foreground">phase-in factor 2.5% applied · 2026</div>
              </div>
              <div className="rounded-lg border border-border bg-surface p-3">
                <div className="text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground">Gross · 2034 steady state</div>
                <div className="mt-1 font-mono text-[24px] text-muted-foreground leading-none">€{kpis.grossTariff}<span className="text-[12px]">/t</span></div>
                <div className="mt-1.5 text-[11px] font-mono text-muted-foreground">fully phased in · not owed today</div>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-2 text-[11.5px] text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>Export tonnage 1,240 t · <span className="text-carbon">de minimis exemption possible, not guaranteed</span> — assessed per EU importer.</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="panel p-6">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">CISA · low-carbon steel</div>
            <span className="text-[10.5px] font-mono text-muted-foreground">E ← → A</span>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <div className="text-4xl font-semibold tracking-tight text-warning">Grade {kpis.cisaGrade}</div>
            <div className="text-[12px] font-mono text-muted-foreground">gap +{kpis.benchmarkGap}% to B</div>
          </div>
          <div className="mt-4 space-y-1.5">
            {cisaGrades.map((g) => {
              const active = kpis.cisaGrade === g.grade;
              return (
                <div key={g.grade} className={cn(
                  "flex items-center gap-3 rounded-md border px-2.5 py-1.5",
                  active ? "border-warning/40 bg-warning/5" : "border-border bg-surface/50",
                )}>
                  <div className={cn(
                    "h-7 w-7 rounded flex items-center justify-center font-display font-bold text-[13px]",
                    g.color === "danger" && "bg-danger/15 text-danger",
                    g.color === "warning" && "bg-warning/15 text-warning",
                    g.color === "carbon" && "bg-carbon/15 text-carbon",
                  )}>{g.grade}</div>
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[12.5px] font-medium">{g.label} {active && <span className="text-[10px] font-mono text-warning ml-1">← you</span>}</div>
                      <div className="text-[10.5px] font-mono text-muted-foreground">≤ {g.max} tCO₂e/t</div>
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground">{active ? kpis.intensity : g.max}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Phase-in chart */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="panel p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              <Trophy className="h-3.5 w-3.5 text-primary" /> CBAM phase-in escalation · 应缴证书比例
            </div>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">
              The <span className="text-gradient-ember">40× jump</span> between 2026 and 2034
            </h2>
          </div>
          <div className="text-[11px] font-mono text-muted-foreground text-right">
            <div>CN 7318 15 88 · hex bolt</div>
            <div className="text-primary">Reg (EU) 2023/956 Art. 31(3)</div>
          </div>
        </div>
        <div className="mt-3 h-64">
          <ResponsiveContainer>
            <ComposedChart data={cbamPhaseIn} margin={{ left: -12, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="cumFillR" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={chartColors.ember} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={chartColors.ember} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="year" stroke={chartColors.muted} tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="l" stroke={chartColors.muted} tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
              <YAxis yAxisId="r" orientation="right" stroke={chartColors.muted} tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12, fontFamily: "var(--font-mono)" }} />
              <Bar yAxisId="r" dataKey="factor" fill={chartColors.signal} radius={[3, 3, 0, 0]} maxBarSize={22} opacity={0.55} />
              <Area yAxisId="l" type="monotone" dataKey="cum" stroke={chartColors.ember} strokeWidth={2} fill="url(#cumFillR)" />
              <Line yAxisId="l" type="monotone" dataKey="costPerT" stroke={chartColors.warning} strokeWidth={2} dot={{ r: 2.5, fill: chartColors.warning }} />
              <ReferenceLine yAxisId="l" x={2026} stroke={chartColors.carbon} strokeDasharray="3 3" label={{ value: "you are here", position: "top", fill: chartColors.carbon, fontSize: 10, fontFamily: "var(--font-mono)" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Intensity vs benchmark */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="panel p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            <Wind className="h-3.5 w-3.5 text-carbon" /> Measured intensity vs benchmark · 7 mo
          </div>
          <div className="text-[10.5px] font-mono text-muted-foreground">tCO₂e per tonne</div>
        </div>
        <div className="mt-3 h-52">
          <ResponsiveContainer>
            <AreaChart data={intensityTrend} margin={{ left: -14, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="measFillR" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={chartColors.carbon} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={chartColors.carbon} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="m" stroke={chartColors.muted} tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }} tickLine={false} axisLine={false} />
              <YAxis stroke={chartColors.muted} tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }} tickLine={false} axisLine={false} domain={[1, 3.8]} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12, fontFamily: "var(--font-mono)" }} />
              <ReferenceLine y={1.37} stroke={chartColors.signal} strokeDasharray="4 3" label={{ value: "EU benchmark 1.37", fill: chartColors.signal, fontSize: 10, position: "insideTopLeft", fontFamily: "var(--font-mono)" }} />
              <ReferenceLine y={3.51} stroke={chartColors.danger} strokeDasharray="4 3" label={{ value: "CN default 3.51", fill: chartColors.danger, fontSize: 10, position: "insideBottomLeft", fontFamily: "var(--font-mono)" }} />
              <Area type="monotone" dataKey="measured" stroke={chartColors.carbon} strokeWidth={2.2} fill="url(#measFillR)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="hairline" />
      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-carbon" /> Zero-gap case renders "already compliant" — routes plan to <span className="text-primary">maintain + verify</span>, not a blank page.</span>
        <Link to="/passport" className="flex items-center gap-1 hover:text-foreground transition">Next: CBAM passport <ArrowRight className="h-3 w-3" /></Link>
      </div>
    </AppShell>
  );
}
