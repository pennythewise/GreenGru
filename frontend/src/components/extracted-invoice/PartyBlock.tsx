import { EditableField } from "./EditableField";

export type InvoicePartyFields = {
  name: string;
  taxId: string;
  addressPhone: string;
  bankAccount: string;
};

export function PartyBlock({
  title,
  zh,
  party,
  editing,
  onChange,
}: {
  title: string;
  zh: string;
  party: InvoicePartyFields;
  editing: boolean;
  onChange: (next: InvoicePartyFields) => void;
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
