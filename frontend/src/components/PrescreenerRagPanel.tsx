"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { BookOpen, FileText, Library, Loader2, Sparkles, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale";
import { ingestKbPdfs, type RagChannel, type RagChunk, type RagQueryResult } from "@/lib/api";

function simPct(sim: number) {
  return `${Math.round(Math.max(0, Math.min(1, sim)) * 100)}%`;
}

function simTone(sim: number, accent: "teal" | "primary" | "gold", threshold = 0.7) {
  if (sim >= threshold) return "text-carbon border-carbon/30 bg-carbon/10";
  if (sim >= 0.35) {
    if (accent === "gold") return "text-gold border-gold/30 bg-gold/10";
    if (accent === "primary") return "text-primary border-primary/30 bg-primary/10";
    return "text-teal border-teal/30 bg-teal/10";
  }
  return "text-muted-foreground border-border bg-surface/50";
}

/** Prefer "Page N" from heading_path; else heading; else chunk index. */
function pageLabel(c: RagChunk, isZh: boolean, index: number): string {
  const h = (c.heading_path || "").trim();
  const pageMatch = h.match(/Page\s*(\d+)/i) || h.match(/第\s*(\d+)\s*页/);
  if (pageMatch) return isZh ? `第 ${pageMatch[1]} 页` : `Page ${pageMatch[1]}`;
  if (h) return h.length > 48 ? `${h.slice(0, 48)}…` : h;
  return isZh ? `片段 ${index + 1}` : `Chunk ${index + 1}`;
}

function snippet(text: string, max = 180): string {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (!t) return "—";
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

function originMeta(c: RagChunk, isZh: boolean) {
  const corpus = c.corpus || (c.checklist_item === "application_form" ? "form" : "kb");
  if (corpus === "form") {
    return {
      fromKb: false,
      label: isZh ? "申请表" : "Application form",
      Icon: FileText,
    };
  }
  const fromKb = corpus === "kb" || !corpus;
  return {
    fromKb,
    label: fromKb
      ? isZh
        ? "法规知识库"
        : "Regulatory KB"
      : isZh
        ? "用户上传"
        : "User upload",
    Icon: fromKb ? BookOpen : Upload,
  };
}

const COPY: Record<
  RagChannel,
  {
    accent: "teal" | "primary" | "gold";
    eyebrowEn: string;
    eyebrowZh: string;
    titleEn: string;
    titleZh: string;
    blurbEn: string;
    blurbZh: string;
    emptyEn: string;
    emptyZh: string;
    agentEn: string;
    agentZh: string;
    kbHintEn: string;
    kbHintZh: string;
    border: string;
    gradient: string;
    text: string;
    chip: string;
  }
> = {
  cbam: {
    accent: "teal",
    eyebrowEn: "EU license · Stage 1 · top 3",
    eyebrowZh: "欧盟许可 · 阶段 1 · Top 3",
    titleEn: "Pre-screener retrieve · snippet + origin",
    titleZh: "预筛检索 · 摘要 + 出处",
    blurbEn:
      "Section A uploads vs regulatory KB · cosine ≥ 70% · top 3 by relevancy · confidence score.",
    blurbZh: "Section A 上传 ↔ 法规库余弦 ≥ 70% · 取 Top 3 · 输出置信度。",
    emptyEn:
      "No ranked chunks yet. Upload a KB PDF below, process Section A, then re-run Stage 1.",
    emptyZh: "暂无检索结果。请先上传法规库 PDF、处理 Section A，再运行 Stage 1。",
    agentEn: "upload↔KB cosine · thr 70% · top 3 · confidence",
    agentZh: "上传↔法规库余弦 · 阈值 70% · Top 3 · 置信度",
    kbHintEn: "Upload CBAM KB PDF · PyMuPDF→pypdf → Qwen3-Embedding-8B → Supabase",
    kbHintZh: "上传 CBAM 法规库 PDF · PyMuPDF→pypdf → Qwen3-Embedding-8B → Supabase",
    border: "border-teal/30",
    gradient: "from-teal/[0.08] via-surface/40 to-primary/[0.04]",
    text: "text-teal",
    chip: "border-teal/30 bg-teal/10 text-teal",
  },
  grant: {
    accent: "primary",
    eyebrowEn: "Grant · Stage 1 · top 3",
    eyebrowZh: "补贴 · 阶段 1 · Top 3",
    titleEn: "Pre-screener retrieve · snippet + origin",
    titleZh: "预筛检索 · 摘要 + 出处",
    blurbEn:
      "Application form + Section A uploads vs GB/T 36132 KB · cosine ≥ 70% · top 3 · confidence.",
    blurbZh: "申请表 + Section A 上传 ↔ GB/T 36132 库余弦 ≥ 70% · Top 3 · 置信度。",
    emptyEn:
      "No ranked chunks yet. Upload GB/T 36132 KB PDF below, then re-run Stage 1.",
    emptyZh: "暂无检索结果。请先上传 GB/T 36132 法规库 PDF，再运行 Stage 1。",
    agentEn: "upload↔KB cosine · thr 70% · top 3 · confidence",
    agentZh: "上传↔法规库余弦 · 阈值 70% · Top 3 · 置信度",
    kbHintEn: "Upload grant KB PDF · PyMuPDF→pypdf → Qwen3-Embedding-8B → Supabase",
    kbHintZh: "上传补贴法规库 PDF · PyMuPDF→pypdf → Qwen3-Embedding-8B → Supabase",
    border: "border-primary/30",
    gradient: "from-primary/[0.08] via-surface/40 to-carbon/[0.04]",
    text: "text-primary",
    chip: "border-primary/30 bg-primary/10 text-primary",
  },
  loan: {
    accent: "gold",
    eyebrowEn: "Loan · Stage 1 · top 3",
    eyebrowZh: "绿贷 · 阶段 1 · Top 3",
    titleEn: "Pre-screener retrieve · snippet + origin",
    titleZh: "预筛检索 · 摘要 + 出处",
    blurbEn:
      "Application form + Section A uploads vs KB · cosine ≥ 70% · top 3 · confidence.",
    blurbZh: "申请表 + Section A 上传 ↔ 法规库余弦 ≥ 70% · Top 3 · 置信度。",
    emptyEn:
      "No ranked chunks yet. Upload green-finance / GB/T KB PDF below, then re-run Stage 1.",
    emptyZh: "暂无检索结果。请先上传绿金目录 / GB/T 法规库 PDF，再运行 Stage 1。",
    agentEn: "upload↔KB cosine · thr 70% · top 3 · confidence",
    agentZh: "上传↔法规库余弦 · 阈值 70% · Top 3 · 置信度",
    kbHintEn: "Upload loan KB PDF · PyMuPDF→pypdf → Qwen3-Embedding-8B → Supabase",
    kbHintZh: "上传绿贷法规库 PDF · PyMuPDF→pypdf → Qwen3-Embedding-8B → Supabase",
    border: "border-gold/30",
    gradient: "from-gold/[0.08] via-surface/40 to-primary/[0.04]",
    text: "text-gold",
    chip: "border-gold/30 bg-gold/10 text-gold",
  },
};

function KbUploadBar({ channel }: { channel: RagChannel }) {
  const { isZh } = useLocale();
  const copy = COPY[channel];
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onFiles(list: FileList | null) {
    if (!list?.length || busy) return;
    const files = Array.from(list).filter((f) => f.name.toLowerCase().endsWith(".pdf"));
    if (!files.length) {
      setErr(isZh ? "仅支持 PDF" : "PDF only");
      return;
    }
    setBusy(true);
    setErr(null);
    setStatus(
      isZh
        ? `解析并嵌入 ${files.length} 个法规库 PDF…`
        : `Extracting & embedding ${files.length} KB PDF(s)…`,
    );
    try {
      const batch = await ingestKbPdfs({
        files,
        channel,
        language: channel === "cbam" ? "en" : "zh",
      });
      const failed = batch.results.filter((r) => !r.stored);
      const cacheHits = batch.cache_hits ?? batch.results.filter((r) => r.cached).length;
      setStatus(
        isZh
          ? `已写入 ${batch.stored_count}/${batch.file_count} 个文件 · ${batch.embedded_chunks} 片段` +
              (cacheHits ? ` · ${cacheHits} 个命中缓存（跳过重处理）` : "") +
              ` → Supabase`
          : `Stored ${batch.stored_count}/${batch.file_count} file(s) · ${batch.embedded_chunks} chunks` +
              (cacheHits ? ` · ${cacheHits} cache hit(s) (skipped reprocess)` : "") +
              ` → Supabase`,
      );
      if (failed.length) {
        setErr(
          failed
            .map((r) => `${r.source_file || "pdf"}: ${r.reason || "failed"}`)
            .join("; "),
        );
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setStatus(null);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-border/80 bg-surface/50 px-3 py-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="sr-only"
          onChange={(e) => void onFiles(e.target.files)}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-mono transition-colors",
            copy.chip,
            busy ? "opacity-60 cursor-wait" : "hover:bg-surface",
          )}
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Library className="h-3.5 w-3.5" />
          )}
          {isZh ? "上传法规库 PDF" : "Upload KB PDF"}
        </button>
        <span className="text-[10.5px] text-muted-foreground">
          {isZh ? copy.kbHintZh : copy.kbHintEn}
        </span>
      </div>
      {status ? (
        <p className={cn("text-[11px] font-mono", copy.text)}>{status}</p>
      ) : null}
      {err ? <p className="text-[11px] text-danger">{err}</p> : null}
    </div>
  );
}

export function PrescreenerRagPanel({
  channel,
  result,
  error,
}: {
  channel: RagChannel;
  result: RagQueryResult | null;
  error?: string | null;
}) {
  const { isZh } = useLocale();
  const copy = COPY[channel];

  const chunks = (result?.chunks ?? []).slice(0, 3);
  const threshold = result?.threshold ?? 0.7;
  const confidence = Math.max(0, Math.min(1, result?.confidence_score ?? 0));
  const passes = result?.passes_threshold ?? (result != null && confidence >= threshold);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border bg-gradient-to-br p-5 space-y-4",
        copy.border,
        copy.gradient,
      )}
    >
      <KbUploadBar channel={channel} />

      {error ? (
        <div className="rounded-lg border border-danger/40 bg-danger/[0.06] p-3 text-[12px] text-danger">
          {error}
        </div>
      ) : null}

      {!result && !error ? (
        <div className="rounded-lg border border-dashed border-border bg-surface/40 p-4 text-[12px] text-muted-foreground">
          {isZh
            ? "运行流水线 Stage 1 后显示 Top 3 检索结果。可先上传法规库 PDF。"
            : "Run pipeline Stage 1 to see top-3 hits. You can upload KB PDFs first."}
        </div>
      ) : null}

      {result ? (
        <>
          <div className="flex flex-wrap items-start gap-4">
            <div className="relative h-[64px] w-[64px] shrink-0">
              <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
                <circle
                  cx="36"
                  cy="36"
                  r="30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-border/60"
                />
                <motion.circle
                  cx="36"
                  cy="36"
                  r="30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className={cn(passes ? "text-carbon" : copy.text)}
                  strokeDasharray={2 * Math.PI * 30}
                  initial={{ strokeDashoffset: 2 * Math.PI * 30 }}
                  animate={{
                    strokeDashoffset: 2 * Math.PI * 30 * (1 - confidence),
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("text-[13px] font-semibold tabular-nums", copy.text)}>
                  {simPct(confidence)}
                </span>
                <span className="text-[8px] font-mono text-muted-foreground mt-0.5">
                  {isZh ? "置信度" : "conf"}
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className={cn("text-[10px] font-mono uppercase tracking-wide", copy.text)}>
                {isZh ? copy.eyebrowZh : copy.eyebrowEn}
              </p>
              <h3 className="text-[14px] font-semibold text-foreground">
                {isZh ? copy.titleZh : copy.titleEn}
              </h3>
              <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                {isZh ? copy.blurbZh : copy.blurbEn}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10.5px] font-mono",
                    passes
                      ? "border-carbon/30 bg-carbon/10 text-carbon"
                      : "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300",
                  )}
                >
                  {passes
                    ? isZh
                      ? `通过 · 阈值 ${simPct(threshold)}`
                      : `Pass · thr ${simPct(threshold)}`
                    : isZh
                      ? `未达阈值 ${simPct(threshold)}`
                      : `Below thr ${simPct(threshold)}`}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10.5px] font-mono",
                    copy.chip,
                  )}
                >
                  Top {chunks.length}/3 · form+upload↔KB
                </span>
                {(result.form_chunks_scored != null || result.upload_chunks_scored != null) && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10.5px] font-mono",
                      copy.chip,
                    )}
                  >
                    form {result.form_chunks_scored ?? 0} · docs {result.upload_chunks_scored ?? 0}
                  </span>
                )}
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10.5px] font-mono",
                    copy.chip,
                  )}
                >
                  Qwen3-Embedding-8B · {result.source ?? "hybrid"}
                </span>
              </div>
            </div>
          </div>

          {chunks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-surface/40 p-4 text-[12px] text-muted-foreground">
              {isZh ? copy.emptyZh : copy.emptyEn}
            </div>
          ) : (
            <ul className="space-y-2.5">
              {chunks.map((c, i) => {
                const origin = originMeta(c, isZh);
                const OriginIcon = origin.Icon;
                return (
                  <li
                    key={`${c.source_file}-${c.chunk_index}-${i}`}
                    className="rounded-lg border border-border bg-surface/40 px-3 py-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className={cn("font-mono text-[11px] shrink-0 mt-0.5", copy.text)}>
                          #{i + 1}
                        </span>
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-mono",
                                c.corpus === "form"
                                  ? "border-gold/30 bg-gold/10 text-gold"
                                  : origin.fromKb
                                    ? "border-teal/30 bg-teal/10 text-teal"
                                    : "border-primary/30 bg-primary/10 text-primary",
                              )}
                            >
                              <OriginIcon className="h-3 w-3" />
                              {origin.label}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                              <FileText className="h-3 w-3" />
                              {pageLabel(c, isZh, i)}
                            </span>
                          </div>
                          <div className="text-[10.5px] font-mono text-muted-foreground truncate">
                            {isZh ? "来源文件" : "Source"}: {c.source_file || "—"}
                          </div>
                          {c.matched_kb_file ? (
                            <div className="text-[10.5px] font-mono text-muted-foreground truncate">
                              {isZh ? "匹配法规库" : "Matched KB"}: {c.matched_kb_file}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 px-2 py-1 rounded border text-[12px] font-mono font-semibold tabular-nums",
                          simTone(c.similarity, copy.accent, threshold),
                        )}
                        title={isZh ? "上传↔法规库余弦相关度" : "Upload↔KB cosine relevancy"}
                      >
                        {simPct(c.similarity)}
                      </span>
                    </div>
                    <p className="text-[12px] leading-relaxed text-foreground/85 pl-5">
                      {snippet(c.chunk_text)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-muted-foreground pt-1 border-t border-border/50">
            <Sparkles className={cn("h-3 w-3", copy.text)} />
            {isZh ? copy.agentZh : copy.agentEn}
          </div>
        </>
      ) : null}
    </motion.div>
  );
}

/** @deprecated Prefer PrescreenerRagPanel channel="cbam" */
export function CbamPrescreenerRagPanel(props: {
  result: RagQueryResult | null;
  error?: string | null;
}) {
  return <PrescreenerRagPanel channel="cbam" {...props} />;
}
