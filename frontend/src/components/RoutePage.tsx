import { useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CircleAlert,
  Download,
  FileText,
  Info,
  Loader2,
  Play,
  Radio,
  Upload,
  Wand2,
} from "lucide-react";
import { AppShell, CitationFooter, PageHeader } from "@/components/AppShell";
import { CbamWorkbookPanel } from "@/components/CbamWorkbookPanel";
import { useRouteChecklist } from "@/hooks/useRouteChecklist";
import { useRoutePipeline } from "@/hooks/useRoutePipeline";
import {
  advisoryCards,
  company,
  docChecklists,
  gaps,
  kpis,
  routePages,
} from "@/lib/dashboard-data";
import { downloadRoutePreviewPdf } from "@/lib/api";
import { advanceRouteFlow, getFlowProgress, getRouteLabel } from "@/lib/route-flow";
import { useLocale } from "@/lib/locale";
import { pipeline, routeFlow, routePage } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

type Slug = keyof typeof routePages;

/* ---------- Doc checklist ---------- */
function Checklist({
  slug,
  items,
  doneCount,
  markUploaded,
}: {
  slug: Slug;
  items: ReturnType<typeof useRouteChecklist>["items"];
  doneCount: number;
  markUploaded: ReturnType<typeof useRouteChecklist>["markUploaded"];
}) {
  const c = docChecklists[slug];
  const { t, isZh } = useLocale();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingItem, setPendingItem] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const displayTitle = isZh && "titleZh" in c && c.titleZh ? c.titleZh : c.title;

  function openUpload(itemName: string) {
    setPendingItem(itemName);
    fileRef.current?.click();
  }

  async function handleFile(file: File | undefined) {
    if (!file || !pendingItem) return;
    setUploading(true);
    await new Promise((r) => setTimeout(r, 350));
    markUploaded(pendingItem, file);
    setUploading(false);
    setPendingItem(null);
  }

  return (
    <div className="panel p-5">
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.png,.jpg,.jpeg"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
          <FileText className="h-3.5 w-3.5 text-teal" /> {t(routePage.sectionADoc.en, routePage.sectionADoc.zh)}
        </div>
        <span className="text-[11.5px] font-mono">
          {t(routePage.collected.en(doneCount, items.length), routePage.collected.zh(doneCount, items.length))}
        </span>
      </div>
      <h3 className="mt-1 text-[15px] font-semibold tracking-tight">{displayTitle}</h3>
      <p className="mt-1 text-[11.5px] text-muted-foreground italic">
        {t(routePage.checklistNote.en, routePage.checklistNote.zh)}
      </p>

      <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-carbon transition-all duration-500" style={{ width: `${(doneCount / items.length) * 100}%` }} />
      </div>

      <ul className="mt-4 divide-y divide-border">
        {items.map((it) => (
          <li key={it.name} className="py-2.5 flex items-center gap-3">
            <span
              className={cn(
                "h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-colors",
                it.done ? "bg-carbon/15 text-carbon" : "bg-muted/60 text-muted-foreground border border-dashed border-border",
              )}
            >
              {it.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            </span>
            <span className={cn("flex-1 text-[13px] min-w-0", !it.done && "text-muted-foreground")}>
              <span className="block truncate">{isZh && "nameZh" in it && it.nameZh ? it.nameZh : it.name}</span>
              {it.fileName && (
                <span className="block text-[10px] font-mono text-muted-foreground truncate mt-0.5">{it.fileName}</span>
              )}
            </span>
            {it.done ? (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10.5px] font-mono text-carbon">{t(routePage.done.en, routePage.done.zh)}</span>
                <button
                  type="button"
                  onClick={() => openUpload(it.name)}
                  className="text-[10px] font-mono text-muted-foreground hover:text-primary"
                >
                  {t(routePage.replaceFile.en, routePage.replaceFile.zh)}
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={uploading && pendingItem === it.name}
                onClick={() => openUpload(it.name)}
                className="inline-flex items-center gap-1 text-[11.5px] font-mono text-primary hover:brightness-125 disabled:opacity-50 shrink-0"
              >
                {uploading && pendingItem === it.name ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Upload className="h-3 w-3" />
                )}
                {uploading && pendingItem === it.name
                  ? t(routePage.uploading.en, routePage.uploading.zh)
                  : t(routePage.upload.en, routePage.upload.zh)}
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5 text-[10.5px] font-mono text-muted-foreground">
        <BookOpen className="h-3 w-3" /> {c.kb}
      </div>
    </div>
  );
}

/* ---------- Horizontal stage strip ---------- */
function StageStrip({
  kb,
  stages,
  running,
  complete,
  unlocked,
  onRun,
}: {
  kb: string;
  stages: ReturnType<typeof useRoutePipeline>["stages"];
  running: boolean;
  complete: boolean;
  unlocked: boolean;
  onRun: () => void;
}) {
  const { t, isZh } = useLocale();
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
          <Radio className="h-3.5 w-3.5 text-teal" /> {t(routePage.sectionBPipeline.en, routePage.sectionBPipeline.zh)}
        </div>
        <button
          type="button"
          disabled={!unlocked || running}
          onClick={() => void onRun()}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11px] font-mono transition",
            unlocked && !running
              ? "border-primary/40 bg-primary/10 text-primary hover:brightness-110"
              : "border-border text-muted-foreground opacity-50 cursor-not-allowed",
          )}
        >
          {running ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : complete ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          {running
            ? t(routePage.pipelineRunning.en, routePage.pipelineRunning.zh)
            : complete
              ? t(routePage.pipelineComplete.en, routePage.pipelineComplete.zh)
              : unlocked
                ? t(routePage.runPipeline.en, routePage.runPipeline.zh)
                : t(routePage.pipelineLocked.en, routePage.pipelineLocked.zh)}
        </button>
      </div>
      <ol className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
        {stages.map((s) => {
          const done = s.status === "done";
          const loading = s.status === "loading";
          const pending = s.status === "pending";
          return (
            <li
              key={s.n}
              className={cn(
                "rounded-lg border p-3 relative transition-all duration-300",
                done && "border-carbon/40 bg-carbon/[0.06]",
                loading && "border-primary/50 bg-primary/[0.08] teal-glow",
                pending && "border-border bg-surface/50",
              )}
            >
              <div className="flex items-baseline justify-between">
                <span
                  className={cn(
                    "text-[10px] font-mono",
                    done ? "text-carbon" : loading ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {loading && "▸ "}
                  {t(pipeline.stage.en, pipeline.stage.zh)} {s.n}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                  {loading ? <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" /> : null}
                  {s.elapsed ?? "—"}
                </span>
              </div>
              <div className="mt-1 text-[13px] font-medium">{s.key}</div>
              <div className="text-[10px] font-mono text-muted-foreground">{s.zh}</div>
              <div
                className={cn(
                  "mt-2 text-[10.5px] font-mono leading-snug",
                  loading ? "text-primary" : done ? "text-carbon/80" : "text-muted-foreground",
                )}
              >
                {s.method}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-[11.5px] text-muted-foreground italic">
        {t(routePage.factoryNote.en, routePage.factoryNote.zh)}
      </p>
    </div>
  );
}

/* ---------- Score gauge (small, CISA-style) ---------- */
function ScoreGauge({ value, grade }: { value: number; grade: string }) {
  const pct = Math.max(0, Math.min(100, value)) / 100;
  const angle = -90 + pct * 180;
  return (
    <div className="relative w-[220px] h-[120px] mx-auto">
      <svg viewBox="0 0 200 110" className="w-full h-full">
        <defs>
          <linearGradient id="rpg" x1="0" x2="1">
            <stop offset="0" stopColor="var(--color-danger)" />
            <stop offset="0.5" stopColor="var(--color-warning)" />
            <stop offset="1" stopColor="var(--color-carbon)" />
          </linearGradient>
        </defs>
        <path d="M 15 100 A 85 85 0 0 1 185 100" fill="none" stroke="url(#rpg)" strokeWidth="12" strokeLinecap="round" />
        <g transform={`rotate(${angle} 100 100)`}>
          <line x1="100" y1="100" x2="100" y2="35" stroke="var(--color-gold)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="100" cy="100" r="5" fill="var(--color-gold)" />
        </g>
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <div className="font-mono text-[26px] font-semibold text-gold leading-none">{grade}</div>
        <div className="text-[10.5px] font-mono text-muted-foreground mt-0.5">{value} / 100</div>
      </div>
    </div>
  );
}

/* ============================================================ */

export function RoutePage({ slug }: { slug: Slug }) {
  const navigate = useNavigate();
  const { t, isZh } = useLocale();
  const cfg = routePages[slug];
  const advice = advisoryCards[slug];
  const gapList = gaps[slug];
  const flow = getFlowProgress(slug);
  const checklist = useRouteChecklist(slug);
  const { stages, running, complete, runPipeline } = useRoutePipeline(cfg.kb);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfMsg, setPdfMsg] = useState<string | null>(null);

  function handleContinueFlow() {
    const next = advanceRouteFlow();
    if (next) {
      void navigate({ to: `/${next}` });
    } else {
      void navigate({ to: "/" });
    }
  }

  async function handleDownloadPdf() {
    setPdfBusy(true);
    setPdfMsg(null);
    try {
      const stagesForPdf = complete ? stages : await runPipeline();
      const kpiRows =
        slug === "passport"
          ? [
              { label: "Intensity tCO2e/t", value: String(kpis.intensity) },
              { label: "Benchmark gap %", value: `${kpis.benchmarkGap}%` },
              { label: "CBAM 2026 €", value: kpis.cbam2026.toLocaleString() },
              { label: "Net tariff €/t", value: String(kpis.netTariff) },
            ]
          : slug === "grant"
            ? [
                { label: "Grant score", value: `${cfg.gauge}/100` },
                { label: "Scrap ratio %", value: "24.5" },
                { label: "Green elec %", value: "45.0" },
                { label: "Metering %", value: "78.0" },
              ]
            : [
                { label: "Loan score", value: `${cfg.gauge}/100` },
                { label: "Risk tier", value: cfg.scoreValue },
                { label: "Grade", value: cfg.scoreGrade },
                { label: "Route", value: company.route },
              ];

      await downloadRoutePreviewPdf({
        route: slug,
        title: cfg.title,
        title_zh: cfg.titleZh ?? null,
        subtitle: cfg.subtitle,
        subtitle_zh: cfg.subtitleZh ?? null,
        kb: cfg.kb,
        citations: cfg.citations,
        company_name: company.nameEn,
        company_id: company.id,
        production_route: company.route,
        score_label: cfg.scoreLabel,
        score_value: cfg.scoreValue,
        score_grade: cfg.scoreGrade,
        gauge: cfg.gauge,
        checklist: checklist.items.map((it) => ({
          name: it.name,
          name_zh: "nameZh" in it ? (it.nameZh as string | undefined) : null,
          done: it.done,
          file_name: it.fileName ?? null,
        })),
        pipeline_stages: stagesForPdf.map((s) => ({
          n: s.n,
          key: s.key,
          zh: s.zh,
          method: s.method,
          status: s.status === "loading" ? "loading" : s.status === "done" ? "done" : "pending",
          elapsed: s.elapsed,
        })),
        gaps: gapList,
        advisory: advice.map((a) => ({
          title: a.title,
          impact: a.impact,
          why: a.why,
          status: a.status,
        })),
        kpis: kpiRows,
        lang: isZh ? "zh" : "en",
      });
      setPdfMsg(t(routePage.pdfReady.en, routePage.pdfReady.zh));
    } catch (e) {
      setPdfMsg(e instanceof Error ? e.message : t(routePage.pdfError.en, routePage.pdfError.zh));
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <AppShell crumb={isZh ? cfg.zh : cfg.label}>
      {flow && (
        <div className="mb-4 rounded-lg border border-primary/30 bg-primary/[0.06] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[12.5px]">
            <span className="font-mono text-muted-foreground">{t(routeFlow.copilotFlow.en, routeFlow.copilotFlow.zh)} </span>
            <span className="font-medium">{t(routeFlow.stepOf.en(flow.step, flow.total), routeFlow.stepOf.zh(flow.step, flow.total))}</span>
            {flow.nextSlug && (
              <span className="text-muted-foreground">{t(routeFlow.next.en(getRouteLabel(flow.nextSlug, isZh)), routeFlow.next.zh(getRouteLabel(flow.nextSlug, isZh)))}</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleContinueFlow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium teal-glow hover:brightness-110 transition"
          >
            {flow.nextSlug
              ? t(routeFlow.continueTo.en(getRouteLabel(flow.nextSlug, isZh)), routeFlow.continueTo.zh(getRouteLabel(flow.nextSlug, isZh)))
              : t(routeFlow.finishFlow.en, routeFlow.finishFlow.zh)}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <PageHeader
        n={cfg.n}
        zh={cfg.zh}
        title={cfg.title}
        titleZh={cfg.titleZh}
        subtitle={cfg.subtitle}
        subtitleZh={cfg.subtitleZh}
        right={
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-carbon/30 bg-carbon/5 text-[11.5px] font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-carbon pulse-dot" /> {t(routeFlow.submitReady.en, routeFlow.submitReady.zh)}
          </div>
        }
      />

      <Checklist
        slug={slug}
        items={checklist.items}
        doneCount={checklist.doneCount}
        markUploaded={checklist.markUploaded}
      />
      {slug === "passport" && <CbamWorkbookPanel />}
      <StageStrip
        kb={cfg.kb}
        stages={stages}
        running={running}
        complete={complete}
        unlocked={checklist.allDone}
        onRun={runPipeline}
      />

      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="panel-lift p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              <FileText className="h-3.5 w-3.5 text-teal" /> {t(routePage.sectionCPreview.en, routePage.sectionCPreview.zh)}
            </div>
            <span className="text-[10.5px] font-mono text-carbon inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-carbon" /> {t(routePage.deterministic.en, routePage.deterministic.zh)}
            </span>
          </div>

          <h3 className="mt-2 text-[17px] font-semibold tracking-tight">{isZh ? (cfg.titleZh ?? cfg.title) : cfg.title}</h3>
          <p className="text-[11.5px] font-mono text-muted-foreground">{cfg.scoreLabel} · {cfg.scoreValue}</p>

          <div className="mt-4 rounded-lg border border-border bg-surface/40 p-4">
            <ScoreGauge value={cfg.gauge} grade={cfg.scoreGrade} />
          </div>

          <div className="mt-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{t(routePage.gapList.en, routePage.gapList.zh)}</div>
            <ul className="mt-2 space-y-1.5">
              {gapList.map((g) => (
                <li key={g} className="flex items-start gap-2 text-[12.5px]">
                  <CircleAlert className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={pdfBusy}
              onClick={() => void handleDownloadPdf()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-[12.5px] font-medium teal-glow hover:brightness-110 transition disabled:opacity-50"
            >
              {pdfBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              {pdfBusy ? t(routePage.generatingPdf.en, routePage.generatingPdf.zh) : t(routePage.downloadPdf.en, routePage.downloadPdf.zh)}
            </button>
            <span className="text-[10.5px] font-mono text-muted-foreground">{t(routePage.pdfNote.en, routePage.pdfNote.zh)}</span>
          </div>
          {pdfMsg && <p className="mt-2 text-[11px] font-mono text-carbon">{pdfMsg}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="panel p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              <Wand2 className="h-3.5 w-3.5 text-gold" /> {t(routePage.sectionCAdvisory.en, routePage.sectionCAdvisory.zh)}
            </div>
            <span className="text-[10.5px] font-mono text-muted-foreground">{t(routePage.advisoryNote.en, routePage.advisoryNote.zh)}</span>
          </div>

          <ul className="mt-3 space-y-2">
            {advice.map((a) => (
              <li key={a.title} className="rounded-lg border border-border bg-surface/50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-[13px] font-medium">{a.title}</div>
                  <span className="shrink-0 text-[10.5px] font-mono px-1.5 py-0.5 rounded bg-gold/15 text-gold border border-gold/30">
                    {a.impact} {cfg.advisoryImpactUnit}
                  </span>
                </div>
                <details className="mt-1.5">
                  <summary className="text-[11.5px] font-mono text-muted-foreground cursor-pointer hover:text-foreground">
                    {t(routePage.why.en, routePage.why.zh)}
                  </summary>
                  <p className="mt-1.5 text-[11.5px] text-muted-foreground leading-relaxed">{a.why}</p>
                </details>
                <div className="mt-2">
                  <span
                    className={cn(
                      "text-[10.5px] font-mono px-1.5 py-0.5 rounded border",
                      a.status.startsWith("Implemented") ? "bg-carbon/10 text-carbon border-carbon/30" : "bg-muted/60 text-muted-foreground border-border",
                    )}
                  >
                    {a.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-start gap-2 text-[11px] text-muted-foreground">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>{t(routePage.advisoryFooter.en, routePage.advisoryFooter.zh)}</span>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link to="/" className="text-[12.5px] font-mono text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          {t(routeFlow.backDashboard.en, routeFlow.backDashboard.zh)}
        </Link>
        <div className="flex items-center gap-3">
          {flow?.nextSlug && (
            <button
              type="button"
              onClick={handleContinueFlow}
              className="text-[12.5px] font-mono text-primary inline-flex items-center gap-1 hover:underline"
            >
              {t(routeFlow.continueTo.en(getRouteLabel(flow.nextSlug, isZh)), routeFlow.continueTo.zh(getRouteLabel(flow.nextSlug, isZh)))}{" "}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
          {!flow && (
            <Link to="/new" className="text-[12.5px] font-mono text-primary inline-flex items-center gap-1">
              {t(routeFlow.goNewSubmission.en, routeFlow.goNewSubmission.zh)} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      <CitationFooter extra={cfg.citations} />
    </AppShell>
  );
}
