import { useEffect, useRef, useState } from "react";
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
import { GrantApplicationForm } from "@/components/GrantApplicationForm";
import { CbamOperatorScorePanel } from "@/components/CbamOperatorScorePanel";
import { PassportGraphRagPanel } from "@/components/PassportGraphRagPanel";
import { GreenFactoryScorePanel } from "@/components/GreenFactoryScorePanel";
import { LoanApplicationForm } from "@/components/LoanApplicationForm";
import { LoanGreenFinanceScorePanel } from "@/components/LoanGreenFinanceScorePanel";
import { StageDetailShell } from "@/components/StageDetailShell";
import { useRouteChecklist } from "@/hooks/useRouteChecklist";
import { useRoutePipeline } from "@/hooks/useRoutePipeline";
import {
  advisoryCards,
  docChecklists,
  gaps,
  routePages,
} from "@/lib/dashboard-data";
import {
  downloadApplicationFormPdf,
  downloadCbamCommunicationXlsx,
  ingestRagUploadBatch,
  type CbamScoreResult,
  type GrantScoreResult,
  type LoanScoreResult,
} from "@/lib/api";
import { defaultGrantApplication } from "@/lib/application-forms/grant-template";
import { defaultLoanApplication } from "@/lib/application-forms/loan-template";
import { ensureDemoApplicationForm } from "@/lib/application-forms/demo-seed";
import { CBAM_WORKBOOK_DEMO } from "@/lib/cbam-workbook";
import { advanceRouteFlow, getFlowProgress, getRouteLabel } from "@/lib/route-flow";
import { useLocale } from "@/lib/locale";
import { pipeline, routeFlow, routePage } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

type Slug = keyof typeof routePages;

/* ---------- Doc checklist ---------- */
type UploadPhase = "idle" | "picking" | "uploading" | "converting" | "embedding" | "error";

function Checklist({
  slug,
  items,
  doneCount,
  attachedCount,
  queuedPdfCount,
  attachFile,
  markProcessed,
  takeQueuedPdfs,
  takeQueuedNonPdfs,
  uploadSessionId,
  ragChannel,
}: {
  slug: Slug;
  items: ReturnType<typeof useRouteChecklist>["items"];
  doneCount: number;
  attachedCount: number;
  queuedPdfCount: number;
  attachFile: ReturnType<typeof useRouteChecklist>["attachFile"];
  markProcessed: ReturnType<typeof useRouteChecklist>["markProcessed"];
  takeQueuedPdfs: ReturnType<typeof useRouteChecklist>["takeQueuedPdfs"];
  takeQueuedNonPdfs: ReturnType<typeof useRouteChecklist>["takeQueuedNonPdfs"];
  uploadSessionId: string;
  ragChannel: ReturnType<typeof useRouteChecklist>["ragChannel"];
}) {
  const c = docChecklists[slug];
  const { t, isZh } = useLocale();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingItem, setPendingItem] = useState<string | null>(null);
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [phaseMsg, setPhaseMsg] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

  const displayTitle = isZh && "titleZh" in c && c.titleZh ? c.titleZh : c.title;
  const busy = phase === "uploading" || phase === "converting" || phase === "embedding";
  const canProcess = queuedPdfCount > 0 || items.some((i) => i.queued && !i.isPdf);

  function openAttach(itemName: string) {
    if (busy) return;
    setPendingItem(itemName);
    setPhase("picking");
    setPhaseMsg(null);
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[itemName];
      return next;
    });
    fileRef.current?.click();
  }

  function handleFile(file: File | undefined) {
    if (!file || !pendingItem) {
      setPendingItem(null);
      setPhase("idle");
      return;
    }
    attachFile(pendingItem, file);
    setPendingItem(null);
    setPhase("idle");
    setPhaseMsg(isZh ? `已排队：${file.name}` : `Queued: ${file.name}`);
  }

  async function processAll() {
    if (busy || !uploadSessionId) return;
    const pdfs = takeQueuedPdfs();
    const nonPdfs = takeQueuedNonPdfs();
    if (!pdfs.length && !nonPdfs.length) {
      setPhaseMsg(t(routePage.nothingToProcess.en, routePage.nothingToProcess.zh));
      return;
    }

    setRowErrors({});
    setPhase("uploading");
    setPhaseMsg(
      isZh
        ? `准备处理 ${pdfs.length} 个 PDF…`
        : `Preparing ${pdfs.length} PDF(s)…`,
    );

    try {
      for (const { itemName, file } of nonPdfs) {
        markProcessed(itemName, file.name, {
          ragStored: false,
          statusNote: isZh
            ? "已附上（非 PDF，Stage 1 不嵌入）"
            : "Attached (non-PDF; Stage 1 skips embed)",
        });
      }

      if (pdfs.length) {
        const lang = slug === "passport" ? "en" : "ch";
        setPhase("converting");
        setPhaseMsg(
          isZh
            ? `校验内容哈希 · 相同字节复用 Supabase，新文件再 MinerU→PyMuPDF→嵌入…`
            : `Checking content hashes · reuse Supabase for identical bytes, then convert new PDFs…`,
        );
        const batch = await ingestRagUploadBatch({
          files: pdfs.map((p) => ({ file: p.file, checklistItem: p.itemName })),
          channel: ragChannel,
          uploadSessionId,
          language: lang,
        });
        setPhase("embedding");
        const cacheN = (batch.results || []).filter((r) => r.cached).length;
        setPhaseMsg(
          isZh
            ? `完成 · ${batch.embedded_chunks} 片段 · ${batch.file_count} 文件` +
                (cacheN ? ` · ${cacheN} 缓存命中` : "")
            : `Done · ${batch.embedded_chunks} chunks · ${batch.file_count} files` +
                (cacheN ? ` · ${cacheN} cache hit(s)` : ""),
        );

        const byItem = new Map(
          (batch.results || []).map((r) => [r.checklist_item || "", r]),
        );
        for (const { itemName, file } of pdfs) {
          const result = byItem.get(itemName);
          if (!result) {
            markProcessed(itemName, file.name, {
              ragStored: false,
              statusNote: isZh ? "批次中无返回结果" : "No result in batch response",
            });
            continue;
          }
          const note = result.stored
            ? isZh
              ? `${result.chunk_count} 片段 · ${result.convert_method ?? "embed"}${result.cached ? " · 缓存" : ""}`
              : `${result.chunk_count} chunks · ${result.convert_method ?? "embed"}${result.cached ? " · cached" : ""}`
            : isZh
              ? `文件已保存 · RAG 未写入（${result.reason ?? "unknown"}）`
              : `File saved · RAG not stored (${result.reason ?? "unknown"})`;
          if (!result.stored) {
            setRowErrors((prev) => ({
              ...prev,
              [itemName]: result.reason || "not stored",
            }));
          }
          markProcessed(itemName, result.source_file || file.name, {
            fileHash: result.file_hash ?? undefined,
            chunkCount: result.chunk_count,
            ragStored: result.stored,
            statusNote: note,
          });
        }
        setPhaseMsg(
          isZh
            ? `完成：${batch.file_count} 个 PDF · ${batch.embedded_chunks} 片段已写入 Stage 1 RAG`
            : `Done: ${batch.file_count} PDF(s) · ${batch.embedded_chunks} chunks in Stage 1 RAG`,
        );
      } else {
        setPhaseMsg(isZh ? "非 PDF 已标记完成" : "Non-PDF attachments marked done");
      }
      setPhase("idle");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Processing failed";
      setPhase("error");
      setPhaseMsg(msg);
    }
  }

  return (
    <div className="panel p-5">
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept=".pdf,application/pdf,.xlsx,.xls,.csv,.doc,.docx,.png,.jpg,.jpeg"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
          <FileText className="h-3.5 w-3.5 text-teal" /> {t(routePage.sectionADoc.en, routePage.sectionADoc.zh)}
        </div>
        <span className="text-[11.5px] font-mono shrink-0">
          {t(
            routePage.attachedProgress.en(attachedCount, doneCount, items.length),
            routePage.attachedProgress.zh(attachedCount, doneCount, items.length),
          )}
        </span>
      </div>
      <h3 className="mt-1 text-[15px] font-semibold tracking-tight">{displayTitle}</h3>
      <p className="mt-1 text-[11.5px] text-muted-foreground italic">
        {t(routePage.checklistNote.en, routePage.checklistNote.zh)}
      </p>

      <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-carbon transition-all duration-500"
          style={{ width: `${items.length ? (doneCount / items.length) * 100 : 0}%` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy || !canProcess}
          onClick={() => void processAll()}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground teal-glow hover:brightness-110 transition disabled:opacity-40"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          {busy
            ? phase === "converting"
              ? t(routePage.converting.en, routePage.converting.zh)
              : phase === "embedding"
                ? t(routePage.embedding.en, routePage.embedding.zh)
                : t(routePage.uploading.en, routePage.uploading.zh)
            : t(routePage.processAll.en, routePage.processAll.zh)}
        </button>
        <span className="text-[10.5px] font-mono text-muted-foreground max-w-md">
          {t(routePage.processAllHint.en, routePage.processAllHint.zh)}
        </span>
      </div>

      {(busy || phaseMsg) && (
        <div
          className={cn(
            "mt-3 flex items-center gap-2 rounded-md border px-3 py-2 text-[11.5px] font-mono",
            phase === "error"
              ? "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300"
              : "border-primary/25 bg-primary/5 text-primary",
          )}
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" /> : null}
          <span className="min-w-0 truncate">{phaseMsg}</span>
        </div>
      )}

      <ul className="mt-4 divide-y divide-border">
        {items.map((it) => {
          const err = rowErrors[it.name];
          const showDone = it.done && !it.queued;
          return (
            <li key={it.name} className="py-3 flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-colors",
                  showDone
                    ? "bg-carbon/15 text-carbon"
                    : it.queued
                      ? "bg-primary/15 text-primary"
                      : "bg-muted/60 text-muted-foreground border border-dashed border-border",
                )}
              >
                {showDone ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </span>
              <div className={cn("flex-1 min-w-0", !showDone && !it.queued && "text-muted-foreground")}>
                <span className="block text-[13px] truncate">
                  {isZh && "nameZh" in it && it.nameZh ? it.nameZh : it.name}
                </span>
                {it.fileName ? (
                  <span className="mt-1 inline-flex max-w-full items-center gap-1.5 rounded border border-border bg-muted/40 px-2 py-1 text-[11px] font-mono text-foreground">
                    <FileText className="h-3 w-3 shrink-0 text-teal" />
                    <span className="truncate" title={it.fileName}>
                      {it.fileName}
                    </span>
                    {it.queued ? (
                      <span className="shrink-0 text-primary">
                        · {t(routePage.queued.en, routePage.queued.zh)}
                      </span>
                    ) : null}
                  </span>
                ) : null}
                {it.statusNote && !it.queued ? (
                  <span className="mt-1 block text-[10.5px] font-mono text-muted-foreground truncate">
                    {it.statusNote}
                  </span>
                ) : null}
                {err ? (
                  <span className="mt-1 block text-[10.5px] font-mono text-amber-700 dark:text-amber-400 truncate">
                    {err}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2 shrink-0 pt-0.5">
                {showDone ? (
                  <span className="text-[10.5px] font-mono text-carbon">
                    {t(routePage.done.en, routePage.done.zh)}
                  </span>
                ) : null}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => openAttach(it.name)}
                  className="inline-flex items-center gap-1 text-[11.5px] font-mono text-primary hover:brightness-125 disabled:opacity-50"
                >
                  <Upload className="h-3 w-3" />
                  {it.attached
                    ? t(routePage.replaceFile.en, routePage.replaceFile.zh)
                    : t(routePage.upload.en, routePage.upload.zh)}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5 text-[10.5px] font-mono text-muted-foreground">
        <BookOpen className="h-3 w-3" /> {c.kb}
        <span className="text-muted-foreground/80">
          {isZh ? " · PDF→MinerU/PyMuPDF→嵌入" : " · PDF→MinerU/PyMuPDF→embed"}
        </span>
      </div>
    </div>
  );
}

/* ---------- Horizontal stage strip ---------- */
function StageStrip({
  kb,
  slug,
  stages,
  running,
  complete,
  unlocked,
  onRun,
  grantScore,
  loanScore,
  cbamScore,
  scoreError,
  ragError,
  stage2Open,
  stage3Open,
  onToggleStage2,
  onToggleStage3,
  excelBusy,
  excelMsg,
  onDownloadExcel,
}: {
  kb: string;
  slug: Slug;
  stages: ReturnType<typeof useRoutePipeline>["stages"];
  running: boolean;
  complete: boolean;
  unlocked: boolean;
  onRun: () => void;
  grantScore: GrantScoreResult | null;
  loanScore: LoanScoreResult | null;
  cbamScore: CbamScoreResult | null;
  scoreError: string | null;
  ragError: string | null;
  stage2Open: boolean;
  stage3Open: boolean;
  onToggleStage2: () => void;
  onToggleStage3: () => void;
  excelBusy: boolean;
  excelMsg: string | null;
  onDownloadExcel: () => void;
}) {
  const { t, isZh } = useLocale();
  const hasStage2Excel = slug === "passport" && complete;
  const hasStage3Panel =
    (slug === "grant" && grantScore != null) ||
    (slug === "loan" && loanScore != null) ||
    (slug === "passport" && cbamScore != null);
  const stage5 = stages.find((s) => s.n === 5);
  const showAdvisoryFlow =
    complete || stage5?.status === "done" || stage5?.status === "loading";

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
      <div className="mt-4 relative">
      <ol className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stages.map((s) => {
          const done = s.status === "done";
          const loading = s.status === "loading";
          const pending = s.status === "pending";
          const isGrantScore = slug === "grant" && s.n === 3;
          const isLoanScore = slug === "loan" && s.n === 3;
          const isCbamScore = slug === "passport" && s.n === 3;
          const isScoreStage = s.n === 3;
          const isFactoryStage = s.n === 4;
          const isAdvisoryStage = s.n === 5;
          const isCbamPrescreen = slug === "passport" && s.n === 1;
          const isGrantPrescreen = slug === "grant" && s.n === 1;
          const isLoanPrescreen = slug === "loan" && s.n === 1;
          const isCbamReport = slug === "passport" && s.n === 2;
          const clickableStage2 = isCbamReport && hasStage2Excel;
          const clickableStage3 =
            (isGrantScore || isLoanScore || isCbamScore) && hasStage3Panel && done;
          return (
            <li
              key={s.n}
              role={clickableStage2 || clickableStage3 ? "button" : undefined}
              tabIndex={clickableStage2 || clickableStage3 ? 0 : undefined}
              onClick={() => {
                if (clickableStage2) onToggleStage2();
                if (clickableStage3) onToggleStage3();
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                if (clickableStage2) onToggleStage2();
                if (clickableStage3) onToggleStage3();
              }}
              className={cn(
                "rounded-lg border p-3 relative transition-all duration-300",
                done && "border-carbon/40 bg-carbon/[0.06]",
                loading && "border-primary/50 bg-primary/[0.08] teal-glow",
                pending && "border-border bg-surface/50",
                (isGrantScore ||
                  isLoanScore ||
                  isCbamScore ||
                  (isCbamReport && hasStage2Excel)) &&
                  (done || loading) &&
                  "ring-1 ring-primary/30",
                (clickableStage2 || clickableStage3) &&
                  "cursor-pointer hover:brightness-110",
                clickableStage2 && stage2Open && "ring-2 ring-teal/50",
                clickableStage3 && stage3Open && "ring-2 ring-primary/50",
                showAdvisoryFlow &&
                  isAdvisoryStage &&
                  "ring-2 ring-gold/45 border-gold/40 bg-gold/[0.06]",
                showAdvisoryFlow &&
                  (isScoreStage || isFactoryStage) &&
                  done &&
                  "ring-1 ring-primary/35",
              )}
            >
              {showAdvisoryFlow && (isScoreStage || isFactoryStage) && done && (
                <span className="absolute -right-1 top-2 z-10 hidden md:inline-flex items-center gap-0.5 rounded-full border border-primary/40 bg-background px-1.5 py-0.5 text-[9px] font-mono text-primary shadow-sm">
                  {isScoreStage
                    ? t(routePage.advisoryFlowFromScore.en, routePage.advisoryFlowFromScore.zh)
                    : t(routePage.advisoryFlowFromFactory.en, routePage.advisoryFlowFromFactory.zh)}
                  <ArrowRight className="h-2.5 w-2.5" />
                </span>
              )}
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
              {isCbamPrescreen && (
                <div className="mt-1.5 text-[9.5px] font-mono text-teal/90 leading-snug">
                  {isZh ? "RAG · CBAM 指南（内置 KB）" : "RAG · CBAM guidance (built-in KB)"}
                </div>
              )}
              {isGrantPrescreen && (
                <div className="mt-1.5 text-[9.5px] font-mono text-primary/80 leading-snug">
                  {isZh ? "RAG · GB/T 36132（内置 KB）" : "RAG · GB/T 36132 (built-in KB)"}
                </div>
              )}
              {isLoanPrescreen && (
                <div className="mt-1.5 text-[9.5px] font-mono text-gold/90 leading-snug">
                  {isZh
                    ? "RAG · 绿金目录 + 通则（内置 KB）"
                    : "RAG · catalogue + GB/T 36132 (built-in KB)"}
                </div>
              )}
              {isGrantScore && (
                <div className="mt-1.5 text-[9.5px] font-mono text-primary/80 leading-snug">
                  {isZh
                    ? "依据《绿色工厂评价通则》GB/T 36132—2025"
                    : "Per 绿色工厂评价通则 GB/T 36132—2025"}
                </div>
              )}
              {isLoanScore && (
                <div className="mt-1.5 text-[9.5px] font-mono text-gold/90 leading-snug">
                  {isZh
                    ? "依据通则 GB/T 36132—2025 + 绿色金融支持项目目录（2025）"
                    : "Per GB/T 36132—2025 + Green Finance Catalogue 2025"}
                </div>
              )}
              {isCbamScore && (
                <div className="mt-1.5 text-[9.5px] font-mono text-teal/90 leading-snug">
                  {isZh
                    ? "依据欧委会指南 · 点击展开/收起评分"
                    : "Per EU CBAM guidance · click show/hide score"}
                </div>
              )}
              {isCbamReport && hasStage2Excel && (
                <div className="mt-1.5 text-[9.5px] font-mono text-teal/90 leading-snug">
                  {t(routePage.excelStage2Hint.en, routePage.excelStage2Hint.zh)}
                </div>
              )}
              {showAdvisoryFlow && isAdvisoryStage && (
                <div className="mt-1.5 text-[9.5px] font-mono text-gold leading-snug">
                  {slug === "passport"
                    ? isZh
                      ? "汇入评分 + 工厂数据 · 构建 3D Graph RAG"
                      : "Receives Score + factory · builds 3D Graph RAG"
                    : isZh
                      ? "汇入评分 + 工厂数据"
                      : "Receives Score + factory data"}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {showAdvisoryFlow && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-3"
          aria-hidden={false}
        >
          <p className="mb-1.5 text-[10.5px] font-mono text-muted-foreground md:hidden">
            {t(routePage.advisoryFlowLabel.en, routePage.advisoryFlowLabel.zh)}
          </p>
          <div className="relative hidden md:block h-14">
            <svg
              viewBox="0 0 1000 56"
              className="absolute inset-0 h-full w-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <marker
                  id="advisory-arrowhead"
                  markerWidth="8"
                  markerHeight="8"
                  refX="6"
                  refY="4"
                  orient="auto"
                >
                  <path d="M0,0 L8,4 L0,8 Z" fill="var(--color-primary)" />
                </marker>
              </defs>
              {/* Stage 3 (Score) center ≈ 50% → Stage 5 (Advisory) ≈ 90% */}
              <path
                d="M 500 4 C 500 36, 780 36, 900 20"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2"
                strokeDasharray="6 4"
                markerEnd="url(#advisory-arrowhead)"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="40"
                  to="0"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </path>
              {/* Stage 4 (Pull factory data) center ≈ 70% → Stage 5 */}
              <path
                d="M 700 4 C 700 28, 820 28, 900 20"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2"
                strokeDasharray="6 4"
                markerEnd="url(#advisory-arrowhead)"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="40"
                  to="0"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
            <div className="absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap rounded-full border border-primary/30 bg-background/95 px-2.5 py-0.5 text-[10px] font-mono text-primary">
              {t(routePage.advisoryFlowLabel.en, routePage.advisoryFlowLabel.zh)}
            </div>
          </div>
        </motion.div>
      )}
      </div>
      {(scoreError || ragError) && (
        <div className="mt-3 rounded-md border border-danger/40 bg-danger/[0.06] p-2 text-[11px] text-danger">
          {scoreError || ragError}
        </div>
      )}

      {hasStage2Excel && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <StageDetailShell
            stageN={2}
            titleEn={routePage.excelStage2Title.en}
            titleZh={routePage.excelStage2Title.zh}
            accentClass="border-teal/35"
            open={stage2Open}
            onOpenChange={(v) => {
              if (v !== stage2Open) onToggleStage2();
            }}
          >
            <div className="p-4 pt-3 space-y-3">
              <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                {t(routePage.excelStage2Desc.en, routePage.excelStage2Desc.zh)}
              </p>
              <p className="text-[11px] font-mono text-muted-foreground">
                {t(routePage.excelNote.en, routePage.excelNote.zh)}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={excelBusy}
                  onClick={onDownloadExcel}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-[12.5px] font-medium teal-glow hover:brightness-110 transition disabled:opacity-50"
                >
                  {excelBusy ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  {excelBusy
                    ? t(routePage.generatingExcel.en, routePage.generatingExcel.zh)
                    : t(routePage.downloadExcel.en, routePage.downloadExcel.zh)}
                </button>
              </div>
              {excelMsg && (
                <p className="text-[11px] font-mono text-carbon">{excelMsg}</p>
              )}
            </div>
          </StageDetailShell>
        </motion.div>
      )}

      {grantScore && slug === "grant" && (
        <StageDetailShell
          stageN={3}
          titleEn="Score · Green factory readiness"
          titleZh="评分 · 绿色工厂就绪"
          accentClass="border-primary/35"
          open={stage3Open}
          onOpenChange={(v) => {
            if (v !== stage3Open) onToggleStage3();
          }}
        >
          <div className="p-3 pt-0">
            <GreenFactoryScorePanel result={grantScore} />
          </div>
        </StageDetailShell>
      )}
      {loanScore && slug === "loan" && (
        <StageDetailShell
          stageN={3}
          titleEn="Score · Green loan readiness"
          titleZh="评分 · 绿贷就绪"
          accentClass="border-gold/35"
          open={stage3Open}
          onOpenChange={(v) => {
            if (v !== stage3Open) onToggleStage3();
          }}
        >
          <div className="p-3 pt-0">
            <LoanGreenFinanceScorePanel result={loanScore} />
          </div>
        </StageDetailShell>
      )}
      {cbamScore && slug === "passport" && (
        <StageDetailShell
          stageN={3}
          titleEn="Score · CBAM operator readiness"
          titleZh="评分 · CBAM 运营方就绪"
          accentClass="border-teal/35"
          open={stage3Open}
          onOpenChange={(v) => {
            if (v !== stage3Open) onToggleStage3();
          }}
        >
          <div className="p-3 pt-0">
            <CbamOperatorScorePanel result={cbamScore} />
          </div>
        </StageDetailShell>
      )}
      <p className="mt-3 text-[11.5px] text-muted-foreground italic">
        {t(routePage.factoryNote.en, routePage.factoryNote.zh)}
      </p>
    </div>
  );
}

/* ---------- Score gauge (percentage · 70% threshold) ---------- */
const SECTION_C_THRESHOLD = 70;

function ScoreGauge({
  value,
  threshold = SECTION_C_THRESHOLD,
  isZh = false,
}: {
  value: number;
  threshold?: number;
  isZh?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const angle = -90 + (pct / 100) * 180;
  const passes = pct >= threshold;
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
        <path
          d="M 15 100 A 85 85 0 0 1 185 100"
          fill="none"
          stroke="url(#rpg)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Threshold tick at 70% */}
        <g transform={`rotate(${-90 + (threshold / 100) * 180} 100 100)`}>
          <line
            x1="100"
            y1="28"
            x2="100"
            y2="42"
            stroke="var(--color-foreground)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.55"
          />
        </g>
        <g transform={`rotate(${angle} 100 100)`}>
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="35"
            stroke={passes ? "var(--color-carbon)" : "var(--color-warning)"}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle
            cx="100"
            cy="100"
            r="5"
            fill={passes ? "var(--color-carbon)" : "var(--color-warning)"}
          />
        </g>
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <div
          className={cn(
            "font-mono text-[26px] font-semibold leading-none tabular-nums",
            passes ? "text-carbon" : "text-warning",
          )}
        >
          {Math.round(pct)}%
        </div>
        <div className="text-[10.5px] font-mono text-muted-foreground mt-0.5">
          {passes
            ? isZh
              ? `通过 · 阈值 ${threshold}%`
              : `Pass · thr ${threshold}%`
            : isZh
              ? `未达阈值 ${threshold}%`
              : `Below thr ${threshold}%`}
        </div>
      </div>
    </div>
  );
}

/* ============================================================ */

export type RouteTab = "form" | "pipeline";
/** @deprecated Use RouteTab */
export type PassportTab = RouteTab;

export function RoutePage({
  slug,
  routeTab = "form",
}: {
  slug: Slug;
  routeTab?: RouteTab;
}) {
  const navigate = useNavigate();
  const { t, isZh } = useLocale();
  const cfg = routePages[slug];
  const advice = advisoryCards[slug];
  const gapList = gaps[slug];
  const flow = getFlowProgress(slug);
  const checklist = useRouteChecklist(slug);
  const {
    stages,
    running,
    complete,
    runPipeline,
    grantScore,
    loanScore,
    cbamScore,
    scoreError,
    ragError,
    graphRagPhase,
    graphRagNodes,
    graphRagEdges,
    graphRagResult,
  } = useRoutePipeline(cfg.kb, slug, checklist.uploadSessionId);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfMsg, setPdfMsg] = useState<string | null>(null);
  const [stage2Open, setStage2Open] = useState(true);
  const [stage3Open, setStage3Open] = useState(true);
  const sectionCRef = useRef<HTMLDivElement>(null);

  // Seed loan/grant forms even when user lands on pipeline tab first.
  useEffect(() => {
    if (slug === "loan" || slug === "grant") ensureDemoApplicationForm(slug);
  }, [slug]);

  const isPassport = slug === "passport";
  const showFormTab = routeTab === "form";
  const showPipelineTab = routeTab === "pipeline";
  const showPassportGraph =
    isPassport && (graphRagPhase === "building" || graphRagPhase === "ready");

  const formTabLabel =
    isPassport
      ? isZh
        ? "评估表单"
        : "Evaluation form"
      : isZh
        ? "申请表单"
        : "Application form";

  const tablistLabel = isPassport
    ? isZh
      ? "碳护照分栏"
      : "EU CBAM tabs"
    : slug === "loan"
      ? isZh
        ? "绿贷分栏"
        : "Loan tabs"
      : isZh
        ? "补贴分栏"
        : "Grant tabs";

  const pipelineReadyHint = isPassport
    ? isZh
      ? "演示文件已预填 — 打开流水线页即可运行 5 个阶段（含 Graph RAG）。"
      : "Demo documents pre-filled — open the pipeline tab and run all 5 stages (incl. Graph RAG)."
    : isZh
      ? "演示文件已预填 — 打开流水线页即可运行 5 个阶段。"
      : "Demo documents pre-filled — open the pipeline tab and run all 5 stages.";

  function setRouteTab(tab: RouteTab) {
    // Literal `to` paths are required so TanStack applies validated `search`
    // (template `/${slug}` was dropping search and leaving loan/grant on form).
    if (slug === "loan") {
      void navigate({ to: "/loan", search: { tab }, replace: true });
      return;
    }
    if (slug === "grant") {
      void navigate({ to: "/grant", search: { tab }, replace: true });
      return;
    }
    void navigate({ to: "/passport", search: { tab }, replace: true });
  }

  useEffect(() => {
    if (!isPassport) return;
    if (graphRagPhase !== "building") return;
    if (routeTab !== "pipeline") {
      setRouteTab("pipeline");
      return;
    }
    sectionCRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to phase / tab
  }, [isPassport, graphRagPhase, routeTab]);

  function handleContinueFlow() {
    const next = advanceRouteFlow();
    if (next === "loan") {
      void navigate({ to: "/loan", search: { tab: "form" } });
    } else if (next === "grant") {
      void navigate({ to: "/grant", search: { tab: "form" } });
    } else if (next === "passport") {
      void navigate({ to: "/passport", search: { tab: "form" } });
    } else if (next) {
      void navigate({ to: `/${next}` });
    } else {
      void navigate({ to: "/" });
    }
  }

  async function handleDownloadPdf() {
    setPdfBusy(true);
    setPdfMsg(null);
    try {
      // Grant / Loan: filled official application form PDF (user-edited fields)
      if (slug === "grant" || slug === "loan") {
        const key = slug === "grant" ? "greengru-application-grant" : "greengru-application-loan";
        let applicationForm: unknown =
          slug === "grant" ? defaultGrantApplication() : defaultLoanApplication();
        try {
          const raw = localStorage.getItem(key);
          if (raw) applicationForm = JSON.parse(raw);
        } catch {
          /* keep defaults */
        }
        const scoreSummary =
          slug === "grant" && grantScore
            ? `${Math.round(grantScore.total_score)}% (thr 70%) · ${grantScore.standard}`
            : slug === "loan" && loanScore
              ? `${Math.round(loanScore.total_score)}% (thr 70%) · ${loanScore.standard}`
              : null;
        await downloadApplicationFormPdf({
          route: slug,
          application_form: applicationForm,
          score_summary: scoreSummary,
        });
        setPdfMsg(t(routePage.pdfReady.en, routePage.pdfReady.zh));
        return;
      }

      // Passport (CBAM): official EU Communication template (.xlsx), filled
      let workbookValues: Record<string, string> = { ...CBAM_WORKBOOK_DEMO };
      try {
        const raw = localStorage.getItem("greengru-cbam-workbook-values");
        if (raw) {
          const parsed = JSON.parse(raw) as Record<string, string>;
          workbookValues = { ...CBAM_WORKBOOK_DEMO, ...parsed };
        }
      } catch {
        /* keep demo defaults */
      }
      await downloadCbamCommunicationXlsx(workbookValues);
      setPdfMsg(t(routePage.excelReady.en, routePage.excelReady.zh));
    } catch (e) {
      const fallback =
        slug === "passport"
          ? t(routePage.excelError.en, routePage.excelError.zh)
          : t(routePage.pdfError.en, routePage.pdfError.zh);
      setPdfMsg(e instanceof Error ? e.message : fallback);
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

      <div
        role="tablist"
        aria-label={tablistLabel}
        className="flex flex-wrap gap-1 p-1 rounded-lg border border-border bg-surface/50"
      >
        <button
          type="button"
          role="tab"
          aria-selected={routeTab === "form"}
          onClick={() => setRouteTab("form")}
          className={cn(
            "inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-[12.5px] font-medium transition",
            routeTab === "form"
              ? "bg-primary/15 text-foreground border border-primary/35"
              : "text-muted-foreground hover:text-foreground border border-transparent",
          )}
        >
          <FileText className="h-3.5 w-3.5 text-teal" />
          {formTabLabel}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={routeTab === "pipeline"}
          onClick={() => setRouteTab("pipeline")}
          className={cn(
            "inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-[12.5px] font-medium transition",
            routeTab === "pipeline"
              ? "bg-primary/15 text-foreground border border-primary/35"
              : "text-muted-foreground hover:text-foreground border border-transparent",
          )}
        >
          <Radio className="h-3.5 w-3.5 text-teal" />
          {isZh ? "路线流水线" : "Route pipeline"}
          {(running || complete) && (
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                running ? "bg-carbon pulse-dot" : "bg-carbon",
              )}
            />
          )}
        </button>
      </div>

      {showFormTab && (
        <>
          <Checklist
            slug={slug}
            items={checklist.items}
            doneCount={checklist.doneCount}
            attachedCount={checklist.attachedCount}
            queuedPdfCount={checklist.queuedPdfCount}
            attachFile={checklist.attachFile}
            markProcessed={checklist.markProcessed}
            takeQueuedPdfs={checklist.takeQueuedPdfs}
            takeQueuedNonPdfs={checklist.takeQueuedNonPdfs}
            uploadSessionId={checklist.uploadSessionId}
            ragChannel={checklist.ragChannel}
          />
          {slug === "passport" && <CbamWorkbookPanel />}
          {slug === "loan" && <LoanApplicationForm />}
          {slug === "grant" && <GrantApplicationForm />}
          <div className="rounded-xl border border-border bg-surface/40 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium">
                {isZh ? "下一步 · 运行路线流水线" : "Next · run the route pipeline"}
              </p>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                {checklist.allDone
                  ? pipelineReadyHint
                  : isZh
                    ? "先完成上方文件清单与表单，再切换到流水线页。"
                    : "Finish the document checklist and form above, then switch to the pipeline tab."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRouteTab("pipeline")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary text-primary-foreground text-[12.5px] font-medium teal-glow hover:brightness-110 transition"
            >
              {isZh ? "打开路线流水线" : "Open route pipeline"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}

      {showPipelineTab && (
        <>
      <StageStrip
        kb={cfg.kb}
        slug={slug}
        stages={stages}
        running={running}
        complete={complete}
        unlocked={checklist.allDone}
        onRun={runPipeline}
        grantScore={grantScore}
        loanScore={loanScore}
        cbamScore={cbamScore}
        scoreError={scoreError}
        ragError={ragError}
        stage2Open={stage2Open}
        stage3Open={stage3Open}
        onToggleStage2={() => setStage2Open((v) => !v)}
        onToggleStage3={() => setStage3Open((v) => !v)}
        excelBusy={pdfBusy}
        excelMsg={slug === "passport" ? pdfMsg : null}
        onDownloadExcel={() => void handleDownloadPdf()}
      />

      {!complete && !showPassportGraph && (
        <div className="rounded-xl border border-dashed border-border bg-surface/20 px-5 py-8 text-center">
          <p className="text-[13px] font-medium text-muted-foreground">
            {slug === "passport"
              ? isZh
                ? "运行流水线至阶段 5 时，将在此构建 3D Graph RAG（BAT + 评分标尺）"
                : "Run the pipeline through Stage 5 — a 3D Graph RAG (BAT + rubrics) builds here"
              : isZh
                ? "完成上方 5 个阶段流水线后，将弹出预览与建议"
                : "Run the 5-stage pipeline above — Preview and Advisory will appear next"}
          </p>
          <p className="mt-1.5 text-[11px] font-mono text-muted-foreground/80">
            {slug === "passport"
              ? isZh
                ? "Section C · Graph RAG 证据图"
                : "Section C · Graph RAG evidence map"
              : isZh
                ? "Section C · Preview + Advisory 在流水线结束后显示"
                : "Section C · Preview + Advisory unlock after all stages finish"}
          </p>
        </div>
      )}

      {/* Passport: Graph RAG (left) + advisory advice (right) */}
      {slug === "passport" && (showPassportGraph || complete) && (
        <motion.div
          ref={sectionCRef}
          id="section-c-graph-rag"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className={cn(
            "scroll-mt-6 gap-4",
            graphRagPhase === "ready" || complete ? "grid lg:grid-cols-5" : "block",
          )}
        >
          <div
            className={cn(
              "panel-lift p-5",
              graphRagPhase === "ready" || complete ? "lg:col-span-3" : "",
            )}
          >
            <PassportGraphRagPanel
              phase={graphRagPhase === "idle" && complete ? "ready" : graphRagPhase}
              nodes={graphRagNodes}
              edges={graphRagEdges}
              result={graphRagResult}
              compact={graphRagPhase === "building"}
            />
          </div>

          {(graphRagPhase === "ready" || complete) && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="panel p-5 lg:col-span-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                  <Wand2 className="h-3.5 w-3.5 text-gold" />{" "}
                  {t(routePage.sectionCAdvisory.en, routePage.sectionCAdvisory.zh)}
                </div>
                <span className="text-[10.5px] font-mono text-muted-foreground">
                  {t(routePage.advisoryNote.en, routePage.advisoryNote.zh)}
                </span>
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
                          a.status.startsWith("Implemented")
                            ? "bg-carbon/10 text-carbon border-carbon/30"
                            : "bg-muted/60 text-muted-foreground border-border",
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
          )}
        </motion.div>
      )}

      {/* Loan / Grant: legacy score preview + advisory cards */}
      {complete && slug !== "passport" && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="grid lg:grid-cols-2 gap-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="panel-lift p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                <FileText className="h-3.5 w-3.5 text-teal" />{" "}
                {t(routePage.sectionCPreviewLegacy.en, routePage.sectionCPreviewLegacy.zh)}
              </div>
              <span className="text-[10.5px] font-mono text-carbon inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-carbon" />{" "}
                {t(routePage.deterministic.en, routePage.deterministic.zh)}
              </span>
            </div>

            <h3 className="mt-2 text-[17px] font-semibold tracking-tight">
              {isZh ? (cfg.titleZh ?? cfg.title) : cfg.title}
            </h3>
            <p className="text-[11.5px] font-mono text-muted-foreground">
              {cfg.scoreLabel} · {isZh ? "百分比 / 阈值 70%" : "Score % · thr 70%"}
            </p>

            <div className="mt-4 rounded-lg border border-border bg-surface/40 p-4">
              <ScoreGauge
                value={
                  grantScore && slug === "grant"
                    ? Math.round(grantScore.total_score)
                    : loanScore && slug === "loan"
                      ? Math.round(loanScore.total_score)
                      : cfg.gauge
                }
                isZh={isZh}
              />
            </div>

            <div className="mt-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                {t(routePage.gapList.en, routePage.gapList.zh)}
              </div>
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
                {pdfBusy
                  ? t(routePage.generatingPdf.en, routePage.generatingPdf.zh)
                  : t(routePage.downloadPdf.en, routePage.downloadPdf.zh)}
              </button>
              <span className="text-[10.5px] font-mono text-muted-foreground">
                {t(routePage.pdfNote.en, routePage.pdfNote.zh)}
              </span>
            </div>
            {pdfMsg && <p className="mt-2 text-[11px] font-mono text-carbon">{pdfMsg}</p>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="panel p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                <Wand2 className="h-3.5 w-3.5 text-gold" />{" "}
                {t(routePage.sectionCAdvisory.en, routePage.sectionCAdvisory.zh)}
              </div>
              <span className="text-[10.5px] font-mono text-muted-foreground">
                {t(routePage.advisoryNote.en, routePage.advisoryNote.zh)}
              </span>
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
                        a.status.startsWith("Implemented")
                          ? "bg-carbon/10 text-carbon border-carbon/30"
                          : "bg-muted/60 text-muted-foreground border-border",
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
        </motion.div>
      )}
        </>
      )}

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
