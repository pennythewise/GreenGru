// Shown in the Documents section once a file is attached, replacing the plain
// "file attached" chip with what Stage 1 (Intake, OCR) and Stage 3
// (Classify, qwen3.6-flash) produced: extracted fields grouped by invoice
// party, plus the classified CN code and the calculation method it selects.
// Includes deterministic extraction cross-check (qty×price, totals, OCR digits).
// Read-only until the operator clicks Edit — edits are pushed to the parent
// on Done so submit uses the corrected invoice.
import { useEffect, useState } from "react";
import { Check, Loader2, Pencil } from "lucide-react";

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

import { CardShell } from "./CardShell";
import { ClassificationBanner } from "./ClassificationBanner";
import { EditableField } from "./EditableField";
import { InvoiceLineItems } from "./InvoiceLineItems";
import { PartyBlock } from "./PartyBlock";
import { VerificationPanel } from "./VerificationPanel";

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
        <ClassificationBanner classification={classification} />

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

        <InvoiceLineItems data={data} canEdit={canEdit} onChange={(next) => setData(next)} />

        <div className="mt-3 flex items-center gap-4 text-[10.5px] font-mono text-muted-foreground">
          <span>收款人 {data.payee}</span>
          <span>复核 {data.reviewer}</span>
          <span>开票人 {data.issuer}</span>
        </div>
      </div>
    </CardShell>
  );
}
