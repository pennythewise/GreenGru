import type { InvoiceData } from "@/lib/api";
import { useLocale } from "@/lib/locale";
import { invoiceCard } from "@/lib/ui-strings";

export function InvoiceLineItems({
  data,
  canEdit,
  onChange,
}: {
  data: InvoiceData;
  canEdit: boolean;
  onChange: (next: InvoiceData) => void;
}) {
  const { t } = useLocale();

  function patchItem(i: number, patch: Partial<InvoiceData["items"][number]>) {
    const items = [...data.items];
    items[i] = { ...items[i], ...patch };
    onChange({ ...data, items });
  }

  return (
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
                      onChange={(e) => patchItem(i, { qty: e.target.value })}
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
                      onChange={(e) => patchItem(i, { unitPrice: e.target.value })}
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
                      onChange={(e) => patchItem(i, { amount: e.target.value })}
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
              onChange={(e) => onChange({ ...data, totalAmount: e.target.value })}
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
              onChange={(e) => onChange({ ...data, totalTax: e.target.value })}
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
              onChange={(e) => onChange({ ...data, totalWithTax: e.target.value })}
              className="w-24 bg-surface border border-input rounded px-1 py-0.5 text-gold"
            />
          ) : (
            <span className="text-gold">¥{data.totalWithTax}</span>
          )}
        </span>
      </div>
    </div>
  );
}
