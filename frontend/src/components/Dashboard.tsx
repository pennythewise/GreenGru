import { lazy, Suspense, useEffect, useState } from "react";
import { ClientOnly, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  BadgeCheck,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleDot,
  Factory,
  FileText,
  Leaf,
  Maximize2,
  Minimize2,
  Plus,
  Ship,
  Zap,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { CSSProperties } from "react";

import { AppShell, CitationFooter, PageHeader } from "@/components/AppShell";
import {
  emissionsBreakdown,
  factorySync,
  processMatrix,
  ratioSliders,
  routeGrades,
  submissions,
  tierGauge,
} from "@/lib/dashboard-data";
import { useLocale } from "@/lib/locale";
import { crumbs, dashboardPage, dashboardSections } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

/* ---------- Grade card (CISA pattern) ---------- */
function GradeCard({ r }: { r: (typeof routeGrades)[number] }) {
  const { isZh, t } = useLocale();
  const gradeTone = r.tone === "carbon" ? "text-carbon border-carbon/40 bg-carbon/10"
                  : r.tone === "warning" ? "text-warning border-warning/40 bg-warning/10"
                  : "text-gold border-gold/40 bg-gold/10";
  const routeHref = r.key === "loan" ? "/loan" : r.key === "grant" ? "/grant" : "/passport";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      className="panel p-5 relative overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">{isZh ? r.zh : r.label}</div>
          {!isZh && <div className="text-[10px] font-mono text-muted-foreground/70">{r.zh}</div>}
        </div>
        <span className={cn("inline-flex h-14 w-14 items-center justify-center rounded-xl border font-display font-bold text-[32px] leading-none", gradeTone)}>
          {r.grade}
        </span>
      </div>
      <div className="mt-4 text-[13px] font-medium">{isZh ? (r.statusZh ?? r.status) : r.status}</div>
      <div className="mt-1 text-[11.5px] font-mono text-muted-foreground">{isZh ? (r.gapLabelZh ?? r.gapLabel) : r.gapLabel}</div>
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-[10.5px] font-mono text-muted-foreground truncate pr-2">{r.kb}</span>
        <Link to={routeHref} className="text-primary hover:brightness-125 text-[11.5px] font-mono inline-flex items-center gap-1">
          {t(dashboardPage.open.en, dashboardPage.open.zh)} <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </motion.div>
  );
}

/* ---------- Slider bar (grant rubric levers) ---------- */
function RatioSlider({ s }: { s: (typeof ratioSliders)[number] }) {
  const { isZh } = useLocale();
  const pct = Math.min(100, (s.value / (s.target * 1.25)) * 100);
  const targetPct = Math.min(100, (s.target / (s.target * 1.25)) * 100);
  const good = s.value >= s.target;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-[12.5px]">{isZh ? s.zh : s.label}</span>
          {!isZh && <span className="ml-1.5 text-[10.5px] font-mono text-muted-foreground/80">{s.zh}</span>}
        </div>
        <div className="font-mono text-[13px]">
          <span className={good ? "text-carbon" : "text-warning"}>{s.value.toFixed(1)}{s.unit}</span>
          <span className="text-muted-foreground/70"> / {s.target}{s.unit}</span>
        </div>
      </div>
      <div className="mt-2 h-2 rounded-full bg-muted/60 relative overflow-hidden">
        <div className={cn("absolute inset-y-0 left-0 rounded-full", good ? "bg-carbon" : "bg-warning")} style={{ width: `${pct}%` }} />
        <div className="absolute top-0 bottom-0 w-px bg-foreground/50" style={{ left: `${targetPct}%` }} />
      </div>
    </div>
  );
}

/* ---------- Semicircular gauge (CISA speedometer) ---------- */
function TierGauge() {
  const pct = tierGauge.value / 100;
  const angle = -90 + pct * 180; // -90 → 90
  return (
    <div className="relative w-[240px] h-[130px] mx-auto">
      <svg viewBox="0 0 200 110" className="w-full h-full">
        <defs>
          <linearGradient id="arcG" x1="0" x2="1">
            <stop offset="0" stopColor="var(--color-danger)" />
            <stop offset="0.5" stopColor="var(--color-warning)" />
            <stop offset="1" stopColor="var(--color-carbon)" />
          </linearGradient>
        </defs>
        <path d="M 15 100 A 85 85 0 0 1 185 100" fill="none" stroke="url(#arcG)" strokeWidth="14" strokeLinecap="round" />
        <g transform={`rotate(${angle} 100 100)`}>
          <line x1="100" y1="100" x2="100" y2="30" stroke="var(--color-gold)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="100" cy="100" r="6" fill="var(--color-gold)" />
        </g>
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <div className="font-mono text-[28px] font-semibold text-gold leading-none">{tierGauge.value}</div>
        <div className="text-[10.5px] font-mono text-muted-foreground mt-0.5">{tierGauge.label} · {tierGauge.zh} {tierGauge.nextTier}</div>
      </div>
    </div>
  );
}

/* ---------- Process matrix ---------- */
function MatrixCell({ s }: { s: string }) {
  const cls = s === "ok" ? "bg-carbon/70" : s === "warn" ? "bg-warning/80" : "bg-danger/80";
  return <span className={cn("inline-block h-3.5 w-3.5 rounded-sm", cls)} />;
}

/* ---------- 3D factory floor (client-only — three.js can't render on the server) ---------- */
const FactoryScene = lazy(() =>
  import("@/components/FactoryScene").then((m) => ({ default: m.FactoryScene })),
);

function FactorySceneFallback() {
  const { t } = useLocale();
  return (
    <div className="h-[400px] rounded-lg border border-border bg-surface/40 flex items-center justify-center">
      <span className="text-[11px] font-mono text-muted-foreground animate-pulse">
        {t(dashboardSections.loadingFactory.en, dashboardSections.loadingFactory.zh)}
      </span>
    </div>
  );
}

/* ---------- Status pill ---------- */
function StatusPill({ s }: { s: string }) {
  const { t } = useLocale();
  const map: Record<string, string> = {
    Signed: "bg-carbon/10 text-carbon border-carbon/30",
    "Needs input": "bg-warning/10 text-warning border-warning/40",
  };
  const label = s === "Signed"
    ? t(dashboardSections.signed.en, dashboardSections.signed.zh)
    : s === "Needs input"
      ? t(dashboardSections.needsInput.en, dashboardSections.needsInput.zh)
      : s;
  return (
    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] font-mono border", map[s] ?? "bg-muted text-muted-foreground border-border")}>
      {s === "Signed" && <BadgeCheck className="h-3 w-3" />}
      {s === "Needs input" && <CircleAlert className="h-3 w-3" />}
      {label}
    </span>
  );
}

/* ============================================================ */

export function Dashboard() {
  const { t, isZh } = useLocale();
  const routeIcon = (r: string) =>
    r === "Loan" ? Banknote : r === "Grant" ? Leaf : Ship;

  const [factoryExpanded, setFactoryExpanded] = useState(false);
  useEffect(() => {
    if (!factoryExpanded) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFactoryExpanded(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [factoryExpanded]);

  return (
    <AppShell crumb={t(crumbs.dashboard.en, crumbs.dashboard.zh)}>
      <PageHeader
        n="02"
        zh="总览"
        title={dashboardPage.title.en}
        titleZh={dashboardPage.title.zh}
        subtitle={dashboardPage.subtitle.en}
        subtitleZh={dashboardPage.subtitle.zh}
        right={
          <Link
            to="/entry"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary text-primary-foreground text-[13px] font-medium teal-glow hover:brightness-110 transition"
          >
            <Plus className="h-4 w-4" /> {t(dashboardSections.copilotBtn.en, dashboardSections.copilotBtn.zh)}
          </Link>
        }
      />

      {/* Three route grade cards — CISA pattern */}
      <div className="grid md:grid-cols-3 gap-4">
        {routeGrades.map((r) => <GradeCard key={r.key} r={r} />)}
      </div>

      {/* Row: gauge + sliders + donut */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            <CircleDot className="h-3.5 w-3.5 text-gold" /> {t(dashboardSections.distanceTier.en, dashboardSections.distanceTier.zh)}
          </div>
          <div className="mt-4"><TierGauge /></div>
          <div className="mt-2 text-[11.5px] text-muted-foreground text-center">
            {t(dashboardSections.tierUnlock.en(32), dashboardSections.tierUnlock.zh(32))}{" "}
            <span className="text-carbon">{isZh ? "B 级 — 深绿" : "Tier B — 深绿"}</span>
            {isZh ? "（补贴评分）" : " on the grant rubric."}
          </div>
        </div>

        <div className="panel p-5 space-y-4">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-teal" /> {t(dashboardSections.grantLevers.en, dashboardSections.grantLevers.zh)}
          </div>
          {ratioSliders.map((s) => <RatioSlider key={s.key} s={s} />)}
          <div className="pt-1 text-[11px] text-muted-foreground">
            {t(dashboardSections.sliderNote.en, dashboardSections.sliderNote.zh)}
          </div>
        </div>

        <div className="panel p-5">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            <CircleCheck className="h-3.5 w-3.5 text-carbon" /> {t(dashboardSections.emissionsSplit.en, dashboardSections.emissionsSplit.zh)}
          </div>
          <div className="mt-2 h-[140px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={emissionsBreakdown}
                  dataKey="value"
                  innerRadius={40}
                  outerRadius={62}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {emissionsBreakdown.map((e) => <Cell key={e.key} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1 text-[11.5px] font-mono">
            {emissionsBreakdown.map((e) => (
              <li key={e.key} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm" style={{ background: e.color } as CSSProperties} />
                  <span className="text-muted-foreground">{e.label}</span>
                </span>
                <span>{e.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Row: process matrix + live factory panel */}
      <div className="grid lg:grid-cols-[1.15fr_1fr] gap-4">
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              <FileText className="h-3.5 w-3.5 text-teal" /> {t(dashboardSections.processMatrix.en, dashboardSections.processMatrix.zh)}
            </div>
            <span className="text-[10.5px] font-mono text-muted-foreground">CISA · {isZh ? "运营过程边界" : "Operational Process Boundary"}</span>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3 text-left">{t(dashboardSections.stage.en, dashboardSections.stage.zh)}</th>
                  <th className="py-2 px-2 text-center">{t(dashboardSections.energy.en, dashboardSections.energy.zh)}</th>
                  <th className="py-2 px-2 text-center">{t(dashboardSections.intensity.en, dashboardSections.intensity.zh)}</th>
                  <th className="py-2 px-2 text-center">{t(dashboardSections.metering.en, dashboardSections.metering.zh)}</th>
                  <th className="py-2 px-2 text-center">{t(dashboardSections.audit.en, dashboardSections.audit.zh)}</th>
                </tr>
              </thead>
              <tbody>
                {processMatrix.map((row) => (
                  <tr key={row.stage} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-3">
                      <div className="font-medium">{isZh ? row.zh : row.stage}</div>
                      {!isZh && <div className="text-[10px] font-mono text-muted-foreground">{row.zh}</div>}
                    </td>
                    <td className="py-2.5 px-2 text-center"><MatrixCell s={row.energy} /></td>
                    <td className="py-2.5 px-2 text-center"><MatrixCell s={row.intensity} /></td>
                    <td className="py-2.5 px-2 text-center"><MatrixCell s={row.metering} /></td>
                    <td className="py-2.5 px-2 text-center"><MatrixCell s={row.audit} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center gap-3 text-[10.5px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-carbon/70" /> {t(dashboardSections.ok.en, dashboardSections.ok.zh)}</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-warning/80" /> {t(dashboardSections.attention.en, dashboardSections.attention.zh)}</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-danger/80" /> {t(dashboardSections.hotspot.en, dashboardSections.hotspot.zh)}</span>
          </div>
        </div>

        {factoryExpanded && (
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={() => setFactoryExpanded(false)} />
        )}
        <div className={cn(
          "panel p-5 flex flex-col",
          factoryExpanded ? "fixed inset-6 z-50 shadow-2xl" : "relative",
        )}>
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              <Factory className="h-3.5 w-3.5 text-teal" /> {t(dashboardSections.factoryFloor.en, dashboardSections.factoryFloor.zh)}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[10.5px] font-mono text-carbon">
                <span className="h-1.5 w-1.5 rounded-full bg-carbon pulse-dot" /> {t(dashboardSections.live.en, dashboardSections.live.zh)}
              </div>
              <button
                type="button"
                onClick={() => setFactoryExpanded((e) => !e)}
                aria-label={factoryExpanded ? "Collapse" : "Expand to full screen"}
                className="h-6 w-6 rounded-md border border-border bg-surface flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2 transition"
              >
                {factoryExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </button>
            </div>
          </div>

          <div className={cn("mt-3", factoryExpanded && "flex-1 min-h-0")}>
            <ClientOnly fallback={<FactorySceneFallback />}>
              <Suspense fallback={<FactorySceneFallback />}>
                <FactoryScene fullscreen={factoryExpanded} />
              </Suspense>
            </ClientOnly>
          </div>

          <div className="mt-3 pt-3 border-t border-border text-[11px] font-mono text-muted-foreground shrink-0">
            <div>{t(dashboardSections.lastSync.en, dashboardSections.lastSync.zh)} <span className="text-foreground">{factorySync.lastSync}</span> · {t(dashboardSections.syncNote.en, dashboardSections.syncNote.zh)}</div>
            <div className="mt-1">{t(dashboardSections.feeds.en, dashboardSections.feeds.zh)} {factorySync.downstream.join(" · ")}</div>
          </div>
        </div>
      </div>

      {/* Submissions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
        className="panel p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              <FileText className="h-3.5 w-3.5 text-teal" /> {t(dashboardSections.yourSubmissions.en, dashboardSections.yourSubmissions.zh)}
            </div>
            <h3 className="mt-1 text-base font-semibold tracking-tight">{t(dashboardSections.onePagePerRoute.en, dashboardSections.onePagePerRoute.zh)}</h3>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">{submissions.length} / 47</span>
        </div>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-2 pr-3">{t(dashboardSections.route.en, dashboardSections.route.zh)}</th>
                <th className="py-2 pr-3">{t(dashboardSections.descriptor.en, dashboardSections.descriptor.zh)}</th>
                <th className="py-2 pr-3 text-right">{t(dashboardSections.tonnes.en, dashboardSections.tonnes.zh)}</th>
                <th className="py-2 pr-3">{t(dashboardSections.tier.en, dashboardSections.tier.zh)}</th>
                <th className="py-2 pr-3">{t(dashboardSections.grade.en, dashboardSections.grade.zh)}</th>
                <th className="py-2 pr-3">{t(dashboardSections.status.en, dashboardSections.status.zh)}</th>
                <th className="py-2 pr-3">{t(dashboardSections.date.en, dashboardSections.date.zh)}</th>
                <th className="py-2 pr-0"></th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {submissions.map((s) => {
                const RIcon = routeIcon(s.route);
                const href = s.route === "Loan" ? "/loan" : s.route === "Grant" ? "/grant" : "/passport";
                return (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-surface-2/60 transition group cursor-pointer">
                    <td className="py-3 pr-3">
                      <span className="inline-flex items-center gap-1.5 text-[11.5px] px-1.5 py-0.5 rounded border border-border bg-surface">
                        <RIcon className="h-3 w-3 text-teal" /> {s.route}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-muted-foreground font-sans">
                      {s.desc}
                      {s.cn !== "—" && <span className="ml-2 text-[10.5px] font-mono text-muted-foreground/70">CN {s.cn}</span>}
                    </td>
                    <td className="py-3 pr-3 text-right">{s.tons ? s.tons.toLocaleString() : "—"}</td>
                    <td className="py-3 pr-3">
                      <span className={cn(
                        "text-[10.5px] font-mono px-1.5 py-0.5 rounded border",
                        s.tier === "Exposed" && "bg-warning/10 text-warning border-warning/30",
                        s.tier === "High" && "bg-danger/10 text-danger border-danger/30",
                        s.tier === "Marginal" && "bg-warning/10 text-warning border-warning/30",
                        s.tier === "Low-risk" && "bg-carbon/10 text-carbon border-carbon/30",
                        s.tier === "Tier 2" && "bg-teal/10 text-teal border-teal/30",
                      )}>{s.tier}</span>
                    </td>
                    <td className="py-3 pr-3">
                      <span className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded font-semibold text-[11px]",
                        s.grade === "B" && "bg-carbon/15 text-carbon",
                        s.grade === "C" && "bg-gold/15 text-gold",
                        s.grade === "D" && "bg-danger/15 text-danger",
                      )}>{s.grade}</span>
                    </td>
                    <td className="py-3 pr-3">
                      <Link to={href}><StatusPill s={s.status} /></Link>
                    </td>
                    <td className="py-3 pr-3 text-muted-foreground">{s.date}</td>
                    <td className="py-3 pr-0 text-right">
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition inline" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <span>{t(dashboardSections.firstTime.en, dashboardSections.firstTime.zh)} <Link to="/entry" className="text-primary hover:underline">{t(dashboardSections.talkCopilot.en, dashboardSections.talkCopilot.zh)}</Link></span>
          <Link to="/new" className="flex items-center gap-1 hover:text-foreground transition">
            {t(dashboardSections.startNew.en, dashboardSections.startNew.zh)} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </motion.div>

      <CitationFooter extra="PBOC 2025 Green Finance Catalogue · GB/T 36132" />
      <div className="pb-2 flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
        <ArrowUpRight className="h-3 w-3" /> Distributed via Baowu supplier program
      </div>
    </AppShell>
  );
}
