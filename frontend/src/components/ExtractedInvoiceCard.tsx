// Shown in the Documents section once a file is attached, replacing the plain
// "file attached" chip with what Stage 1 (Intake, OCR + StructBERT) and Stage 3
// (Classify, CN-code classifier) would actually hand back: extracted fields
// grouped by invoice party, plus the classified CN code and the calculation
// method it selects. Read-only until the operator clicks Edit (top right) —
// if they never touch it, the extracted values are what gets submitted as-is.
import { useState } from "react";
import { motion } from "motion/react";
import { Check, FileText, Pencil, ShieldCheck, X } from "lucide-react";

import { cn } from "@/lib/utils";

type Party = { name: string; taxId: string; addressPhone: string; bankAccount: string };
type LineItem = { name: string; spec: string; unit: string; qty: string; unitPrice: string; amount: string; taxRate: string; tax: string };

type InvoiceData = {
  invoiceCode: string;
  invoiceNumber: string;
  issueDate: string;
  buyer: Party;
  seller: Party;
  items: LineItem[];
  totalAmount: string;
  totalTax: string;
  totalWithTax: string;
  payee: string;
  reviewer: string;
  issuer: string;
};

// Best-effort OCR read of the example 增值税专用发票 the operator uploaded —
// same imperfection a real Intake-stage OCR pass would have; that's exactly
// what the Edit button is for.
const EXTRACTED: InvoiceData = {
  invoiceCode: "3400174130",
  invoiceNumber: "05073978",
  issueDate: "2017-12-01",
  buyer: {
    name: "六安江淮电机有限公司",
    taxId: "9134150072554518XQ",
    addressPhone: "安徽省六安市寿春路 · 0564-3368617",
    bankAccount: "建行六安城北支行 · 3400174620805300512",
  },
  seller: {
    name: "合肥市日普贸易有限公司",
    taxId: "91340100748916334H",
    addressPhone: "合肥市金奥路162号安徽国际商务中心B座26楼 · 0551-63671971",
    bankAccount: "徽商银行合肥太湖路支行 · 2051012000004989",
  },
  items: [
    { name: "碳结圆", spec: "Φ90", unit: "吨", qty: "4.736", unitPrice: "3957.26", amount: "18741.61", taxRate: "17%", tax: "3186.07" },
    { name: "碳结圆", spec: "Φ80", unit: "吨", qty: "6.674", unitPrice: "3957.26", amount: "26410.79", taxRate: "17%", tax: "4489.83" },
    { name: "碳结圆", spec: "Φ65", unit: "吨", qty: "12.49", unitPrice: "3957.26", amount: "49426.24", taxRate: "17%", tax: "8402.46" },
  ],
  totalAmount: "94578.64",
  totalTax: "16078.36",
  totalWithTax: "110657.00",
  payee: "陈义康",
  reviewer: "王建",
  issuer: "陈文康",
};

// Classify-stage output (Stage 3) — CN code from the locked 8-code list, plus
// which calculation method (route benchmark + default intensity) it selects
// for the deterministic Calculate stage. Numbers match calculation_engine.py.
const CLASSIFICATION = {
  cnCode: "7213 / 7214",
  cnLabel: "热轧圆钢 / 盘条 · bars & rods, hot-rolled, non-alloy steel",
  flashConfidence: 63,
  escalated: true,
  plusConfidence: 91,
  route: "BF-BOF",
  benchmark: "EU benchmark 1.370 tCO2e/t (IR 2025/2621)",
  defaultIntensity: "China default 3.506 tCO2e/t (China GHG Factor DB v2)",
};

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

export function ExtractedInvoiceCard({ fileName, fileSizeLabel, onRemove, locked = false }: {
  fileName: string; fileSizeLabel: string; onRemove: () => void; locked?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<InvoiceData>(EXTRACTED);
  const canEdit = editing && !locked;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-xl border border-carbon/40 bg-carbon/[0.04] p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-carbon/15 text-carbon flex items-center justify-center shrink-0 mt-0.5">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[13.5px] font-medium">Extracted info with classified result</div>
            <div className="text-[11px] font-mono text-muted-foreground">提取信息与分类结果 · {fileName} · {fileSizeLabel}</div>
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

      {/* Classification banner — Stage 3 output */}
      <div className="mt-3 rounded-lg border border-teal/30 bg-teal/[0.06] p-3">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.12em] text-teal">
          <ShieldCheck className="h-3.5 w-3.5" /> Classified result · 分类结果
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2 py-1 rounded border border-teal/40 bg-teal/10 text-[12px] font-mono text-foreground">
            CN {CLASSIFICATION.cnCode}
          </span>
          <span className="text-[11.5px] text-muted-foreground">{CLASSIFICATION.cnLabel}</span>
        </div>
        <div className="mt-2 text-[11px] font-mono text-muted-foreground">
          qwen-flash {CLASSIFICATION.flashConfidence}%
          {CLASSIFICATION.escalated && <> · low confidence → escalated → qwen-plus {CLASSIFICATION.plusConfidence}%</>}
        </div>
        <div className="mt-2 pt-2 border-t border-border/60 text-[11.5px]">
          <span className="text-muted-foreground">Calculation method selected → </span>
          <span className="font-medium">{CLASSIFICATION.route}</span>
          <span className="text-muted-foreground"> route · </span>
          <span className="font-mono text-[11px] text-muted-foreground">{CLASSIFICATION.benchmark} · {CLASSIFICATION.defaultIntensity}</span>
        </div>
      </div>

      {/* Invoice header fields */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <EditableField label="发票代码 · Invoice code" value={data.invoiceCode} editing={canEdit} onChange={(v) => setData((d) => ({ ...d, invoiceCode: v }))} mono />
        <EditableField label="发票号码 · Invoice No" value={data.invoiceNumber} editing={canEdit} onChange={(v) => setData((d) => ({ ...d, invoiceNumber: v }))} mono />
      </div>

      {/* Buyer / Seller blocks */}
      <div className="mt-3 grid md:grid-cols-2 gap-3">
        <PartyBlock title="购买方" zh="Buyer" party={data.buyer} editing={canEdit} onChange={(p) => setData((d) => ({ ...d, buyer: p }))} />
        <PartyBlock title="销售方" zh="Seller" party={data.seller} editing={canEdit} onChange={(p) => setData((d) => ({ ...d, seller: p }))} />
      </div>

      {/* Line items */}
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
                  <td className="py-1.5 pr-2">
                    {canEdit ? (
                      <input value={it.name} onChange={(e) => setData((d) => ({ ...d, items: d.items.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x) }))} className="w-16 bg-surface border border-input rounded px-1 py-0.5 text-[11px] font-sans" />
                    ) : it.name}
                  </td>
                  <td className="py-1.5 pr-2">
                    {canEdit ? (
                      <input value={it.spec} onChange={(e) => setData((d) => ({ ...d, items: d.items.map((x, idx) => idx === i ? { ...x, spec: e.target.value } : x) }))} className="w-12 bg-surface border border-input rounded px-1 py-0.5 text-[11px]" />
                    ) : it.spec}
                  </td>
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

      {/* Footer meta */}
      <div className="mt-3 flex items-center gap-4 text-[10.5px] font-mono text-muted-foreground">
        <span>收款人 {data.payee}</span>
        <span>复核 {data.reviewer}</span>
        <span>开票人 {data.issuer}</span>
      </div>
    </motion.div>
  );
}
