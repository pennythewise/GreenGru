import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { GrantScoreResult } from "@/lib/api";
import { cn } from "@/lib/utils";

export type ScoreDimension = GrantScoreResult["dimensions"][number];

export function DimensionCard({
  dim,
  index,
  isZh,
  expanded,
  onToggle,
  colorByKey,
}: {
  dim: ScoreDimension;
  index: number;
  isZh: boolean;
  expanded: boolean;
  onToggle: () => void;
  colorByKey: Record<string, string>;
}) {
  const pct = dim.max_score > 0 ? (dim.score / dim.max_score) * 100 : 0;
  const gradient = colorByKey[dim.key] ?? "from-primary/50 to-teal/40";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-xl border border-border bg-surface/40 overflow-hidden"
    >
      <button type="button" onClick={onToggle} className="w-full text-left p-3.5 hover:bg-surface-2/50 transition">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[13px] font-semibold">{isZh ? dim.name_zh : dim.name_en}</div>
            <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
              {isZh ? `权重 ${dim.weight_pct}%` : `Weight ${dim.weight_pct}%`} · {dim.score.toFixed(1)} /{" "}
              {dim.max_score}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[18px] font-mono font-semibold text-primary">{Math.round(pct)}%</span>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition", expanded && "rotate-180")} />
          </div>
        </div>
        <div className="mt-2.5 h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full bg-gradient-to-r", gradient)}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, delay: index * 0.08, ease: "easeOut" }}
          />
        </div>
      </button>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="border-t border-border/70 px-3.5 pb-3.5 space-y-2"
        >
          {dim.indicators.map((ind, i) => (
            <motion.div
              key={ind.seq}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border border-border/60 bg-surface/30 p-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11.5px] font-medium leading-snug">
                    <span className="font-mono text-muted-foreground mr-1.5">#{ind.seq}</span>
                    {isZh ? ind.name_zh : ind.name_en}
                  </div>
                  <p className="mt-1 text-[10.5px] text-muted-foreground leading-relaxed">
                    {isZh ? ind.explanation_zh : ind.explanation_en}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5 text-[9.5px] font-mono text-muted-foreground">
                    {ind.formula_ref && (
                      <span className="px-1 py-0.5 rounded bg-primary/10 text-primary">式 {ind.formula_ref}</span>
                    )}
                    <span>{ind.data_source}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[14px] font-mono font-semibold text-carbon">
                    {ind.score}
                    <span className="text-[10px] text-muted-foreground">/{ind.weight_points}</span>
                  </div>
                  {ind.actual != null && (
                    <div className="text-[9px] font-mono text-muted-foreground mt-0.5">
                      {String(ind.actual)} {ind.unit !== "—" ? ind.unit : ""}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
