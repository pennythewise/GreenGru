import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ChevronDown, FileText, Loader2, X } from "lucide-react";

import { useLocale } from "@/lib/locale";
import { invoiceCard } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

export function CardShell({
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
