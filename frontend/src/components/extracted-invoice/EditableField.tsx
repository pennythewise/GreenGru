import { cn } from "@/lib/utils";

export function EditableField({
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
