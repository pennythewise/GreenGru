"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale";

/** Collapsible wrapper for Stage 1 / Stage 3 detail panels (show · hide · unhide). */
export function StageDetailShell({
  stageN,
  titleEn,
  titleZh,
  accentClass = "border-primary/30",
  defaultOpen = true,
  open,
  onOpenChange,
  children,
}: {
  stageN: number;
  titleEn: string;
  titleZh: string;
  accentClass?: string;
  defaultOpen?: boolean;
  /** Controlled mode — when set, parent owns visibility */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}) {
  const { isZh } = useLocale();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = open ?? internalOpen;
  const setOpen = (v: boolean) => {
    onOpenChange?.(v);
    if (open === undefined) setInternalOpen(v);
  };

  return (
    <div className={cn("mt-4 rounded-xl border overflow-hidden", accentClass)}>
      <button
        type="button"
        onClick={() => setOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-surface/60 hover:bg-surface/90 transition text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {isZh ? `阶段 ${stageN}` : `Stage ${stageN}`}
          </span>
          <span className="text-[13px] font-semibold truncate">{isZh ? titleZh : titleEn}</span>
        </div>
        <span className="inline-flex items-center gap-1.5 shrink-0 text-[10.5px] font-mono text-muted-foreground">
          {isOpen ? (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              {isZh ? "收起" : "Hide"}
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              {isZh ? "展开" : "Show"}
            </>
          )}
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/60 p-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
