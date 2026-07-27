import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_THRESHOLD = 70;

export function thresholdPassLabel(score: number, isZh: boolean, threshold = DEFAULT_THRESHOLD): string {
  const pct = Math.round(score);
  if (score >= threshold) {
    return isZh ? `${pct}% · 通过（阈值 ${threshold}%）` : `${pct}% · Pass (thr ${threshold}%)`;
  }
  return isZh ? `${pct}% · 未达阈值 ${threshold}%` : `${pct}% · Below thr ${threshold}%`;
}

/** Pass / below badge for Stage-3 score headers (no letter grades). */
export function ThresholdPassBadge({
  score,
  isZh,
  threshold = DEFAULT_THRESHOLD,
}: {
  score: number;
  isZh: boolean;
  threshold?: number;
}) {
  const passes = score >= threshold;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className={cn(
        "mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium",
        passes
          ? "bg-carbon/15 text-carbon border border-carbon/30"
          : "bg-warning/15 text-warning border border-warning/30",
      )}
    >
      <Sparkles className="h-3.5 w-3.5" />
      {thresholdPassLabel(score, isZh, threshold)}
    </motion.div>
  );
}
