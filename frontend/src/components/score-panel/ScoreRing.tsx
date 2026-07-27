import { motion } from "motion/react";

const DEFAULT_THRESHOLD = 70;

/** Circular readiness ring — shared by Grant / Loan / CBAM Stage-3 panels. */
export function ScoreRing({
  value,
  max,
  qualified,
  threshold = DEFAULT_THRESHOLD,
}: {
  value: number;
  max: number;
  qualified: boolean;
  threshold?: number;
}) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative w-[140px] h-[140px] shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-border)" strokeWidth="10" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={qualified ? "var(--color-carbon)" : "var(--color-warning)"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-[28px] font-mono font-semibold text-foreground"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          {Math.round(pct)}%
        </motion.span>
        <span className="text-[10px] font-mono text-muted-foreground">thr {threshold}%</span>
      </div>
    </div>
  );
}
