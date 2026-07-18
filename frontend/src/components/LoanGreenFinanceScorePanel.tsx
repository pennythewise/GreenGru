import { motion } from "motion/react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Landmark,
  Leaf,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";
import type { GrantScoreResult } from "@/lib/api";

/** Same Stage-3 response shape as grant / CBAM panels. */
export type LoanScoreResult = GrantScoreResult;

const DIM_COLORS: Record<string, string> = {
  catalogue: "from-gold/70 to-warning/50",
  energy: "from-teal/80 to-primary/60",
  resource: "from-carbon/70 to-teal/50",
  clean: "from-primary/60 to-teal/40",
  reporting: "from-muted-foreground/40 to-border",
};

function ScoreRing({ value, max, qualified }: { value: number; max: number; qualified: boolean }) {
  const pct = Math.min(100, (value / max) * 100);
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
          {value}
        </motion.span>
        <span className="text-[10px] font-mono text-muted-foreground">/ {max}</span>
      </div>
    </div>
  );
}

function DimensionCard({
  dim,
  index,
  isZh,
  expanded,
  onToggle,
}: {
  dim: LoanScoreResult["dimensions"][number];
  index: number;
  isZh: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const pct = dim.max_score > 0 ? (dim.score / dim.max_score) * 100 : 0;
  const gradient = DIM_COLORS[dim.key] ?? "from-primary/50 to-teal/40";

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
                      <span className="px-1 py-0.5 rounded bg-primary/10 text-primary">{ind.formula_ref}</span>
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

export function LoanGreenFinanceScorePanel({ result }: { result: LoanScoreResult }) {
  const { isZh } = useLocale();
  const [expandedDim, setExpandedDim] = useState<string | null>("catalogue");

  const steps = isZh
    ? [
        { n: 1, title: "合规准入", desc: "通则 §4.2 + 贷款合规声明一票否决" },
        { n: 2, title: "目录对号", desc: "《绿色金融支持项目目录（2025）》用途映射（钢铁 §1.4）" },
        { n: 3, title: "工厂对标", desc: "通则 §5.2：强度/绿电/废钢线性赋分" },
        { n: 4, title: "资金与报告", desc: "专项账户/台账 + 环境效益披露" },
      ]
    : [
        { n: 1, title: "Compliance gates", desc: "GB/T 36132 §4.2 + loan compliance veto" },
        { n: 2, title: "Catalogue fit", desc: "Map use-of-funds to 2025 Green Finance Catalogue (§1.4 steel)" },
        { n: 3, title: "Factory benchmarks", desc: "§5.2 linear score on intensity / green power / scrap" },
        { n: 4, title: "Proceeds & reporting", desc: "Dedicated account / ledger + quantified impact" },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gold/30 bg-gradient-to-br from-gold/[0.07] via-surface/40 to-teal/[0.05] p-5 space-y-5"
    >
      <div className="flex flex-wrap items-start gap-5">
        <ScoreRing value={result.total_score} max={result.max_score} qualified={result.qualified} />
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-gold">
            <Landmark className="h-3.5 w-3.5" />
            {isZh ? "贷款 · 阶段 3 · 评分" : "Loan · Stage 3 · Score"}
          </div>
          <h4 className="mt-1 text-[17px] font-semibold tracking-tight">
            {isZh ? "绿色贷款就绪评价" : "Green loan readiness evaluation"}
          </h4>
          <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
            {isZh ? result.summary_zh : result.summary_en}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-gold/35 bg-gold/10 text-[10.5px] font-mono text-gold">
            <BookOpen className="h-3 w-3" />
            {result.standard}
          </div>
          <div className="mt-1.5 text-[10px] font-mono text-muted-foreground flex items-start gap-1">
            <Leaf className="h-3 w-3 text-carbon shrink-0 mt-0.5" />
            <span>
              {isZh ? "评价依据：" : "Guidelines: "}
              {result.guideline_doc}
            </span>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={cn(
              "mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium",
              result.qualified
                ? "bg-carbon/15 text-carbon border border-carbon/30"
                : "bg-warning/15 text-warning border border-warning/30",
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {isZh ? result.tier_label_zh : result.tier_label}
          </motion.div>
        </div>
      </div>

      <div>
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          {isZh ? "双源评价流程" : "How dual-source scoring works"}
        </div>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {steps.map((s, i) => (
            <motion.li
              key={s.n}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="rounded-lg border border-border bg-surface/50 p-2.5"
            >
              <div className="text-[10px] font-mono text-gold">Step {s.n}</div>
              <div className="text-[12px] font-medium mt-0.5">{s.title}</div>
              <div className="text-[10.5px] text-muted-foreground mt-1 leading-snug">{s.desc}</div>
            </motion.li>
          ))}
        </ol>
      </div>

      <div className="rounded-lg border border-border bg-surface/30 p-3">
        <div className="flex items-center gap-2 text-[12px] font-medium">
          {result.veto_passed ? (
            <CheckCircle2 className="h-4 w-4 text-carbon" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-warning" />
          )}
          {isZh ? "基本准入（通则 §4.2 + 合规声明）" : "Basic gates (§4.2 + compliance)"}
          <span
            className={cn(
              "text-[10px] font-mono ml-auto",
              result.veto_passed ? "text-carbon" : "text-warning",
            )}
          >
            {result.veto_items.filter((v) => v.passed).length}/{result.veto_items.length}
          </span>
        </div>
        <div className="mt-2 grid sm:grid-cols-2 gap-1">
          {result.veto_items.map((v) => (
            <div key={v.key} className="flex items-start gap-1.5 text-[10.5px]">
              {v.passed ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-carbon shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
              )}
              <span className={v.passed ? "text-foreground" : "text-muted-foreground"}>
                {isZh ? v.label_zh : v.label_en}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          {isZh
            ? "五维评分（目录 2025 · 通则五类一级指标）"
            : "Five dimensions (Catalogue 2025 · GB/T 36132 primaries)"}
        </div>
        <div className="space-y-2">
          {result.dimensions.map((dim, i) => (
            <DimensionCard
              key={dim.key}
              dim={dim}
              index={i}
              isZh={isZh}
              expanded={expandedDim === dim.key}
              onToggle={() => setExpandedDim((k) => (k === dim.key ? null : dim.key))}
            />
          ))}
        </div>
      </div>

      {result.formulas.length > 0 && (
        <div className="rounded-lg border border-border/70 bg-surface/20 p-3 space-y-2">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            {isZh ? "关键公式（通则 §5.2 · 目录 §1.4）" : "Key formulas (§5.2 · Catalogue §1.4)"}
          </div>
          {result.formulas.map((f, i) => (
            <motion.div
              key={f.eq}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="text-[10.5px] font-mono"
            >
              <span className="text-teal">{f.eq}</span> · {f.label}
              <div className="text-primary/90 mt-0.5">{f.latex}</div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
