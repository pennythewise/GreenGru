import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ChevronRight,
  FileText,
  Layers,
  Plus,
  Ship,
  Trophy,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { AppShell, PageHeader } from "@/components/AppShell";
import { intensityTrend, kpis, submissions } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

function StatCard({
  n, icon: Icon, label, zh, value, unit, delta, tone, footnote,
}: {
  n: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string; zh: string; value: string; unit?: string; delta?: string;
  tone: "ember" | "carbon" | "warning" | "signal";
  footnote?: string;
}) {
  const spark = intensityTrend.map((r) => ({ v: r.measured }));
  const toneClass = { ember: "text-primary", carbon: "text-carbon", warning: "text-warning", signal: "text-signal" }[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      className="panel p-5 relative"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          <Icon className={cn("h-3.5 w-3.5", toneClass)} />
          {label}
        </div>
        <span className="text-[10px] font-mono text-muted-foreground/70">{n} · {zh}</span>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="font-mono text-[32px] font-semibold tracking-tight leading-none">{value}</span>
        {unit && <span className="text-[12px] text-muted-foreground font-mono">{unit}</span>}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className={cn("text-[11.5px] font-mono", toneClass)}>{delta}</span>
        <div className="h-6 w-20">
          <ResponsiveContainer>
            <AreaChart data={spark}>
              <defs>
                <linearGradient id={`sp-${n}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={`var(--color-${tone})`} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={`var(--color-${tone})`} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={`var(--color-${tone})`} strokeWidth={1.5} fill={`url(#sp-${n})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      {footnote && <div className="mt-3 pt-3 border-t border-border text-[11px] text-muted-foreground">{footnote}</div>}
    </motion.div>
  );
}

function StatusPill({ s }: { s: string }) {
  const map: Record<string, string> = {
    Signed: "bg-carbon/10 text-carbon border-carbon/25",
    "Needs input": "bg-warning/10 text-warning border-warning/30",
    Running: "bg-signal/10 text-signal border-signal/30",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] font-mono border", map[s] ?? "bg-muted text-muted-foreground border-border")}>
      {s === "Signed" && <BadgeCheck className="h-3 w-3" />}
      {s === "Needs input" && <AlertTriangle className="h-3 w-3" />}
      {s}
    </span>
  );
}

export function Dashboard() {
  return (
    <AppShell crumb="Dashboard">
      <PageHeader
        n="02"
        zh="总览"
        title="What's done · what needs attention"
        subtitle="Orient a returning operator — the glanceable summary, plus the fastest way back into a stalled pipeline."
        right={
          <Link
            to="/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary text-primary-foreground text-[13px] font-medium ember-glow hover:brightness-110 transition"
          >
            <Plus className="h-4 w-4" /> New submission
          </Link>
        }
      />

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard n="a" zh="提交" icon={Layers} label="Submissions YTD" value={String(kpis.submissionsYtd)} unit="of 47 lifetime" delta="+3 this month" tone="signal" footnote="6 exposed · 4 needs-input · 2 signed today" />
        <StatCard n="b" zh="等级" icon={Trophy} label="Latest CISA grade" value={kpis.cisaGrade} unit="/ A" delta={`gap +${kpis.benchmarkGap}% to B`} tone="warning" footnote="Path P1 lifts C → B in 14 months." />
        <StatCard n="c" zh="风险" icon={Ship} label="CBAM tier · latest" value="Exposed" delta={`€${kpis.netTariff}/t net · 2026`} tone="ember" footnote={`Gross 2034 €${kpis.grossTariff}/t — 40× escalation ahead`} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
        className="panel p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              <FileText className="h-3.5 w-3.5 text-signal" /> Submission history
            </div>
            <h3 className="mt-1 text-base font-semibold tracking-tight">Every row opens its Results screen</h3>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">{submissions.length} of 47</span>
        </div>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-2 pr-3">CN code</th>
                <th className="py-2 pr-3">Product</th>
                <th className="py-2 pr-3 text-right">Tonnes</th>
                <th className="py-2 pr-3">CBAM tier</th>
                <th className="py-2 pr-3">CISA</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-0"></th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {submissions.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-surface-2/60 transition group cursor-pointer">
                  <td className="py-3 pr-3 text-foreground">{s.cn}</td>
                  <td className="py-3 pr-3 text-muted-foreground font-sans">{s.desc}</td>
                  <td className="py-3 pr-3 text-right">{s.tons.toLocaleString()}</td>
                  <td className="py-3 pr-3">
                    <span className={cn(
                      "text-[10.5px] font-mono px-1.5 py-0.5 rounded border",
                      s.cbamTier === "Exposed" && "bg-primary/10 text-primary border-primary/25",
                      s.cbamTier === "High" && "bg-danger/10 text-danger border-danger/25",
                      s.cbamTier === "Marginal" && "bg-warning/10 text-warning border-warning/30",
                      s.cbamTier === "De minimis?" && "bg-carbon/10 text-carbon border-carbon/25",
                    )}>{s.cbamTier}</span>
                  </td>
                  <td className="py-3 pr-3">
                    <span className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded font-semibold text-[11px]",
                      s.grade === "C" && "bg-warning/15 text-warning",
                      s.grade === "D" && "bg-danger/15 text-danger",
                      s.grade === "B" && "bg-carbon/15 text-carbon",
                    )}>{s.grade}</span>
                  </td>
                  <td className="py-3 pr-3">
                    <Link to={s.status === "Needs input" ? "/confirm" : "/results"}>
                      <StatusPill s={s.status} />
                    </Link>
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">{s.date}</td>
                  <td className="py-3 pr-0 text-right">
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <span>Empty state · first-time operator: <Link to="/new" className="text-primary hover:underline">Start your first submission →</Link></span>
          <Link to="/pipeline" className="flex items-center gap-1 hover:text-foreground transition">
            View live pipeline <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </motion.div>

      <footer className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-mono text-muted-foreground border-t border-border/60">
        <div>Every regulated number traceable to cited source · IR (EU) 2025/2621 · Reg (EU) 2023/956 · CISA · PBOC · 工信部联节〔2026〕13号</div>
        <div className="flex items-center gap-1.5">
          <ArrowUpRight className="h-3 w-3" /> Distributed via Baowu / Ansteel supplier program
        </div>
      </footer>
    </AppShell>
  );
}
