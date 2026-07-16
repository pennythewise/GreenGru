import { lazy, Suspense, useMemo, useState } from "react";
import { ClientOnly, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Building2,
  Code2,
  Globe2,
  Leaf,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { UpstreamShell, PageHeader, CitationFooter } from "@/components/AppShell";
import { facilities, facilityStatuses } from "@/lib/upstream-map-data";
import {
  scope3Daily,
  scope3Trend,
  gradeDistribution,
  portfolioSummary,
  suppliers,
  watchlist,
  type CisaGrade,
  type Trend,
} from "@/lib/upstream-data";
import { cn } from "@/lib/utils";

/* ---------- 3D network map (client-only — three.js can't render on the server) ---------- */
const UpstreamNetworkMap = lazy(() =>
  import("@/components/UpstreamNetworkMap").then((m) => ({ default: m.UpstreamNetworkMap })),
);

function NetworkMapFallback() {
  return (
    <div className="h-[420px] rounded-lg border border-border bg-surface/40 flex items-center justify-center">
      <span className="text-[11px] font-mono text-muted-foreground animate-pulse">
        Loading network map · 网络地图加载中…
      </span>
    </div>
  );
}

/* ---------- KPI card (compact — sits 2x2 beside the trend chart) ---------- */
function KpiCard({ icon: Icon, label, zh, value, sub }: { icon: typeof Users; label: string; zh: string; value: string; sub?: string }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
        <Icon className="h-3 w-3 text-teal" /> {label}
        <span className="text-[9.5px] text-muted-foreground/70">· {zh}</span>
      </div>
      <div className="mt-2 font-mono text-[21px] font-semibold leading-none">{value}</div>
      {sub && <div className="mt-1 text-[10.5px] text-muted-foreground leading-snug">{sub}</div>}
    </div>
  );
}

/* ---------- Scope 3 trend chart (single series — title names it, no legend) ---------- */
type TrendMode = "weekly" | "monthly" | "yearly";

const selectCls =
  "h-6 rounded-md border border-border bg-surface px-1.5 text-[10.5px] font-mono text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

function Scope3TrendChart() {
  const [mode, setMode] = useState<TrendMode>("monthly");
  const [month, setMonth] = useState("Mar");

  const data = useMemo(() => {
    if (mode === "yearly") return scope3Trend.map((m) => ({ label: m.month, tco2e: m.tco2e }));
    const days = scope3Daily.filter((d) => d.month === month);
    const window = mode === "weekly" ? days.slice(-7) : days;
    return window.map((d) => ({ label: `${d.month} ${d.day}`, tco2e: d.tco2e }));
  }, [mode, month]);

  return (
    <div className="panel p-5 flex flex-col">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
          <Leaf className="h-3.5 w-3.5 text-carbon" /> Scope 3 trend · 范围三趋势
        </div>
        <div className="flex items-center gap-1.5">
          {mode !== "yearly" && (
            <select value={month} onChange={(e) => setMonth(e.target.value)} className={selectCls} aria-label="Month">
              {scope3Trend.map((m) => <option key={m.month} value={m.month}>{m.month}</option>)}
            </select>
          )}
          <select value={mode} onChange={(e) => setMode(e.target.value as TrendMode)} className={selectCls} aria-label="Range">
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>
      <div className="mt-3 flex-1 min-h-[132px]">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="scope3Fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-carbon)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--color-carbon)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="label"
              axisLine={false} tickLine={false}
              minTickGap={28}
              tickFormatter={(l: string) => (mode === "monthly" ? l.split(" ")[1] : l)}
              tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
            />
            <YAxis
              width={42}
              domain={["dataMin - 6000", "dataMax + 6000"]}
              axisLine={false} tickLine={false}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
            />
            <Tooltip
              cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }}
              formatter={(v) => [`${Number(v).toLocaleString()} tCO2e / yr`, "Verified Scope 3"]}
              contentStyle={{
                background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8,
                fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--popover-foreground)",
              }}
            />
            <Area
              type="monotone" dataKey="tco2e"
              stroke="var(--color-carbon)" strokeWidth={2}
              fill="url(#scope3Fill)" dot={false} activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1.5 text-[10.5px] text-muted-foreground">
        Annualized run-rate, verified Cat. 10 · overall decline as supplier grades improve.
      </div>
    </div>
  );
}

/* ---------- Grade + tier tone helpers (CISA pattern, matches Dashboard.tsx) ---------- */
function gradeToneClasses(grade: CisaGrade) {
  if (grade === "A" || grade === "B") return "bg-carbon/15 text-carbon";
  if (grade === "C") return "bg-gold/15 text-gold";
  if (grade === "D") return "bg-warning/15 text-warning";
  return "bg-danger/15 text-danger";
}

function tierToneClasses(tier: string) {
  if (tier === "Low-risk") return "bg-carbon/10 text-carbon border-carbon/30";
  if (tier === "Marginal") return "bg-gold/10 text-gold border-gold/30";
  if (tier === "Exposed") return "bg-warning/10 text-warning border-warning/30";
  return "bg-danger/10 text-danger border-danger/30";
}

function TrendIndicator({ trend }: { trend: Trend }) {
  if (trend === "up") return <span className="inline-flex items-center gap-1 text-danger"><TrendingUp className="h-3.5 w-3.5" /> up</span>;
  if (trend === "down") return <span className="inline-flex items-center gap-1 text-carbon"><TrendingDown className="h-3.5 w-3.5" /> down</span>;
  return <span className="inline-flex items-center gap-1 text-muted-foreground">— flat</span>;
}

/* ============================================================ */

export function UpstreamDashboard() {
  return (
    <UpstreamShell crumb="Portfolio">
      <PageHeader
        n="B·1"
        zh="供应商组合"
        title="Portfolio view across downstream suppliers"
        subtitle="Aggregate CISA tier and verified totals only — no raw invoice or intake data is ever visible in this view."
        right={
          <Link
            to="/cn/articles/full-api-documentation"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-primary/30 bg-primary/5 text-[11px] font-mono text-primary hover:brightness-110"
          >
            <Code2 className="h-3.5 w-3.5" /> Integration API
          </Link>
        }
      />

      {/* KPI 2x2 + exposure trend */}
      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-4">
        <div className="grid grid-cols-2 gap-4">
          <KpiCard icon={Users} label="Suppliers" zh="供应商" value={String(portfolioSummary.totalSuppliers)} sub="onboarded to GreenGru" />
          <KpiCard icon={Leaf} label="Scope 3" zh="范围三" value={portfolioSummary.totalScope3Tco2e.toLocaleString()} sub="tCO2e/yr · verified · Cat. 10" />
          <KpiCard icon={Wallet} label="Exposure" zh="总敞口" value={`€${(portfolioSummary.totalExposureEur / 1000).toFixed(0)}k`} sub="est. annual CBAM cost, current yr" />
          <KpiCard icon={AlertTriangle} label="Watchlist" zh="关注名单" value={String(portfolioSummary.watchlistCount)} sub="grade D/E or trending up" />
        </div>
        <Scope3TrendChart />
      </div>

      {/* Processing & distribution network map */}
      <div className="panel p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            <Globe2 className="h-3.5 w-3.5 text-teal" /> Processing & distribution network · 加工配送网络
          </div>
          <span className="text-[10.5px] font-mono text-muted-foreground">{facilities.length} facilities · scroll to zoom · click a marker</span>
        </div>
        <div className="mt-3">
          <ClientOnly fallback={<NetworkMapFallback />}>
            <Suspense fallback={<NetworkMapFallback />}>
              <UpstreamNetworkMap />
            </Suspense>
          </ClientOnly>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10.5px] font-mono text-muted-foreground">
          {Object.entries(facilityStatuses).map(([key, st]) => (
            <span key={key} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: st.color }} />
              {st.label} · {st.zh}
            </span>
          ))}
        </div>
      </div>

      {/* Grade distribution + watchlist */}
      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-4">
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-teal" /> CISA grade distribution
          </div>
          <div className="mt-2 h-[160px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  dataKey="value"
                  innerRadius={44}
                  outerRadius={68}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {gradeDistribution.map((g) => <Cell key={g.key} fill={g.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1 text-[11.5px] font-mono">
            {gradeDistribution.map((g) => (
              <li key={g.key} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm" style={{ background: g.color }} />
                  <span className="text-muted-foreground">{g.label}</span>
                </span>
                <span>{g.value} supplier{g.value === 1 ? "" : "s"}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel p-5">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" /> Watchlist · 关注名单
          </div>
          <ul className="mt-3 space-y-2.5">
            {watchlist.map((w) => (
              <li key={w.id} className="flex items-start justify-between gap-3 pb-2.5 border-b border-border last:border-0 last:pb-0">
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate">{w.companyNameEn}</div>
                  <div className="text-[10.5px] font-mono text-muted-foreground/80 truncate">{w.companyNameZh}</div>
                </div>
                <span className="shrink-0 text-[11px] text-warning text-right max-w-[55%]">{w.reason}</span>
              </li>
            ))}
            {watchlist.length === 0 && (
              <li className="text-[12.5px] text-muted-foreground">No suppliers currently flagged.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Supplier scorecard table */}
      <div className="panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 text-teal" /> Supplier scorecard
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">{suppliers.length} suppliers</span>
        </div>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-2 pr-3">Company</th>
                <th className="py-2 pr-3">CN code</th>
                <th className="py-2 pr-3 text-center">Grade</th>
                <th className="py-2 pr-3">Risk tier</th>
                <th className="py-2 pr-3 text-right">
                  Annual exposure
                  <span className="block normal-case tracking-normal text-[9px] text-muted-foreground/70">€/yr · est. CBAM tariff, current yr</span>
                </th>
                <th className="py-2 pr-3 text-right">
                  Verified emissions
                  <span className="block normal-case tracking-normal text-[9px] text-muted-foreground/70">tCO2e/yr · Scope 3 Cat. 10</span>
                </th>
                <th className="py-2 pr-3">Trend</th>
                <th className="py-2 pr-0">Last verified</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {suppliers.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-3">
                    <div className="font-sans text-[12.5px] font-medium">{s.companyNameEn}</div>
                    <div className="text-[10.5px] text-muted-foreground/80">{s.companyNameZh}</div>
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">{s.cnCode}</td>
                  <td className="py-3 pr-3 text-center">
                    <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded font-semibold text-[11px]", gradeToneClasses(s.cisaGrade))}>
                      {s.cisaGrade}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <span className={cn("text-[10.5px] font-mono px-1.5 py-0.5 rounded border", tierToneClasses(s.cbamRiskTier))}>{s.cbamRiskTier}</span>
                  </td>
                  <td className="py-3 pr-3 text-right">€{s.annualExposureEur.toLocaleString()}</td>
                  <td className="py-3 pr-3 text-right">{s.verifiedEmissionsTco2e.toLocaleString()}</td>
                  <td className="py-3 pr-3 text-[11.5px]"><TrendIndicator trend={s.trend} /></td>
                  <td className="py-3 pr-0 text-muted-foreground">{s.lastVerifiedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel p-4 flex items-start gap-2.5">
        <ShieldCheck className="h-4 w-4 text-carbon shrink-0 mt-0.5" />
        <p className="text-[12px] text-muted-foreground leading-snug">
          Aggregated compliance data only — verified by GreenGru. No raw invoice, production, or intake
          data is accessible in this view; access is enforced at the database role level, not just in
          this application.
        </p>
      </div>

      <CitationFooter extra="PRD §10 · baowu_dashboard_role RLS" />
    </UpstreamShell>
  );
}
