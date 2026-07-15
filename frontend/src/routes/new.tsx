import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  FileUp,
  Info,
  Radio,
  Upload,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { ExtractedInvoiceCard } from "@/components/ExtractedInvoiceCard";
import { PipelineTracker } from "@/components/PipelineTracker";
import { previewOcr, type OcrPreviewResponse } from "@/lib/api";
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

function NewSubmission() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrPreview, setOcrPreview] = useState<OcrPreviewResponse | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);

  const processFile = useCallback(async (next: File) => {
    setFile(next);
    setOcrPreview(null);
    setOcrError(null);
    setOcrLoading(true);
    try {
      const result = await previewOcr(next);
      setOcrPreview(result);
    } catch (err) {
      setOcrError(err instanceof Error ? err.message : "OCR preview failed");
    } finally {
      setOcrLoading(false);
    }
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setOcrPreview(null);
    setOcrError(null);
    setOcrLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const canSubmit = !!file && !!ocrPreview && !ocrLoading && !ocrError && !submitted;

  return (
    <AppShell crumb="New submission">
      <PageHeader
        n="04"
        zh="新建"
        title="Get real data in — with guardrails"
        subtitle="Upload a document — obviously-wrong uploads get rejected before any paid model call runs."
      />

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <div className="space-y-5">
          {/* 1 · Documents */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="panel p-5">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              <FileUp className="h-3.5 w-3.5 text-teal" /> 1 · Documents
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.csv,.xlsx,.png,.jpg,.jpeg"
              onChange={(e) => {
                const picked = e.target.files?.[0];
                if (picked) void processFile(picked);
              }}
            />
            {file ? (
              <ExtractedInvoiceCard
                fileName={file.name}
                fileSizeLabel={`${(file.size / 1024).toFixed(0)} KB`}
                locked={submitted}
                loading={ocrLoading}
                error={ocrError}
                preview={ocrPreview}
                onRemove={clearFile}
              />
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const dropped = e.dataTransfer.files?.[0];
                  if (dropped) void processFile(dropped);
                }}
                className={cn(
                  "mt-3 rounded-xl border-2 border-dashed p-8 text-center transition cursor-pointer",
                  dragOver ? "border-primary bg-primary/[0.08]" : "border-primary/30 bg-primary/[0.04] hover:bg-primary/[0.08]",
                )}
              >
                <Upload className="h-8 w-8 text-primary mx-auto" strokeWidth={1.6} />
                <div className="mt-3 text-[14px] font-medium">Drop invoices / photos / PDF</div>
                <div className="mt-1 text-[12px] text-muted-foreground">or upload CSV / XLSX — structured files skip the vision model entirely</div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-surface text-[12px] font-medium hover:bg-surface-2 transition"
                >
                  Browse files
                </button>
              </div>
            )}
            <div className="mt-3 flex items-start gap-2 text-[11.5px] text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>Stage 1 intake uses chineseocr for photos; PDFs extract text and embed with Qwen text-embedding-v4 into Supabase. Missing fields fall back to cited mock invoice templates.</span>
            </div>
          </motion.div>

          {/* 2 · Sensor */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="panel p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                <Radio className="h-3.5 w-3.5 text-carbon" /> 2 · Sensor data · optional
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="peer sr-only" />
                <span className="w-9 h-5 rounded-full bg-muted peer-checked:bg-carbon transition relative">
                  <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-background rounded-full transition peer-checked:translate-x-4" />
                </span>
                <span className="text-[12px] font-mono">Include ESP32 kWh feed</span>
              </label>
            </div>
            <p className="mt-2 text-[12px] text-muted-foreground">
              Decoupled — feeds the <span className="text-carbon">grant + loan scores</span>, never the CBAM tariff number.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-mono">
              {[
                { k: "MQTT topic", v: "hf/shopfloor/mains" },
                { k: "Last reading", v: "412.8 kW · 09:41" },
                { k: "Uptime 30d", v: "98.4%" },
              ].map((r) => (
                <div key={r.k} className="rounded-md border border-border bg-surface p-2">
                  <div className="text-muted-foreground uppercase text-[10px] tracking-wider">{r.k}</div>
                  <div className="mt-0.5">{r.v}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right sticky */}
        <div className="lg:sticky lg:top-24 space-y-3 self-start">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="panel-lift p-5">
            <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              {submitted ? "Pipeline · live" : "Ready to submit"}
            </div>
            <h3 className="mt-1 text-lg font-semibold tracking-tight">
              {submitted ? "Processing your submission" : "Pipeline preview"}
            </h3>
            {!submitted && (
              <p className="mt-1 text-[12px] text-muted-foreground">
                Upload a document and hit Submit to start the six-stage pipeline — it stays idle until then.
              </p>
            )}

            <div className="mt-4">
              <PipelineTracker running={submitted} authorized={authorized} onAuthorize={() => setAuthorized(true)} />
            </div>

            {!submitted && (
              <>
                <div className="mt-1 hairline" />
                <div className="mt-4 space-y-1.5 text-[11.5px] font-mono">
                  <Row k="Tonnage" v={ocrPreview?.production_volume_tonnes ? `${ocrPreview.production_volume_tonnes.toLocaleString()} t` : "—"} />
                  <Row k="OCR source" v={ocrPreview?.ocr_source ?? "—"} />
                  <Row k="Sensor" v="attached · 30 d" />
                </div>

                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={() => setSubmitted(true)}
                  className={cn(
                    "mt-5 w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-md text-[13.5px] font-medium transition",
                    canSubmit
                      ? "bg-primary text-primary-foreground teal-glow hover:brightness-110"
                      : "bg-muted text-muted-foreground cursor-not-allowed",
                  )}
                >
                  Submit <ArrowRight className="h-4 w-4" />
                </button>
                <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-carbon shrink-0 mt-0.5" />
                  <span>
                    {file && !ocrLoading && !ocrError && ocrPreview
                      ? "Resumable — a failed stage never re-bills finished work."
                      : file && ocrLoading
                        ? "Running OCR intake on backend…"
                        : file && ocrError
                          ? "Fix the upload error above before submitting."
                          : "Upload a document above to enable submit."}
                  </span>
                </div>
              </>
            )}

            {submitted && authorized && (
              <div className="mt-4 rounded-md border border-carbon/30 bg-carbon/5 p-3 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-carbon shrink-0 mt-0.5" />
                <div className="text-[12px] text-muted-foreground">
                  Submitted to Upstream. <Link to="/" className="text-primary hover:underline">Back to dashboard →</Link>
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
