import { type ReactNode } from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function FormShell({
  title,
  titleZh,
  subtitle,
  completionPct,
  sections,
  activeId,
  onSelect,
  isZh,
  children,
  eyebrow,
  eyebrowZh,
}: {
  title: string;
  titleZh: string;
  subtitle: string;
  completionPct: number;
  sections: { id: string; label: string; labelZh: string }[];
  activeId: string;
  onSelect: (id: string) => void;
  isZh: boolean;
  children: ReactNode;
  /** Defaults to "Application form" / "申请表" */
  eyebrow?: string;
  eyebrowZh?: string;
}) {
  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
            {isZh ? (eyebrowZh ?? "申请表") : (eyebrow ?? "Application form")}
          </div>
          <h3 className="mt-1 text-[17px] font-semibold tracking-tight">{isZh ? titleZh : title}</h3>
          <p className="mt-1 text-[12px] text-muted-foreground">{subtitle}</p>
        </div>
        <div className="text-right min-w-[120px]">
          <div className="text-[22px] font-mono font-semibold text-carbon">{completionPct}%</div>
          <div className="text-[10px] font-mono text-muted-foreground">{isZh ? "已完成" : "complete"}</div>
          <div className="mt-2 h-1.5 w-28 rounded-full bg-muted overflow-hidden ml-auto">
            <div className="h-full bg-carbon transition-all duration-500" style={{ width: `${completionPct}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid lg:grid-cols-[200px_1fr] gap-5">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 lg:sticky lg:top-24 lg:self-start">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-left text-[12px] font-medium whitespace-nowrap lg:whitespace-normal transition shrink-0 lg:shrink",
                activeId === s.id
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-muted-foreground hover:bg-surface-2 border border-transparent",
              )}
            >
              <ChevronRight className={cn("h-3 w-3 shrink-0", activeId === s.id && "text-primary")} />
              {isZh ? s.labelZh : s.label}
            </button>
          ))}
        </nav>
        <div className="min-w-0 space-y-4">{children}</div>
      </div>
    </div>
  );
}

export function SectionBlock({
  id,
  title,
  titleZh,
  isZh,
  children,
}: {
  id: string;
  title: string;
  titleZh: string;
  isZh: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} className="rounded-xl border border-border bg-surface/30 p-4 scroll-mt-24">
      <h4 className="text-[14px] font-semibold tracking-tight">{isZh ? titleZh : title}</h4>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-3">{children}</div>;
}

export function TextField({
  label,
  labelZh,
  isZh,
  value,
  onChange,
  type = "text",
  mono,
  className,
}: {
  label: string;
  labelZh: string;
  isZh: boolean;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="text-[11px] font-mono text-muted-foreground">{isZh ? labelZh : label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "mt-1 w-full rounded-md border border-input bg-surface px-2.5 py-2 text-[13px] outline-none focus:border-ring focus:ring-2 focus:ring-ring/25",
          mono && "font-mono",
        )}
      />
    </label>
  );
}

export function TextArea({
  label,
  labelZh,
  isZh,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  labelZh: string;
  isZh: boolean;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block sm:col-span-2">
      <span className="text-[11px] font-mono text-muted-foreground">{isZh ? labelZh : label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-input bg-surface px-2.5 py-2 text-[13px] outline-none focus:border-ring focus:ring-2 focus:ring-ring/25 resize-y min-h-[72px]"
      />
    </label>
  );
}

export function NumberField({
  label,
  labelZh,
  isZh,
  value,
  onChange,
}: {
  label: string;
  labelZh: string;
  isZh: boolean;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-mono text-muted-foreground">{isZh ? labelZh : label}</span>
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className="mt-1 w-full rounded-md border border-input bg-surface px-2.5 py-2 text-[13px] font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
      />
    </label>
  );
}

export function CheckRow({
  label,
  labelZh,
  isZh,
  checked,
  onChange,
}: {
  label: string;
  labelZh?: string;
  isZh: boolean;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer py-1.5">
      <span
        className={cn(
          "mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 transition",
          checked ? "bg-carbon border-carbon text-background" : "border-border bg-surface",
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-[12.5px] leading-snug">{isZh && labelZh ? labelZh : label}</span>
    </label>
  );
}

export function TriToggle({
  label,
  labelZh,
  isZh,
  value,
  onChange,
}: {
  label: string;
  labelZh: string;
  isZh: boolean;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}) {
  const opts: { v: boolean | null; en: string; zh: string }[] = [
    { v: true, en: "Yes", zh: "是" },
    { v: false, en: "No", zh: "否" },
    { v: null, en: "N/A", zh: "待定" },
  ];
  return (
    <div>
      <div className="text-[11px] font-mono text-muted-foreground">{isZh ? labelZh : label}</div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {opts.map((o) => (
          <button
            key={String(o.v)}
            type="button"
            onClick={() => onChange(o.v)}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11.5px] font-mono border transition",
              value === o.v ? "bg-primary/15 border-primary/40 text-primary" : "border-border text-muted-foreground hover:bg-surface-2",
            )}
          >
            {isZh ? o.zh : o.en}
          </button>
        ))}
      </div>
    </div>
  );
}

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
