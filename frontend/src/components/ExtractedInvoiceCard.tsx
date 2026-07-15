// Shown in the Documents section once a file is attached, replacing the plain
// "file attached" chip with what Stage 1 (Intake, OCR + StructBERT) and Stage 3
// (Classify, CN-code classifier) would actually hand back: extracted fields
// grouped by invoice party, plus the classified CN code and the calculation
// method it selects. Read-only until the operator clicks Edit (top right) —
// if they never touch it, the extracted values are what gets submitted as-is.
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, FileText, Loader2, Pencil, ShieldCheck, X } from "lucide-react";

import type { ClassificationPreview, InvoiceData, OcrPreviewResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

type Party = { name: string; taxId: string; addressPhone: string; bankAccount: string };
type LineItem = { name: string; spec: string; unit: string; qty: string; unitPrice: string; amount: string; taxRate: string; tax: string };

function EditableField({ label, value, editing, onChange, mono = false }: {
  label: string; value: string; editing: boolean; onChange: (v: string) => void; mono?: boolean;
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

function PartyBlock({ title, zh, party, editing, onChange }: {
  title: string; zh: string; party: Party; editing: boolean; onChange: (next: Party) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface/40 p-3 space-y-2.5">
      <div className="text-[11px] font-mono uppercase tracking-[0.12em] text-teal">{title} · {zh}</div>
      <EditableField label="名称 · Name" value={party.name} editing={editing} onChange={(v) => onChange({ ...party, name: v })} />
      <EditableField label="纳税人识别号 · Tax ID" value={party.taxId} editing={editing} onChange={(v) => onChange({ ...party, taxId: v })} mono />
      <EditableField label="地址、电话 · Address / phone" value={party.addressPhone} editing={editing} onChange={(v) => onChange({ ...party, addressPhone: v })} />
      <EditableField label="开户行及账号 · Bank" value={party.bankAccount} editing={editing} onChange={(v) => onChange({ ...party, bankAccount: v })} mono />
    </div>
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
}: {
  fileName: string;
  fileSizeLabel: string;
  onRemove: () => void;
  locked?: boolean;
  loading?: boolean;
  error?: string | null;
  preview?: OcrPreviewResponse | null;
}) {
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<InvoiceData | null>(preview?.invoice ?? null);
  const [classification, setClassification] = useState<ClassificationPreview | null>(preview?.classification ?? null);
  const canEdit = editing && !locked && !!data;

  useEffect(() => {
    if (preview) {
      setData(preview.invoice);
      setClassification(preview.classification);
      setEditing(false);
    }
  }, [preview]);

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-xl border border-border bg-surface/40 p-8 text-center">
        <Loader2 className="h-8 w-8 text-primary mx-auto animate-spin" />
        <div className="mt-3 text-[14px] font-medium">Running OCR intake…</div>
        <div className="mt-1 text-[12px] text-muted-foreground font-mono">{fileName}</div>
        <div className="mt-2 text-[11px] text-muted-foreground">chineseocr → field parse → CN classify · PDFs also embed via text-embedding-v4</div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-xl border border-danger/40 bg-danger/5 p-4">
        <div className="text-[13.5px] font-medium text-danger">OCR preview failed</div>
        <div className="mt-1 text-[12px] text-muted-foreground">{error}</div>
        <button type="button" onClick={onRemove} className="mt-3 text-[12px] font-mono text-primary hover:underline">Remove and try again</button>
      </motion.div>
    );
  }

  if (!data || !classification) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-xl border border-carbon/40 bg-carbon/[0.04] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-carbon/15 text-carbon flex items-center justify-center shrink-0 mt-0.5">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[13.5px] font-medium">Extracted info with classified result</div>
            <div className="text-[11px] font-mono text-muted-foreground">提取信息与分类结果 · {fileName} · {fileSizeLabel}</div>
            {preview && (
              <div className="mt-1 text-[10.5px] font-mono text-muted-foreground">
                OCR: {preview.ocr_source}
                {preview.mock_fields.length > 0 && <> · mock fill: {preview.mock_fields[0]}</>}
                {preview.pdf_embedding?.embedded && <> · PDF embedded ({preview.pdf_embedding.chunk_count} chunks → {preview.pdf_embedding.storage})</>}
              </div>
            )}
          </div>
        </div>
        {!locked && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setEditing((e) => !e)}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-[11.5px] font-medium transition",
                editing ? "border-carbon/50 bg-carbon/15 text-carbon" : "border-border bg-surface hover:bg-surface-2",
              )}
            >
              {editing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
              {editing ? "Done" : "Edit"}
            </button>
            <button
              type="button"
              onClick={onRemove}
              aria-label="Remove file"
              className="h-7 w-7 rounded-md border border-border bg-surface flex items-center justify-center hover:bg-surface-2 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-2 text-[11px] text-muted-foreground">
        {locked
          ? "Locked — submitted to the pipeline as shown below."
          : "Runs as-is on submit. Click Edit to correct anything the OCR pass misread."}
      </div>

      <div className="mt-3 rounded-lg border border-teal/30 bg-teal/[0.06] p-3">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.12em] text-teal">
          <ShieldCheck className="h-3.5 w-3.5" /> Classified result · 分类结果
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2 py-1 rounded border border-teal/40 bg-teal/10 text-[12px] font-mono text-foreground">
            CN {classification.cnCode}
          </span>
          <span className="text-[11.5px] text-muted-foreground">{classification.cnLabel}</span>
        </div>
        <div className="mt-2 text-[11px] font-mono text-muted-foreground">
          qwen-flash {classification.flashConfidence}%
          {classification.escalated && classification.plusConfidence != null && (
            <> · low confidence → escalated → qwen-plus {classification.plusConfidence}%</>
          )}
        </div>
        <div className="mt-2 pt-2 border-t border-border/60 text-[11.5px]">
          <span className="text-muted-foreground">Calculation method selected → </span>
          <span className="font-medium">{classification.route}</span>
          <span className="text-muted-foreground"> route · </span>
          <span className="font-mono text-[11px] text-muted-foreground">{classification.benchmark} · {classification.defaultIntensity}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <EditableField label="发票代码 · Invoice code" value={data.invoiceCode} editing={canEdit} onChange={(v) => setData((d) => d && ({ ...d, invoiceCode: v }))} mono />
        <EditableField label="发票号码 · Invoice No" value={data.invoiceNumber} editing={canEdit} onChange={(v) => setData((d) => d && ({ ...d, invoiceNumber: v }))} mono />
      </div>

      <div className="mt-3 grid md:grid-cols-2 gap-3">
        <PartyBlock title="购买方" zh="Buyer" party={data.buyer} editing={canEdit} onChange={(p) => setData((d) => d && ({ ...d, buyer: p }))} />
        <PartyBlock title="销售方" zh="Seller" party={data.seller} editing={canEdit} onChange={(p) => setData((d) => d && ({ ...d, seller: p }))} />
      </div>

      <div className="mt-3 rounded-lg border border-border bg-surface/40 p-3">
        <div className="text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground">货物明细 · Line items</div>
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
                  <td className="py-1.5 pr-2 text-right">{it.qty} {it.unit}</td>
                  <td className="py-1.5 pr-2 text-right">{it.unitPrice}</td>
                  <td className="py-1.5 pr-2 text-right">{it.amount}</td>
                  <td className="py-1.5 pr-2 text-right">{it.taxRate}</td>
                  <td className="py-1.5 text-right">{it.tax}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 pt-2 border-t border-border flex items-center justify-end gap-4 text-[11.5px] font-mono">
          <span className="text-muted-foreground">合计金额 <span className="text-foreground">¥{data.totalAmount}</span></span>
          <span className="text-muted-foreground">税额 <span className="text-foreground">¥{data.totalTax}</span></span>
          <span className="text-muted-foreground">价税合计 <span className="text-gold">¥{data.totalWithTax}</span></span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-[10.5px] font-mono text-muted-foreground">
        <span>收款人 {data.payee}</span>
        <span>复核 {data.reviewer}</span>
        <span>开票人 {data.issuer}</span>
      </div>
    </motion.div>
  );
}
