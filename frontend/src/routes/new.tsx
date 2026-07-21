import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  FileUp,
  Info,
  Plus,
  Radio,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { ExtractedInvoiceCard } from "@/components/ExtractedInvoiceCard";
import { PipelineTracker } from "@/components/PipelineTracker";
import { UpstreamAuthorizationModal } from "@/components/UpstreamAuthorizationModal";
import {
  fetchLatestIotReading,
  previewOcr,
  runPipeline,
  type IotReading,
  type OcrPreviewResponse,
  type PipelineRunResponse,
} from "@/lib/api";
import {
  electricityEmissionsTco2e,
  gridEmissionFactorTPerMWh,
  loadGreenPowerTradingChoice,
  saveGreenPowerTradingChoice,
  type GreenPowerTradingChoice,
  CISA_GRID_EF_CITATION_EN,
  CISA_GRID_EF_CITATION_ZH,
} from "@/lib/cisa-grid-ef";
import { useDashboardSnapshot } from "@/hooks/useDashboardSnapshot";
import { useLocale } from "@/lib/locale";
import { crumbs, newPage } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/new")({
  head: () => ({
    meta: [
      { title: "New submission · GreenGru" },
      { name: "description", content: "Upload invoices and submit to the six-stage pipeline." },
    ],
  }),
  component: NewSubmission,
});

type UploadedDocument = {
  id: string;
  file: File;
  ocrLoading: boolean;
  ocrPreview: OcrPreviewResponse | null;
  ocrError: string | null;
  expanded: boolean;
};

function newDocId() {
  return crypto.randomUUID();
}

function NewSubmission() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<PipelineRunResponse | null>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [esp32Enabled, setEsp32Enabled] = useState(true);
  const [iotReading, setIotReading] = useState<IotReading | null>(null);
  const [iotStatus, setIotStatus] = useState<"idle" | "live" | "waiting">("idle");
  const [greenTrading, setGreenTrading] = useState<GreenPowerTradingChoice>(() =>
    typeof window !== "undefined" ? loadGreenPowerTradingChoice() : "no",
  );
  const { applyPipelineSnapshot } = useDashboardSnapshot();

  const setGreenTradingChoice = useCallback((choice: GreenPowerTradingChoice) => {
    setGreenTrading(choice);
    saveGreenPowerTradingChoice(choice);
  }, []);

  useEffect(() => {
    if (!esp32Enabled) {
      setIotStatus("idle");
      return;
    }
    let cancelled = false;
    const tick = async () => {
      const latest = await fetchLatestIotReading("demo-hengfeng");
      if (cancelled) return;
      if (latest) {
        setIotReading(latest);
        setIotStatus("live");
      } else {
        setIotStatus("waiting");
      }
    };
    void tick();
    const id = window.setInterval(() => void tick(), 3000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [esp32Enabled]);

  const processFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    const entries: UploadedDocument[] = files.map((file, i) => ({
      id: newDocId(),
      file,
      ocrLoading: true,
      ocrPreview: null,
      ocrError: null,
      expanded: i === files.length - 1,
    }));

    setDocuments((prev) => {
      const collapseExisting = prev.map((d) => ({ ...d, expanded: false }));
      return [...collapseExisting, ...entries];
    });

    await Promise.all(
      entries.map(async (entry) => {
        try {
          const result = await previewOcr(entry.file);
          setDocuments((prev) =>
            prev.map((d) =>
              d.id === entry.id ? { ...d, ocrLoading: false, ocrPreview: result, ocrError: null } : d,
            ),
          );
        } catch (err) {
          setDocuments((prev) =>
            prev.map((d) =>
              d.id === entry.id
                ? {
                    ...d,
                    ocrLoading: false,
                    ocrPreview: null,
                    ocrError: err instanceof Error ? err.message : "OCR preview failed",
                  }
                : d,
            ),
          );
        }
      }),
    );
  }, []);

  const removeDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const toggleDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, expanded: !d.expanded } : d)));
  }, []);

  const pickFiles = useCallback(
    (fileList: FileList | null | undefined) => {
      if (!fileList?.length) return;
      void processFiles(Array.from(fileList));
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [processFiles],
  );

  const anyLoading = documents.some((d) => d.ocrLoading);
  const readyDocs = documents.filter((d) => d.ocrPreview && !d.ocrError);
  const hasErrors = documents.some((d) => d.ocrError);
  const canSubmit =
    documents.length > 0 && !anyLoading && readyDocs.length > 0 && !hasErrors && !submitted && !pipelineLoading;

  const handleSubmit = useCallback(async () => {
    const primary = readyDocs[0]?.ocrPreview;
    if (!primary) return;
    setPipelineLoading(true);
    setPipelineError(null);
    setSubmitted(true);
    try {
      const result = await runPipeline({
        invoice: primary.invoice,
        classification_route: primary.classification.route,
        production_volume_tonnes: primary.production_volume_tonnes,
        ocr_source: primary.ocr_source,
        mock_fields: primary.mock_fields,
      });
      setPipelineResult(result);
      applyPipelineSnapshot(result.dashboard_snapshot);
    } catch (err) {
      setPipelineError(err instanceof Error ? err.message : "Pipeline failed");
    } finally {
      setPipelineLoading(false);
    }
  }, [readyDocs, applyPipelineSnapshot]);

  const totalTonnage = readyDocs.reduce((sum, d) => sum + (d.ocrPreview?.production_volume_tonnes ?? 0), 0);
  const { t, isZh } = useLocale();

  const submitHint =
    documents.length === 0
      ? t(newPage.uploadToEnable.en, newPage.uploadToEnable.zh)
      : anyLoading
        ? t(newPage.ocrRunning.en, newPage.ocrRunning.zh)
        : hasErrors
          ? t(newPage.fixUploadError.en, newPage.fixUploadError.zh)
          : readyDocs.length > 0
            ? t(newPage.resumable.en, newPage.resumable.zh)
            : t(newPage.waitingOcr.en, newPage.waitingOcr.zh);

  return (
    <AppShell crumb={t(crumbs.new.en, crumbs.new.zh)}>
      <PageHeader
        n="04"
        zh="新建"
        title={newPage.title.en}
        titleZh={newPage.title.zh}
        subtitle={newPage.subtitle.en}
        subtitleZh={newPage.subtitle.zh}
      />

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <div className="space-y-5">
          {/* 1 · Documents */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="panel p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                <FileUp className="h-3.5 w-3.5 text-teal" /> {t(newPage.documents.en, newPage.documents.zh)}
              </div>
              {documents.length > 0 && (
                <span className="text-[10.5px] font-mono text-muted-foreground">
                  {isZh
                    ? `${documents.length} 个文件 · ${readyDocs.length} 个就绪`
                    : `${documents.length} file${documents.length === 1 ? "" : "s"} · ${readyDocs.length} ready`}
                </span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.csv,.xlsx,.png,.jpg,.jpeg"
              onChange={(e) => pickFiles(e.target.files)}
            />

            {documents.length > 0 && (
              <div className="mt-3 space-y-2.5">
                {documents.map((doc) => (
                  <ExtractedInvoiceCard
                    key={doc.id}
                    fileName={doc.file.name}
                    fileSizeLabel={`${(doc.file.size / 1024).toFixed(0)} KB`}
                    locked={submitted}
                    loading={doc.ocrLoading}
                    error={doc.ocrError}
                    preview={doc.ocrPreview}
                    expanded={doc.expanded}
                    onToggleExpand={() => toggleDocument(doc.id)}
                    onRemove={() => removeDocument(doc.id)}
                  />
                ))}
              </div>
            )}

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                pickFiles(e.dataTransfer.files);
              }}
              className={cn(
                "rounded-xl border-2 border-dashed text-center transition cursor-pointer",
                documents.length > 0 ? "mt-3 p-4" : "mt-3 p-8",
                dragOver ? "border-primary bg-primary/[0.08]" : "border-primary/30 bg-primary/[0.04] hover:bg-primary/[0.08]",
              )}
            >
              {documents.length > 0 ? (
                <>
                  <Plus className="h-5 w-5 text-primary mx-auto" strokeWidth={1.6} />
                  <div className="mt-2 text-[13px] font-medium">{t(newPage.addMoreTitle.en, newPage.addMoreTitle.zh)}</div>
                  <div className="mt-1 text-[11.5px] text-muted-foreground">{t(newPage.addMoreSub.en, newPage.addMoreSub.zh)}</div>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-primary mx-auto" strokeWidth={1.6} />
                  <div className="mt-3 text-[14px] font-medium">{t(newPage.dropTitle.en, newPage.dropTitle.zh)}</div>
                  <div className="mt-1 text-[12px] text-muted-foreground">{t(newPage.dropSub.en, newPage.dropSub.zh)}</div>
                </>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-surface text-[12px] font-medium hover:bg-surface-2 transition"
              >
                {t(newPage.browse.en, newPage.browse.zh)}
              </button>
            </div>

            <div className="mt-3 flex items-start gap-2 text-[11.5px] text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{t(newPage.intakeNote.en, newPage.intakeNote.zh)}</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="panel p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                <Radio className="h-3.5 w-3.5 text-carbon" /> {t(newPage.sensorOptional.en, newPage.sensorOptional.zh)}
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={esp32Enabled}
                  onChange={(e) => setEsp32Enabled(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="w-9 h-5 rounded-full bg-muted peer-checked:bg-carbon transition relative">
                  <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-background rounded-full transition peer-checked:translate-x-4" />
                </span>
                <span className="text-[12px] font-mono">{t(newPage.esp32.en, newPage.esp32.zh)}</span>
              </label>
            </div>
            <p className="mt-2 text-[12px] text-muted-foreground">
              {t(newPage.sensorNote.en, newPage.sensorNote.zh)}
            </p>
            {esp32Enabled && (
              <>
                <div className="mt-3 rounded-md border border-border bg-surface/60 p-3 space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {isZh ? "市场化绿电交易（CISA 附录 B.3）" : "Market green-power trading (CISA App. B.3)"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setGreenTradingChoice("no")}
                      className={cn(
                        "px-3 py-1.5 rounded-md border text-[12px] font-medium transition",
                        greenTrading === "no"
                          ? "border-carbon/40 bg-carbon/10 text-carbon"
                          : "border-border bg-surface text-muted-foreground hover:bg-surface-2",
                      )}
                    >
                      {isZh ? "不参与 · 0.5568 t/MWh" : "Not participating · 0.5568 t/MWh"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGreenTradingChoice("yes")}
                      className={cn(
                        "px-3 py-1.5 rounded-md border text-[12px] font-medium transition",
                        greenTrading === "yes"
                          ? "border-carbon/40 bg-carbon/10 text-carbon"
                          : "border-border bg-surface text-muted-foreground hover:bg-surface-2",
                      )}
                    >
                      {isZh ? "参与 · 0.5942 t/MWh" : "Participating · 0.5942 t/MWh"}
                    </button>
                  </div>
                  <p className="text-[10.5px] text-muted-foreground leading-snug">
                    {isZh ? CISA_GRID_EF_CITATION_ZH : CISA_GRID_EF_CITATION_EN}
                  </p>
                </div>

                <div className="mt-2 flex items-center gap-2 text-[11px] font-mono">
                  <span
                    className={cn(
                      "inline-block h-1.5 w-1.5 rounded-full",
                      iotStatus === "live" ? "bg-carbon animate-pulse" : "bg-muted-foreground/50",
                    )}
                  />
                  {iotStatus === "live"
                    ? isZh
                      ? "实时 · HTTP /api/iot/ingest"
                      : "Live · HTTP /api/iot/ingest"
                    : isZh
                      ? "等待 ESP32…"
                      : "Waiting for ESP32…"}
                </div>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-[11px] font-mono">
                  {[
                    {
                      k: "Vrms",
                      v:
                        iotReading?.voltage != null
                          ? `${iotReading.voltage.toFixed(4)} V`
                          : "—",
                    },
                    {
                      k: "Irms",
                      v:
                        iotReading?.current != null
                          ? `${iotReading.current.toFixed(6)} A`
                          : "—",
                    },
                    {
                      k: "Power",
                      v:
                        iotReading?.power_w != null
                          ? `${iotReading.power_w.toFixed(4)} W`
                          : iotReading?.voltage != null && iotReading?.current != null
                            ? `${(iotReading.voltage * iotReading.current).toFixed(4)} W`
                            : "—",
                    },
                    {
                      k: "kWh",
                      v:
                        iotReading != null
                          ? `${iotReading.kwh.toFixed(8)} kWh`
                          : "—",
                    },
                    {
                      k: isZh ? "电力排放" : "Grid tCO₂e",
                      v:
                        iotReading != null
                          ? `${electricityEmissionsTco2e(iotReading.kwh, greenTrading).toFixed(8)} t`
                          : "—",
                      sub: `EF ${gridEmissionFactorTPerMWh(greenTrading)} t/MWh`,
                    },
                  ].map((r) => (
                    <div
                      key={r.k}
                      className={cn(
                        "rounded-md border bg-surface p-2",
                        r.k === "kWh" || r.sub
                          ? "border-carbon/30 bg-carbon/[0.04]"
                          : "border-border",
                      )}
                    >
                      <div className="text-muted-foreground uppercase text-[10px] tracking-wider">{r.k}</div>
                      <div className="mt-0.5 text-[12.5px] tabular-nums">{r.v}</div>
                      {"sub" in r && r.sub ? (
                        <div className="mt-0.5 text-[9.5px] text-muted-foreground">{r.sub}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
                {iotReading && (
                  <div className="mt-2 text-[10px] font-mono text-muted-foreground">
                    {isZh ? "最近采样" : "Last sample"} · {iotReading.ingested_at || iotReading.reading_timestamp}
                    {" · "}
                    {isZh ? "tCO₂e = kWh÷1000 × EF" : "tCO₂e = kWh/1000 × EF"}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>

        {/* Right sticky */}
        <div className="lg:sticky lg:top-24 space-y-3 self-start">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="panel-lift p-5">
            <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              {submitted ? t(newPage.pipelineLive.en, newPage.pipelineLive.zh) : t(newPage.readySubmit.en, newPage.readySubmit.zh)}
            </div>
            <h3 className="mt-1 text-lg font-semibold tracking-tight">
              {submitted ? t(newPage.pipelineLive.en, newPage.pipelineLive.zh) : t(newPage.pipelinePreview.en, newPage.pipelinePreview.zh)}
            </h3>
            {!submitted && (
              <p className="mt-1 text-[12px] text-muted-foreground">
                {t(newPage.pipelinePreviewSub.en, newPage.pipelinePreviewSub.zh)}
              </p>
            )}

            <div className="mt-4">
              <PipelineTracker
                running={submitted}
                authorized={authorized}
                onAuthorize={() => setAuthModalOpen(true)}
                backendStages={pipelineResult?.stages ?? null}
                pipelineError={pipelineError}
              />
            </div>

            <UpstreamAuthorizationModal
              open={authModalOpen}
              onOpenChange={setAuthModalOpen}
              documentCount={readyDocs.length}
              onAuthorized={() => setAuthorized(true)}
            />

            {!submitted && (
              <>
                <div className="mt-1 hairline" />
                <div className="mt-4 space-y-1.5 text-[11.5px] font-mono">
                  <Row
                    k={t(newPage.documentsRow.en, newPage.documentsRow.zh)}
                    v={documents.length ? (isZh ? `${readyDocs.length}/${documents.length} 就绪` : `${readyDocs.length}/${documents.length} ready`) : "—"}
                  />
                  <Row
                    k={t(newPage.tonnage.en, newPage.tonnage.zh)}
                    v={totalTonnage > 0 ? `${totalTonnage.toLocaleString()} t` : "—"}
                  />
                  <Row k={t(newPage.sensor.en, newPage.sensor.zh)} v={t(newPage.sensorVal.en, newPage.sensorVal.zh)} />
                </div>

                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={() => void handleSubmit()}
                  className={cn(
                    "mt-5 w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-md text-[13.5px] font-medium transition",
                    canSubmit
                      ? "bg-primary text-primary-foreground teal-glow hover:brightness-110"
                      : "bg-muted text-muted-foreground cursor-not-allowed",
                  )}
                >
                  {t(newPage.submit.en, newPage.submit.zh)} <ArrowRight className="h-4 w-4" />
                </button>
                <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-carbon shrink-0 mt-0.5" />
                  <span>{submitHint}</span>
                </div>
              </>
            )}

            {submitted && authorized && (
              <div className="mt-4 rounded-md border border-carbon/30 bg-carbon/5 p-3 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-carbon shrink-0 mt-0.5" />
                <div className="text-[12px] text-muted-foreground">
                  {t(newPage.authorizedMsg.en, newPage.authorizedMsg.zh)}{" "}
                  <Link to="/entry" className="text-primary hover:underline">{t(newPage.continueCopilot.en, newPage.continueCopilot.zh)}</Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{k}</span>
      <span className="text-foreground text-right truncate">{v}</span>
    </div>
  );
}
