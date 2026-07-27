// Shown in the Documents section once a file is attached, replacing the plain
// "file attached" chip with what Stage 1 (Intake, OCR) and Stage 3
// (Classify, qwen3.6-flash) produced: extracted fields grouped by invoice
// party, plus the classified CN code and the calculation method it selects.
// Includes deterministic extraction cross-check (qty×price, totals, OCR digits).
// Read-only until the operator clicks Edit — edits are pushed to the parent
// on Done so submit uses the corrected invoice.
import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  FileText,
  Loader2,
  Pencil,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  verifyExtract,
  type ClassificationPreview,
  type ExtractionVerification,
  type InvoiceData,
  type OcrPreviewResponse,
} from "@/lib/api";
import { useLocale } from "@/lib/locale";
import { invoiceCard } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

type Party = { name: string; taxId: string; addressPhone: string; bankAccount: string };

function EditableField({
  label,
  value,
  editing,
  onChange,
  mono = false,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80">{label}</div>
      {editing ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "mt-0.5 w-full bg-surface border border-input rounded px-2 py-1 text-[12.5px] outline-none focus:border-ring focus:ring-2 focus:ring-ring/25",
            mono && "font-mono",
          )}
        />
      ) : (
        <div className={cn("mt-0.5 text-[12.5px]", mono && "font-mono")}>{value}</div>
      )}
    </div>
  );
}

function PartyBlock({
  title,
  zh,
  party,
  editing,
  onChange,
}: {
  title: string;
  zh: string;
  party: Party;
  editing: boolean;
  onChange: (next: Party) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface/40 p-3 space-y-2.5">
      <div className="text-[11px] font-mono uppercase tracking-[0.12em] text-teal">
        {title} · {zh}
      </div>
      <EditableField label="名称 · Name" value={party.name} editing={editing} onChange={(v) => onChange({ ...party, name: v })} />
      <EditableField
        label="纳税人识别号 · Tax ID"
        value={party.taxId}
        editing={editing}
        onChange={(v) => onChange({ ...party, taxId: v })}
        mono
      />
      <EditableField
        label="地址、电话 · Address / phone"
        value={party.addressPhone}
        editing={editing}
        onChange={(v) => onChange({ ...party, addressPhone: v })}
      />
      <EditableField
        label="开户行及账号 · Bank"
        value={party.bankAccount}
        editing={editing}
        onChange={(v) => onChange({ ...party, bankAccount: v })}
        mono
      />
    </div>
  );
}

function VerificationPanel({
  verification,
  busy,
}: {
  verification: ExtractionVerification | null;
  busy?: boolean;
}) {
  const { t, isZh } = useLocale();
  if (busy) {
    return (
      <div className="mt-3 rounded-lg border border-border bg-surface/40 p-3 flex items-center gap-2 text-[12px] text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        {t(invoiceCard.verifyReRunning.en, invoiceCard.verifyReRunning.zh)}
      </div>
    );
  }
  if (!verification) return null;

  const tone =
    verification.status === "pass"
      ? "border-carbon/35 bg-carbon/[0.07] text-carbon"
      : verification.status === "fail"
        ? "border-danger/40 bg-danger/[0.08] text-danger"
        : "border-warning/40 bg-warning/[0.08] text-warning";
  const label =
    verification.status === "pass"
      ? t(invoiceCard.verifyPass.en, invoiceCard.verifyPass.zh)
      : verification.status === "fail"
        ? t(invoiceCard.verifyFail.en, invoiceCard.verifyFail.zh)
        : t(invoiceCard.verifyWarn.en, invoiceCard.verifyWarn.zh);
  const Icon =
    verification.status === "pass" ? CheckCircle2 : verification.status === "fail" ? X : AlertTriangle;

  const issues = verification.checks.filter((c) => c.status !== "pass");

  return (
    <div className={cn("mt-3 rounded-lg border p-3", tone)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.12em]">
          <Icon className="h-3.5 w-3.5" />
          {t(invoiceCard.verifyTitle.en, invoiceCard.verifyTitle.zh)} · {label}
        </div>
        <span className="text-[11px] font-mono tabular-nums">{verification.score_pct}%</span>
      </div>
      <p className="mt-1.5 text-[12px] leading-relaxed text-foreground/90">
        {isZh ? verification.summary_zh : verification.summary_en}
      </p>
      <p className="mt-1 text-[10.5px] text-muted-foreground">
        {t(invoiceCard.verifyHint.en, invoiceCard.verifyHint.zh)}
      </p>
      {issues.length > 0 && (
        <ul className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
          {issues.map((c) => (
            <li key={c.id} className="text-[11.5px] leading-snug flex gap-1.5">
              <span className="font-mono shrink-0 uppercase opacity-80">{c.status}</span>
              <span>
                {isZh ? c.message_zh : c.message_en}
                {c.expected != null && c.actual != null && (
                  <span className="font-mono text-muted-foreground">
                    {" "}
                    (exp {c.expected} · got {c.actual})
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CardShell({
  fileName,
  fileSizeLabel,
  expanded,
  onToggleExpand,
  onRemove,
  locked,
  status,
  summary,
  children,
}: {
  fileName: string;
  fileSizeLabel: string;
  expanded: boolean;
  onToggleExpand: () => void;
  onRemove: () => void;
  locked?: boolean;
  status: "loading" | "error" | "ready";
  summary?: string;
  children?: ReactNode;
}) {
  const { t } = useLocale();
  const statusTone =
    status === "loading" ? "text-primary" : status === "error" ? "text-danger" : "text-carbon";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-surface/40 overflow-hidden"
    >
      <div className="flex items-start gap-2.5 p-3">
        <button
          type="button"
          onClick={onToggleExpand}
          aria-expanded={expanded}
          aria-label={
            expanded
              ? t(invoiceCard.collapse.en, invoiceCard.collapse.zh)
              : t(invoiceCard.expand.en, invoiceCard.expand.zh)
          }
          className="mt-0.5 h-8 w-8 rounded-lg border border-border bg-surface flex items-center justify-center shrink-0 hover:bg-surface-2 transition"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
        </button>
        <div className="h-8 w-8 rounded-lg bg-carbon/15 text-carbon flex items-center justify-center shrink-0 mt-0.5">
          {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
        </div>
        <button type="button" onClick={onToggleExpand} className="min-w-0 flex-1 text-left">
          <div className="text-[13px] font-medium truncate">{fileName}</div>
          <div className="text-[11px] font-mono text-muted-foreground truncate">
            {fileSizeLabel}
            {summary && <> · {summary}</>}
          </div>
          <div className={cn("mt-0.5 text-[10.5px] font-mono uppercase tracking-wider", statusTone)}>
            {status === "loading"
              ? t(invoiceCard.ocrRunning.en, invoiceCard.ocrRunning.zh)
              : status === "error"
                ? t(invoiceCard.ocrFailed.en, invoiceCard.ocrFailed.zh)
                : t(invoiceCard.ready.en, invoiceCard.ready.zh)}
          </div>
        </button>
        {!locked && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={t(invoiceCard.remove.en, invoiceCard.remove.zh)}
            className="h-7 w-7 rounded-md border border-border bg-surface flex items-center justify-center hover:bg-surface-2 transition shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {expanded && children && <div className="px-4 pb-4 pt-0 border-t border-border/60">{children}</div>}
    </motion.div>
  );
}

export function ExtractedInvoiceCard({
  fileName,
  fileSizeLabel,
  onRemove,
  locked = false,
  loading = false,
  error = null,
  preview = null,
  expanded = true,
  onToggleExpand,
  onInvoiceChange,
}: {
  fileName: string;
  fileSizeLabel: string;
  onRemove: () => void;
  locked?: boolean;
  loading?: boolean;
  error?: string | null;
  preview?: OcrPreviewResponse | null;
  expanded?: boolean;
  onToggleExpand?: () => void;
  /** Fired when operator finishes editing — parent should store invoice + verification. */
  onInvoiceChange?: (next: { invoice: InvoiceData; verification: ExtractionVerification | null }) => void;
}) {
  const [editing, setEditing] = useState(false);
  const { t } = useLocale();
  const [data, setData] = useState<InvoiceData | null>(preview?.invoice ?? null);
  const [classification, setClassification] = useState<ClassificationPreview | null>(
    preview?.classification ?? null,
  );
  const [verification, setVerification] = useState<ExtractionVerification | null>(
    preview?.verification ?? null,
  );
  const [verifyBusy, setVerifyBusy] = useState(false);
  const canEdit = editing && !locked && !!data;

  useEffect(() => {
    if (preview) {
      setData(preview.invoice);
      setClassification(preview.classification);
      setVerification(preview.verification ?? null);
      setEditing(false);
    }
  }, [preview]);

  async function finishEditing() {
    if (!data || !preview) {
      setEditing(false);
      return;
    }
    setVerifyBusy(true);
    try {
      const next = await verifyExtract({
        invoice: data,
        ocr_text_preview: preview.ocr_text_preview,
        mock_fields: preview.mock_fields,
        ocr_source: preview.ocr_source,
      });
      setVerification(next);
      onInvoiceChange?.({ invoice: data, verification: next });
    } catch {
      onInvoiceChange?.({ invoice: data, verification });
    } finally {
      setVerifyBusy(false);
      setEditing(false);
    }
  }

  const toggle = onToggleExpand ?? (() => {});

  if (loading) {
    return (
      <CardShell
        fileName={fileName}
        fileSizeLabel={fileSizeLabel}
        expanded={expanded}
        onToggleExpand={toggle}
        onRemove={onRemove}
        locked={locked}
        status="loading"
        summary="PaddleOCR → classify → verify"
      >
        <div className="py-6 text-center">
          <Loader2 className="h-7 w-7 text-primary mx-auto animate-spin" />
          <div className="mt-3 text-[13px] font-medium">
            {t(invoiceCard.runningIntake.en, invoiceCard.runningIntake.zh)}
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            {t(invoiceCard.intakeDetail.en, invoiceCard.intakeDetail.zh)}
          </div>
        </div>
      </CardShell>
    );
  }

  if (error) {
    return (
      <CardShell
        fileName={fileName}
        fileSizeLabel={fileSizeLabel}
        expanded={expanded}
        onToggleExpand={toggle}
        onRemove={onRemove}
        locked={locked}
        status="error"
      >
        <div className="py-3">
          <div className="text-[13px] font-medium text-danger">
            {t(invoiceCard.previewFailed.en, invoiceCard.previewFailed.zh)}
          </div>
          <div className="mt-1 text-[12px] text-muted-foreground">{error}</div>
        </div>
      </CardShell>
    );
  }

  if (!data || !classification) return null;

  const summary = `CN ${classification.cnCode}${verification ? ` · ${verification.status} ${verification.score_pct}%` : ""}`;

  return (
    <CardShell
      fileName={fileName}
      fileSizeLabel={fileSizeLabel}
      expanded={expanded}
      onToggleExpand={toggle}
      onRemove={onRemove}
      locked={locked}
      status="ready"
      summary={summary}
    >
      <div className="pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[13px] font-medium">
              {t(invoiceCard.extractedTitle.en, invoiceCard.extractedTitle.zh)}
            </div>
          </div>
          {!locked && (
            <button
              type="button"
              disabled={verifyBusy}
              onClick={() => {
                if (editing) void finishEditing();
                else setEditing(true);
              }}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-[11.5px] font-medium transition shrink-0",
                editing ? "border-carbon/50 bg-carbon/15 text-carbon" : "border-border bg-surface hover:bg-surface-2",
              )}
            >
              {verifyBusy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : editing ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Pencil className="h-3.5 w-3.5" />
              )}
              {editing ? t(invoiceCard.done.en, invoiceCard.done.zh) : t(invoiceCard.edit.en, invoiceCard.edit.zh)}
            </button>
          )}
        </div>

        <div className="mt-2 text-[11px] text-muted-foreground">
          {locked
            ? t(invoiceCard.lockedNote.en, invoiceCard.lockedNote.zh)
            : t(invoiceCard.editNote.en, invoiceCard.editNote.zh)}
        </div>

        <VerificationPanel verification={verification} busy={verifyBusy} />

        <div className="mt-3 rounded-lg border border-teal/30 bg-teal/[0.06] p-3">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.12em] text-teal">
            <ShieldCheck className="h-3.5 w-3.5" /> {t(invoiceCard.classified.en, invoiceCard.classified.zh)}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded border border-teal/40 bg-teal/10 text-[12px] font-mono text-foreground">
              CN {classification.cnCode}
            </span>
            <span className="text-[11.5px] text-muted-foreground">{classification.cnLabel}</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-muted-foreground">
            qwen3.6-flash {classification.flashConfidence}%
            {classification.escalated && classification.plusConfidence != null && (
              <>
                {" "}
                · {t(invoiceCard.lowConfidence.en, invoiceCard.lowConfidence.zh)} qwen3.7-plus{" "}
                {classification.plusConfidence}%
              </>
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-border/60 text-[11.5px]">
            <span className="text-muted-foreground">
              {t(invoiceCard.calcMethod.en, invoiceCard.calcMethod.zh)}{" "}
            </span>
            <span className="font-medium">{classification.route}</span>
            <span className="text-muted-foreground"> {t(invoiceCard.route.en, invoiceCard.route.zh)} · </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {classification.benchmark} · {classification.defaultIntensity}
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <EditableField
            label="发票代码 · Invoice code"
            value={data.invoiceCode}
            editing={canEdit}
            onChange={(v) => setData((d) => d && { ...d, invoiceCode: v })}
            mono
          />
          <EditableField
            label="发票号码 · Invoice No"
            value={data.invoiceNumber}
            editing={canEdit}
            onChange={(v) => setData((d) => d && { ...d, invoiceNumber: v })}
            mono
          />
        </div>

        <div className="mt-3 grid md:grid-cols-2 gap-3">
          <PartyBlock
            title="购买方"
            zh="Buyer"
            party={data.buyer}
            editing={canEdit}
            onChange={(p) => setData((d) => d && { ...d, buyer: p })}
          />
          <PartyBlock
            title="销售方"
            zh="Seller"
            party={data.seller}
            editing={canEdit}
            onChange={(p) => setData((d) => d && { ...d, seller: p })}
          />
        </div>

        <div className="mt-3 rounded-lg border border-border bg-surface/40 p-3">
          <div className="text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
            {t(invoiceCard.lineItems.en, invoiceCard.lineItems.zh)}
          </div>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-[11.5px]">
              <thead>
                <tr className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-1.5 pr-2 text-left">名称</th>
                  <th className="py-1.5 pr-2 text-left">规格</th>
                  <th className="py-1.5 pr-2 text-right">数量</th>
                  <th className="py-1.5 pr-2 text-right">单价</th>
                  <th className="py-1.5 pr-2 text-right">金额</th>
                  <th className="py-1.5 pr-2 text-right">税率</th>
                  <th className="py-1.5 text-right">税额</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {data.items.map((it, i) => (
                  <tr key={i} className="border-b border-border/60 last:border-0">
                    <td className="py-1.5 pr-2">{it.name}</td>
                    <td className="py-1.5 pr-2">{it.spec}</td>
                    <td className="py-1.5 pr-2 text-right">
                      {canEdit ? (
                        <input
                          value={it.qty}
                          onChange={(e) =>
                            setData((d) => {
                              if (!d) return d;
                              const items = [...d.items];
                              items[i] = { ...items[i], qty: e.target.value };
                              return { ...d, items };
                            })
                          }
                          className="w-16 bg-surface border border-input rounded px-1 py-0.5 text-right"
                        />
                      ) : (
                        <>
                          {it.qty} {it.unit}
                        </>
                      )}
                    </td>
                    <td className="py-1.5 pr-2 text-right">
                      {canEdit ? (
                        <input
                          value={it.unitPrice}
                          onChange={(e) =>
                            setData((d) => {
                              if (!d) return d;
                              const items = [...d.items];
                              items[i] = { ...items[i], unitPrice: e.target.value };
                              return { ...d, items };
                            })
                          }
                          className="w-20 bg-surface border border-input rounded px-1 py-0.5 text-right"
                        />
                      ) : (
                        it.unitPrice
                      )}
                    </td>
                    <td className="py-1.5 pr-2 text-right">
                      {canEdit ? (
                        <input
                          value={it.amount}
                          onChange={(e) =>
                            setData((d) => {
                              if (!d) return d;
                              const items = [...d.items];
                              items[i] = { ...items[i], amount: e.target.value };
                              return { ...d, items };
                            })
                          }
                          className="w-20 bg-surface border border-input rounded px-1 py-0.5 text-right"
                        />
                      ) : (
                        it.amount
                      )}
                    </td>
                    <td className="py-1.5 pr-2 text-right">{it.taxRate}</td>
                    <td className="py-1.5 text-right">{it.tax}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 pt-2 border-t border-border flex flex-wrap items-center justify-end gap-4 text-[11.5px] font-mono">
            <span className="text-muted-foreground inline-flex items-center gap-1">
              合计金额{" "}
              {canEdit ? (
                <input
                  value={data.totalAmount}
                  onChange={(e) => setData((d) => d && { ...d, totalAmount: e.target.value })}
                  className="w-24 bg-surface border border-input rounded px-1 py-0.5 text-foreground"
                />
              ) : (
                <span className="text-foreground">¥{data.totalAmount}</span>
              )}
            </span>
            <span className="text-muted-foreground inline-flex items-center gap-1">
              税额{" "}
              {canEdit ? (
                <input
                  value={data.totalTax}
                  onChange={(e) => setData((d) => d && { ...d, totalTax: e.target.value })}
                  className="w-20 bg-surface border border-input rounded px-1 py-0.5 text-foreground"
                />
              ) : (
                <span className="text-foreground">¥{data.totalTax}</span>
              )}
            </span>
            <span className="text-muted-foreground inline-flex items-center gap-1">
              价税合计{" "}
              {canEdit ? (
                <input
                  value={data.totalWithTax}
                  onChange={(e) => setData((d) => d && { ...d, totalWithTax: e.target.value })}
                  className="w-24 bg-surface border border-input rounded px-1 py-0.5 text-gold"
                />
              ) : (
                <span className="text-gold">¥{data.totalWithTax}</span>
              )}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4 text-[10.5px] font-mono text-muted-foreground">
          <span>收款人 {data.payee}</span>
          <span>复核 {data.reviewer}</span>
          <span>开票人 {data.issuer}</span>
        </div>
      </div>
    </CardShell>
  );
}
