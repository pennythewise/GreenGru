import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
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
  ExternalLink,
  Factory,
  FileText,
  Leaf,
  Maximize2,
  Minimize2,
  Plus,
  Radio,
  Ship,
  Zap,
} from "lucide-react";
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
import type { CSSProperties } from "react";

import { AppShell, CitationFooter, PageHeader } from "@/components/AppShell";
import {
  company,
  factoryEquipment,
  factoryFloor,
  submissions,
} from "@/lib/dashboard-data";
import {
  CBAM_2026_QUARTERLY,
  CBAM_PRICE_SOURCE,
  formatEurPrice,
  latestPublishedCbamPrice,
  priorPublishedCbamPrice,
} from "@/lib/cbam-certificate-prices";
import { fetchIotHistory, type IotReading } from "@/lib/api";
import {
  electricityEmissionsTco2e,
  gridEmissionFactorTPerMWh,
  loadGreenPowerTradingChoice,
  saveGreenPowerTradingChoice,
  type GreenPowerTradingChoice,
} from "@/lib/cisa-grid-ef";
import { useDashboardSnapshot } from "@/hooks/useDashboardSnapshot";
import { useLocale } from "@/lib/locale";
import { crumbs, dashboardPage, dashboardSections } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

/* ---------- Official CBAM certificate prices (Commission) ---------- */
function CbamPriceCards() {
  const { isZh, t } = useLocale();
  const latest = latestPublishedCbamPrice();
  const prior = priorPublishedCbamPrice();
  const upcoming = CBAM_2026_QUARTERLY.filter((r) => r.priceEur == null);
  const delta =
    latest.priceEur != null && prior?.priceEur != null
      ? latest.priceEur - prior.priceEur
      : null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
          <Ship className="h-3.5 w-3.5 text-teal" />
          {t(dashboardSections.cbamPrices.en, dashboardSections.cbamPrices.zh)}
        </div>
        <a
          href={CBAM_PRICE_SOURCE.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-mono text-primary hover:underline"
        >
          {t(dashboardSections.openCommission.en, dashboardSections.openCommission.zh)}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel p-5 relative overflow-hidden"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-carbon" />
          <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground pl-1">
            {t(dashboardSections.latestQuarter.en, dashboardSections.latestQuarter.zh)}
          </div>
          <div className="mt-2 pl-1 text-[13px] font-medium">
            {isZh ? latest.quarterZh : latest.quarter}
          </div>
          <div className="mt-3 pl-1 font-mono text-[28px] font-semibold tabular-nums leading-none">
            {latest.priceEur != null ? formatEurPrice(latest.priceEur) : "—"}
            <span className="ml-1.5 text-[12px] font-normal text-muted-foreground">
              {t(dashboardSections.pricePerT.en, dashboardSections.pricePerT.zh)}
            </span>
          </div>
          <div className="mt-3 pl-1 text-[11px] font-mono text-muted-foreground">
            {t(dashboardSections.publishedOn.en, dashboardSections.publishedOn.zh)} ·{" "}
            {isZh ? latest.publishedOnLabelZh : latest.publishedOnLabelEn}
          </div>
          {delta != null && (
            <div
              className={cn(
                "mt-2 pl-1 text-[12px] font-mono",
                delta <= 0 ? "text-carbon" : "text-warning",
              )}
            >
              {t(dashboardSections.qoQChange.en, dashboardSections.qoQChange.zh)}{" "}
              {delta <= 0 ? "↓" : "↑"} €{formatEurPrice(Math.abs(delta))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="panel p-5 relative overflow-hidden"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal" />
          <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground pl-1">
            {t(dashboardSections.priorQuarter.en, dashboardSections.priorQuarter.zh)}
          </div>
          {prior ? (
            <>
              <div className="mt-2 pl-1 text-[13px] font-medium">
                {isZh ? prior.quarterZh : prior.quarter}
              </div>
              <div className="mt-3 pl-1 font-mono text-[28px] font-semibold tabular-nums leading-none">
                {prior.priceEur != null ? formatEurPrice(prior.priceEur) : "—"}
                <span className="ml-1.5 text-[12px] font-normal text-muted-foreground">
                  {t(dashboardSections.pricePerT.en, dashboardSections.pricePerT.zh)}
                </span>
              </div>
              <div className="mt-3 pl-1 text-[11px] font-mono text-muted-foreground">
                {t(dashboardSections.publishedOn.en, dashboardSections.publishedOn.zh)} ·{" "}
                {isZh ? prior.publishedOnLabelZh : prior.publishedOnLabelEn}
              </div>
            </>
          ) : (
            <p className="mt-4 pl-1 text-[12px] text-muted-foreground">—</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel p-5 relative overflow-hidden"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold" />
          <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground pl-1">
            {t(dashboardSections.upcomingCadence.en, dashboardSections.upcomingCadence.zh)}
          </div>
          <ul className="mt-3 pl-1 space-y-2">
            {upcoming.map((row) => (
              <li key={row.quarter} className="flex items-baseline justify-between gap-2 text-[12px]">
                <span className="font-medium">{isZh ? row.quarterZh : row.quarter}</span>
                <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                  {t(dashboardSections.pending.en, dashboardSections.pending.zh)} ·{" "}
                  {isZh ? row.publishedOnLabelZh : row.publishedOnLabelEn}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 pl-1 pt-3 border-t border-border text-[11px] text-muted-foreground leading-relaxed">
            {t(dashboardSections.weeklyFrom2027.en, dashboardSections.weeklyFrom2027.zh)}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- Plant → process → machine IoT monitor ---------- */
function IotProcessMachineMonitor() {
  const { isZh, t } = useLocale();
  const [selectedKey, setSelectedKey] = useState(factoryFloor[0]?.key ?? "melting");

  const plantPowerKw = useMemo(
    () => factoryFloor.reduce((s, r) => s + r.power, 0),
    [],
  );
  const plantCarbon = useMemo(
    () => factoryFloor.reduce((s, r) => s + r.carbon, 0),
    [],
  );
  const selected = factoryFloor.find((r) => r.key === selectedKey) ?? factoryFloor[0];
  const machines = selected ? factoryEquipment[selected.key] ?? [] : [];

  // Illustrative energy saving vs a fixed baseline (demo only — financing evidence).
  const plantBaselineKw = 1280;
  const savingPct = ((plantBaselineKw - plantPowerKw) / plantBaselineKw) * 100;

  return (
    <div className="panel p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
          <Radio className="h-3.5 w-3.5 text-teal" />
          {t(dashboardSections.iotMonitor.en, dashboardSections.iotMonitor.zh)}
        </div>
        <div className="flex items-center gap-1 text-[10.5px] font-mono text-carbon">
          <span className="h-1.5 w-1.5 rounded-full bg-carbon pulse-dot" />
          {t(dashboardSections.live.en, dashboardSections.live.zh)} · {company.nameEn}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-surface/40 px-3 py-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {t(dashboardSections.plantWide.en, dashboardSections.plantWide.zh)}
          </div>
          <div className="mt-1 font-mono text-[20px] font-semibold tabular-nums">
            {plantPowerKw}
            <span className="text-[11px] font-normal text-muted-foreground ml-1">kW</span>
          </div>
          <div className="mt-1 text-[11px] font-mono text-carbon">
            {t(dashboardSections.energySaving.en, dashboardSections.energySaving.zh)}{" "}
            {savingPct >= 0 ? "↓" : "↑"} {Math.abs(savingPct).toFixed(1)}%
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface/40 px-3 py-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {t(dashboardSections.intensityT.en, dashboardSections.intensityT.zh)}
          </div>
          <div className="mt-1 font-mono text-[20px] font-semibold tabular-nums">
            {plantCarbon.toFixed(2)}
            <span className="text-[11px] font-normal text-muted-foreground ml-1">tCO₂e/t Σ</span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {factoryFloor.length} {isZh ? "道工序" : "processes"}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface/40 px-3 py-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {t(dashboardSections.byProcess.en, dashboardSections.byProcess.zh)}
          </div>
          <div className="mt-1 font-mono text-[20px] font-semibold tabular-nums">
            {selected ? (isZh ? selected.zh : selected.stage) : "—"}
          </div>
          <div className="mt-1 text-[11px] font-mono text-muted-foreground">
            {selected?.power ?? 0} kW · {selected?.carbon.toFixed(2) ?? "—"} tCO₂e/t
            {selected?.status === "warn" ? (
              <span className="text-warning ml-1.5">{isZh ? "关注" : "attention"}</span>
            ) : null}
          </div>
        </div>
      </div>

      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          {t(dashboardSections.byProcess.en, dashboardSections.byProcess.zh)}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {factoryFloor.map((stage) => (
            <button
              key={stage.key}
              type="button"
              onClick={() => setSelectedKey(stage.key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[12px] transition",
                selectedKey === stage.key
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border bg-surface/40 text-muted-foreground hover:text-foreground",
              )}
            >
              {stage.status === "warn" && <CircleAlert className="h-3 w-3 text-warning" />}
              {isZh ? stage.zh : stage.stage}
              <span className="font-mono text-[10px] opacity-70">{stage.power} kW</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {t(dashboardSections.byMachine.en, dashboardSections.byMachine.zh)}
            {selected && (
              <span className="normal-case tracking-normal ml-1.5">
                · {isZh ? selected.zh : selected.stage}
              </span>
            )}
          </div>
          {!selected && (
            <span className="text-[11px] text-muted-foreground">
              {t(dashboardSections.selectProcess.en, dashboardSections.selectProcess.zh)}
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-2 pr-3 text-left">{isZh ? "机台" : "Machine"}</th>
                <th className="py-2 px-2 text-left">{isZh ? "作用" : "Role"}</th>
                <th className="py-2 px-2 text-right">
                  {t(dashboardSections.powerKw.en, dashboardSections.powerKw.zh)}
                </th>
                <th className="py-2 pl-2 text-right">
                  {t(dashboardSections.intensityT.en, dashboardSections.intensityT.zh)}
                </th>
              </tr>
            </thead>
            <tbody>
              {machines.map((m) => {
                const kw = selected ? (selected.power * m.powerShare) / 100 : 0;
                const tco2 = selected ? (selected.carbon * m.carbonShare) / 100 : 0;
                return (
                  <tr key={m.key} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-1.5 font-medium">
                        {isZh ? m.zh : m.name}
                        {m.hotspot && (
                          <span className="text-[9px] font-mono px-1 py-0.5 rounded border border-warning/40 bg-warning/10 text-warning">
                            {t(dashboardSections.hotspotMachine.en, dashboardSections.hotspotMachine.zh)}
                          </span>
                        )}
                      </div>
                      {!isZh && (
                        <div className="text-[10px] font-mono text-muted-foreground">{m.zh}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-muted-foreground text-[11.5px] max-w-[220px]">
                      {m.role}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                      {kw.toFixed(1)}
                      <span className="text-muted-foreground text-[10px] ml-0.5">kW</span>
                    </td>
                    <td className="py-2.5 pl-2 text-right font-mono tabular-nums">
                      {tco2.toFixed(3)}
                      <span className="text-muted-foreground text-[10px] ml-0.5">t/t</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

type ChartPoint = {
  label: string;
  power_w: number;
  kwh: number;
  tco2e: number;
  vrms: number;
  irms: number;
};

function formatTickTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso.slice(-8, -3) || iso.slice(-5);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return "—";
  }
}

function LiveShopfloorCharts() {
  const { isZh, t } = useLocale();
  const [history, setHistory] = useState<IotReading[]>([]);
  const [greenTrading, setGreenTrading] = useState<GreenPowerTradingChoice>(() =>
    typeof window !== "undefined" ? loadGreenPowerTradingChoice() : "no",
  );

  const setChoice = useCallback((c: GreenPowerTradingChoice) => {
    setGreenTrading(c);
    saveGreenPowerTradingChoice(c);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const rows = await fetchIotHistory("demo-hengfeng", 48);
      if (!cancelled) setHistory(rows);
    };
    void tick();
    const id = window.setInterval(() => void tick(), 4000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const chartData: ChartPoint[] = useMemo(
    () =>
      history.map((r) => {
        const power =
          r.power_w ??
          (r.voltage != null && r.current != null ? r.voltage * r.current : 0);
        return {
          label: formatTickTime(r.ingested_at || r.reading_timestamp),
          power_w: power,
          kwh: r.kwh,
          tco2e: electricityEmissionsTco2e(r.kwh, greenTrading),
          vrms: r.voltage ?? 0,
          irms: r.current ?? 0,
        };
      }),
    [history, greenTrading],
  );

  const latest = chartData.length ? chartData[chartData.length - 1] : null;
  const ef = gridEmissionFactorTPerMWh(greenTrading);
  const empty = chartData.length < 2;

  const tipStyle = {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    fontSize: 11,
    fontFamily: "var(--font-mono)",
    color: "var(--popover-foreground)",
  };

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="panel p-5 lg:col-span-1 flex flex-col">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-teal" />
            {t(dashboardSections.livePower.en, dashboardSections.livePower.zh)}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-carbon">
            <span className={cn("h-1.5 w-1.5 rounded-full", empty ? "bg-muted-foreground/40" : "bg-carbon pulse-dot")} />
            {empty ? "…" : t(dashboardSections.live.en, dashboardSections.live.zh)}
          </div>
        </div>
        {latest && (
          <div className="mt-2 font-mono text-[22px] font-semibold leading-none tabular-nums">
            {latest.power_w.toFixed(4)}
            <span className="text-[12px] text-muted-foreground font-normal ml-1">W</span>
          </div>
        )}
        <div className="mt-2 flex-1 min-h-[140px]">
          {empty ? (
            <div className="h-full flex items-center justify-center text-[11px] font-mono text-muted-foreground">
              {t(dashboardSections.waitingEsp32.en, dashboardSections.waitingEsp32.zh)}
            </div>
          ) : (
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="powerFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-teal)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--color-teal)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  minTickGap={32}
                  tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  width={40}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }}
                  formatter={(v) => [`${Number(v).toFixed(4)} W`, "Power"]}
                  contentStyle={tipStyle}
                />
                <Area
                  type="monotone"
                  dataKey="power_w"
                  stroke="var(--color-teal)"
                  strokeWidth={2}
                  fill="url(#powerFill)"
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="mt-1.5 text-[10.5px] text-muted-foreground font-mono">
          ESP32 → /api/iot · {chartData.length} {t(dashboardSections.liveSamples.en, dashboardSections.liveSamples.zh)}
          {latest ? ` · V ${latest.vrms.toFixed(2)} · I ${latest.irms.toFixed(4)}` : ""}
        </div>
      </div>

      <div className="panel p-5 lg:col-span-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            <Leaf className="h-3.5 w-3.5 text-carbon" />
            {t(dashboardSections.liveGridEmissions.en, dashboardSections.liveGridEmissions.zh)}
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setChoice("no")}
              className={cn(
                "px-2 py-0.5 rounded border text-[10px] font-mono transition",
                greenTrading === "no"
                  ? "border-carbon/40 bg-carbon/10 text-carbon"
                  : "border-border text-muted-foreground hover:bg-surface-2",
              )}
            >
              0.5568
            </button>
            <button
              type="button"
              onClick={() => setChoice("yes")}
              className={cn(
                "px-2 py-0.5 rounded border text-[10px] font-mono transition",
                greenTrading === "yes"
                  ? "border-carbon/40 bg-carbon/10 text-carbon"
                  : "border-border text-muted-foreground hover:bg-surface-2",
              )}
            >
              0.5942
            </button>
          </div>
        </div>
        {latest && (
          <div className="mt-2 font-mono text-[22px] font-semibold leading-none tabular-nums text-carbon">
            {latest.tco2e.toFixed(8)}
            <span className="text-[12px] text-muted-foreground font-normal ml-1">t</span>
          </div>
        )}
        <div className="mt-2 flex-1 min-h-[140px]">
          {empty ? (
            <div className="h-full flex items-center justify-center text-[11px] font-mono text-muted-foreground">
              {t(dashboardSections.waitingEsp32.en, dashboardSections.waitingEsp32.zh)}
            </div>
          ) : (
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="tco2eFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-carbon)" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="var(--color-carbon)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  minTickGap={32}
                  tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  width={48}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => v.toExponential(1)}
                  tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }}
                  formatter={(v) => [`${Number(v).toFixed(8)} t`, "Grid tCO₂e"]}
                  contentStyle={tipStyle}
                />
                <Area
                  type="monotone"
                  dataKey="tco2e"
                  stroke="var(--color-carbon)"
                  strokeWidth={2}
                  fill="url(#tco2eFill)"
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        {latest ? (
          <div className="mt-1.5 text-[10.5px] font-mono text-muted-foreground leading-snug">
            kWh {latest.kwh.toFixed(8)} · EF {ef}
          </div>
        ) : null}
      </div>

      <EmissionsDonut />
    </div>
  );
}

function EmissionsDonut() {
  const { t } = useLocale();
  const { snapshot } = useDashboardSnapshot();
  const { emissionsBreakdown } = snapshot;
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
        <CircleCheck className="h-3.5 w-3.5 text-carbon" />{" "}
        {t(dashboardSections.emissionsSplit.en, dashboardSections.emissionsSplit.zh)}
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
              {emissionsBreakdown.map((e) => (
                <Cell key={e.key} fill={e.color} />
              ))}
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
  );
}

/* ---------- Process matrix ---------- */
function MatrixCell({ s }: { s: string }) {
  const cls = s === "ok" ? "bg-carbon/70" : s === "warn" ? "bg-warning/80" : "bg-danger/80";
  return <span className={cn("inline-block h-3.5 w-3.5 rounded-sm", cls)} />;
}

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

function StatusPill({ s }: { s: string }) {
  const { t } = useLocale();
  const map: Record<string, string> = {
    Signed: "bg-carbon/10 text-carbon border-carbon/30",
    "Needs input": "bg-warning/10 text-warning border-warning/40",
  };
  const label =
    s === "Signed"
      ? t(dashboardSections.signed.en, dashboardSections.signed.zh)
      : s === "Needs input"
        ? t(dashboardSections.needsInput.en, dashboardSections.needsInput.zh)
        : s;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] font-mono border",
        map[s] ?? "bg-muted text-muted-foreground border-border",
      )}
    >
      {s === "Signed" && <BadgeCheck className="h-3 w-3" />}
      {s === "Needs input" && <CircleAlert className="h-3 w-3" />}
      {label}
    </span>
  );
}

/* ============================================================ */

export function Dashboard() {
  const { t, isZh } = useLocale();
  const { snapshot } = useDashboardSnapshot();
  const { processMatrix } = snapshot;
  const routeIcon = (r: string) => (r === "Loan" ? Banknote : r === "Grant" ? Leaf : Ship);

  const [factoryExpanded, setFactoryExpanded] = useState(false);
  useEffect(() => {
    if (!factoryExpanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFactoryExpanded(false);
    };
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

      <CbamPriceCards />

      <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground -mb-1">
        <Radio className="h-3.5 w-3.5 text-carbon" />
        {isZh ? "实时计量 · 融资证据" : "Live metering · financing evidence"}
      </div>

      <IotProcessMachineMonitor />

      <LiveShopfloorCharts />

      <div className="grid lg:grid-cols-[1.15fr_1fr] gap-4">
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              <FileText className="h-3.5 w-3.5 text-teal" />{" "}
              {t(dashboardSections.processMatrix.en, dashboardSections.processMatrix.zh)}
            </div>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3 text-left">
                    {t(dashboardSections.stage.en, dashboardSections.stage.zh)}
                  </th>
                  <th className="py-2 px-2 text-center">
                    {t(dashboardSections.energy.en, dashboardSections.energy.zh)}
                  </th>
                  <th className="py-2 px-2 text-center">
                    {t(dashboardSections.intensity.en, dashboardSections.intensity.zh)}
                  </th>
                  <th className="py-2 px-2 text-center">
                    {t(dashboardSections.metering.en, dashboardSections.metering.zh)}
                  </th>
                  <th className="py-2 px-2 text-center">
                    {t(dashboardSections.audit.en, dashboardSections.audit.zh)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {processMatrix.map((row) => (
                  <tr key={row.stage} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-3">
                      <div className="font-medium">{isZh ? row.zh : row.stage}</div>
                      {!isZh && (
                        <div className="text-[10px] font-mono text-muted-foreground">{row.zh}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <MatrixCell s={row.energy} />
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <MatrixCell s={row.intensity} />
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <MatrixCell s={row.metering} />
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <MatrixCell s={row.audit} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center gap-3 text-[10.5px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-carbon/70" />{" "}
              {t(dashboardSections.ok.en, dashboardSections.ok.zh)}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-warning/80" />{" "}
              {t(dashboardSections.attention.en, dashboardSections.attention.zh)}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-danger/80" />{" "}
              {t(dashboardSections.hotspot.en, dashboardSections.hotspot.zh)}
            </span>
          </div>
        </div>

        {factoryExpanded && (
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={() => setFactoryExpanded(false)}
          />
        )}
        <div
          className={cn(
            "panel p-5 flex flex-col",
            factoryExpanded ? "fixed inset-6 z-50 shadow-2xl" : "relative",
          )}
        >
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              <Factory className="h-3.5 w-3.5 text-teal" />{" "}
              {t(dashboardSections.factoryFloor.en, dashboardSections.factoryFloor.zh)}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[10.5px] font-mono text-carbon">
                <span className="h-1.5 w-1.5 rounded-full bg-carbon pulse-dot" />{" "}
                {t(dashboardSections.live.en, dashboardSections.live.zh)}
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
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="panel p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              <FileText className="h-3.5 w-3.5 text-teal" />{" "}
              {t(dashboardSections.yourSubmissions.en, dashboardSections.yourSubmissions.zh)}
            </div>
            <h3 className="mt-1 text-base font-semibold tracking-tight">
              {t(dashboardSections.onePagePerRoute.en, dashboardSections.onePagePerRoute.zh)}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">{submissions.length} / 47</span>
        </div>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-2 pr-3">{t(dashboardSections.route.en, dashboardSections.route.zh)}</th>
                <th className="py-2 pr-3">
                  {t(dashboardSections.descriptor.en, dashboardSections.descriptor.zh)}
                </th>
                <th className="py-2 pr-3 text-right">
                  {t(dashboardSections.tonnes.en, dashboardSections.tonnes.zh)}
                </th>
                <th className="py-2 pr-3">{t(dashboardSections.tier.en, dashboardSections.tier.zh)}</th>
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
                  <tr
                    key={s.id}
                    className="border-b border-border last:border-0 hover:bg-surface-2/60 transition group cursor-pointer"
                  >
                    <td className="py-3 pr-3">
                      <span className="inline-flex items-center gap-1.5 text-[11.5px] px-1.5 py-0.5 rounded border border-border bg-surface">
                        <RIcon className="h-3 w-3 text-teal" /> {s.route}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-muted-foreground font-sans">
                      {s.desc}
                      {s.cn !== "—" && (
                        <span className="ml-2 text-[10.5px] font-mono text-muted-foreground/70">
                          CN {s.cn}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-3 text-right">{s.tons ? s.tons.toLocaleString() : "—"}</td>
                    <td className="py-3 pr-3">
                      <span
                        className={cn(
                          "text-[10.5px] font-mono px-1.5 py-0.5 rounded border",
                          s.tier === "Exposed" && "bg-warning/10 text-warning border-warning/30",
                          s.tier === "High" && "bg-danger/10 text-danger border-danger/30",
                          s.tier === "Marginal" && "bg-warning/10 text-warning border-warning/30",
                          s.tier === "Low-risk" && "bg-carbon/10 text-carbon border-carbon/30",
                          s.tier === "Tier 2" && "bg-teal/10 text-teal border-teal/30",
                        )}
                      >
                        {s.tier}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <Link to={href} search={{ tab: "form" }}>
                        <StatusPill s={s.status} />
                      </Link>
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
          <span>
            {t(dashboardSections.firstTime.en, dashboardSections.firstTime.zh)}{" "}
            <Link to="/entry" className="text-primary hover:underline">
              {t(dashboardSections.talkCopilot.en, dashboardSections.talkCopilot.zh)}
            </Link>
          </span>
          <Link to="/new" className="flex items-center gap-1 hover:text-foreground transition">
            {t(dashboardSections.startNew.en, dashboardSections.startNew.zh)}{" "}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </motion.div>

      <CitationFooter extra="PBOC 2025 Green Finance Catalogue · GB/T 36132 · CISA App. B.3" />
      <div className="pb-2 flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
        <ArrowUpRight className="h-3 w-3" /> Distributed via Baowu supplier program
      </div>
    </AppShell>
  );
}
