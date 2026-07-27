import { motion } from "motion/react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Euro,
  Globe2,
  Scale,
  ThumbsDown,
  ThumbsUp,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import type { CbamScoreResult } from "@/lib/api";
import { DimensionCard, ScoreRing, ThresholdPassBadge } from "@/components/score-panel";
import { withIndustryIllustration } from "@/lib/cbam-industry-mock";
import {
  ANNEX_I_CHINA_ROWS,
  CBAM_RESEARCH_SOURCES,
  costSharePct,
} from "@/lib/cbam-research-baseline";
import { useLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

export type { CbamScoreResult };

const DIM_COLORS: Record<string, string> = {
  scope: "from-teal/80 to-primary/60",
  monitoring: "from-primary/70 to-teal/50",
  direct: "from-gold/70 to-warning/50",
  precursors: "from-carbon/70 to-teal/40",
  reporting: "from-muted-foreground/40 to-border",
};

function ResearchBaselineBlock({
  isZh,
  fobEur,
  defaultEur,
  approvedEur,
  discountPct,
}: {
  isZh: boolean;
  fobEur: number;
  defaultEur: number;
  approvedEur: number;
  discountPct: number;
}) {
  const [showSources, setShowSources] = useState(false);
  const yourApprovedShare = costSharePct(approvedEur, fobEur);
  const yourDefaultShare = costSharePct(defaultEur, fobEur);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="rounded-xl border border-teal/25 bg-teal/[0.04] p-4 space-y-3"
    >
      <div className="flex items-start gap-2">
        <BookOpen className="h-4 w-4 text-teal shrink-0 mt-0.5" />
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-wider text-teal">
            {isZh ? "监管默认值 · IR 2025/2621 附件 I" : "Regulatory defaults · IR 2025/2621 Annex I"}
          </div>
          <h5 className="mt-0.5 text-[14px] font-semibold tracking-tight">
            {isZh
              ? "为何争取实测通过：Annex I 默认 SEE 更高"
              : "Why chase measured approval: Annex I default SEE is higher"}
          </h5>
          <p className="mt-1 text-[11.5px] text-muted-foreground leading-relaxed">
            {isZh
              ? "CBAM 默认隐含排放来自 IR (EU) 2025/2621 附件 I（国家×税则号），不是中国国内 GHG 因子库。下表为锁定范围内中国单元格（含 2026 年 10% 加价后 SEE）。护照 €/t 仅由核算引擎按附件 I + IR 2025/2620 基准 + 证书价计算。"
              : "CBAM default SEE comes from IR (EU) 2025/2621 Annex I (country × CN) — not a Chinese domestic GHG factor DB. Table: China cells in locked scope (incl. 2026 10% mark-up SEE). Passport €/t come only from the calculation engine (Annex I + IR 2025/2620 BM + certificate price)."}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-carbon/25 bg-carbon/5 px-3 py-2.5 text-[11.5px] leading-relaxed">
        {isZh ? (
          <>
            对本批货物（引擎）：默认路径约占 FOB{" "}
            <span className="font-mono font-semibold text-warning">{yourDefaultShare}%</span>
            ；实测通过后约占{" "}
            <span className="font-mono font-semibold text-carbon">{yourApprovedShare}%</span>
            （相对默认节省 {discountPct}% · 示意 FOB €{fobEur}/t）。
          </>
        ) : (
          <>
            This shipment (engine): default path ~{" "}
            <span className="font-mono font-semibold text-warning">{yourDefaultShare}%</span> of FOB;
            measured path ~{" "}
            <span className="font-mono font-semibold text-carbon">{yourApprovedShare}%</span> (−
            {discountPct}% vs default · illustrative FOB €{fobEur}/t).
          </>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/70">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-surface/60 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-2.5 py-2 font-medium">{isZh ? "品类" : "Category"}</th>
              <th className="px-2.5 py-2 font-medium">{isZh ? "产品 / CN" : "Product / CN"}</th>
              <th className="px-2.5 py-2 font-medium whitespace-nowrap">
                {isZh ? "附件 I SEE" : "Annex I SEE"}
              </th>
              <th className="px-2.5 py-2 font-medium whitespace-nowrap">
                {isZh ? "2026+10%" : "2026 +10%"}
              </th>
              <th className="px-2.5 py-2 font-medium">{isZh ? "说明" : "Notes"}</th>
            </tr>
          </thead>
          <tbody>
            {ANNEX_I_CHINA_ROWS.map((row) => (
              <tr key={row.id} className="border-t border-border/60">
                <td className="px-2.5 py-2 align-top text-muted-foreground">
                  {isZh ? row.categoryZh : row.categoryEn}
                </td>
                <td className="px-2.5 py-2 align-top">
                  <div className="font-medium">{isZh ? row.productZh : row.productEn}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{row.cnCode}</div>
                </td>
                <td className="px-2.5 py-2 align-top font-mono whitespace-nowrap">
                  {row.annexSeeTco2ePerT.toFixed(3)}
                </td>
                <td className="px-2.5 py-2 align-top font-mono whitespace-nowrap text-warning">
                  {row.see2026MarkedUp.toFixed(3)}
                </td>
                <td className="px-2.5 py-2 align-top text-muted-foreground leading-snug max-w-[220px]">
                  {isZh ? row.noteZh : row.noteEn}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid sm:grid-cols-3 gap-2 text-[10.5px]">
        <div className="rounded-lg border border-border/70 bg-surface/40 p-2.5">
          <div className="font-mono text-[9.5px] uppercase text-muted-foreground">
            {isZh ? "证书价 · Q1 2026" : "Cert price · Q1 2026"}
          </div>
          <div className="mt-0.5 font-mono font-semibold">75.36 €/tCO₂e</div>
          <div className="mt-1 text-muted-foreground leading-snug">
            {isZh ? "挂钩欧盟 ETS 拍卖均价。" : "Linked to EU ETS auction average."}
          </div>
        </div>
        <div className="rounded-lg border border-border/70 bg-surface/40 p-2.5">
          <div className="font-mono text-[9.5px] uppercase text-muted-foreground">
            {isZh ? "免费配额基准" : "Free-allocation BM"}
          </div>
          <div className="mt-0.5 font-mono font-semibold">1.370 · 路线 C</div>
          <div className="mt-1 text-muted-foreground leading-snug">
            {isZh ? "IR 2025/2620 BF/BOF 基准。" : "IR 2025/2620 BF/BOF benchmark."}
          </div>
        </div>
        <div className="rounded-lg border border-border/70 bg-surface/40 p-2.5">
          <div className="font-mono text-[9.5px] uppercase text-muted-foreground">
            {isZh ? "默认值加价" : "Default mark-up"}
          </div>
          <div className="mt-0.5 font-mono font-semibold">+10% → +30%</div>
          <div className="mt-1 text-muted-foreground leading-snug">
            {isZh
              ? "2026 年 10%，至 2028 年 30%（附件 I 年列）。"
              : "10% in 2026 → 30% by 2028 (Annex I year columns)."}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowSources((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-border/70 bg-surface/30 px-3 py-2 text-left text-[11px] hover:bg-surface/50 transition"
      >
        <span className="font-medium">
          {isZh ? "来源与脚注" : "Sources & footnotes"} ({CBAM_RESEARCH_SOURCES.length})
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition", showSources && "rotate-180")} />
      </button>
      {showSources && (
        <ol className="space-y-2 pl-0 list-none">
          {CBAM_RESEARCH_SOURCES.map((s, i) => (
            <li key={s.id} className="rounded-lg border border-border/50 bg-surface/20 px-2.5 py-2 text-[10.5px]">
              <div className="font-medium">
                <span className="font-mono text-muted-foreground mr-1.5">[{i + 1}]</span>
                {isZh ? s.labelZh : s.labelEn}
                {s.url && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-1.5 text-teal underline-offset-2 hover:underline font-normal"
                  >
                    link
                  </a>
                )}
              </div>
              <p className="mt-0.5 text-muted-foreground leading-relaxed">
                {isZh ? s.citeZh : s.citeEn}
              </p>
            </li>
          ))}
        </ol>
      )}
    </motion.div>
  );
}

export function CbamOperatorScorePanel({ result: raw }: { result: CbamScoreResult }) {
  const { isZh } = useLocale();
  const [expandedDim, setExpandedDim] = useState<string | null>("scope");
  // Always normalize — mock industry €/t if API omitted the field (no extra user input needed).
  const result = withIndustryIllustration(raw);

  const steps = isZh
    ? [
        { n: 1, title: "确认在列货物", desc: "对照附件一 CN 码与钢铁生产路线（§5.2 / §5.6）" },
        { n: 2, title: "建立监测方法", desc: "快速指南 §3：边界 → 报告期 → 监测参数" },
        { n: 3, title: "核算直接排放", desc: "装置直接排放归属至货物 SEE（§6.5 / 附件四）" },
        { n: 4, title: "打包给申报人", desc: "使用欧委会沟通模板回复欧盟进口商（§6.11）" },
      ]
    : [
        { n: 1, title: "Confirm CBAM goods", desc: "Map CN codes + steel production route (§5.2 / §5.6)" },
        { n: 2, title: "Build MMD", desc: "Quick Guide §3: boundaries → period → parameters" },
        { n: 3, title: "Direct emissions", desc: "Attribute installation direct emissions to SEE (§6.5 / Annex IV)" },
        { n: 4, title: "Pack for declarant", desc: "Reply to EU importers via Commission template (§6.11)" },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-teal/30 bg-gradient-to-br from-teal/[0.07] via-surface/40 to-primary/[0.05] p-5 space-y-5"
    >
      <div className="flex flex-wrap items-start gap-5">
        <ScoreRing value={result.total_score} max={result.max_score} qualified={result.total_score >= 70} />
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-teal">
            <Globe2 className="h-3.5 w-3.5" />
            {isZh ? "欧盟许可 · 阶段 3 · 评分" : "EU license · Stage 3 · Score"}
          </div>
          <h4 className="mt-1 text-[17px] font-semibold tracking-tight">
            {isZh ? "装置运营方 CBAM 就绪评价" : "Installation operator CBAM readiness"}
          </h4>
          <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
            {isZh ? result.summary_zh : result.summary_en}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-teal/30 bg-teal/10 text-[10.5px] font-mono text-teal">
            <BookOpen className="h-3 w-3" />
            {result.standard} · {result.standard_zh}
          </div>
          <div className="mt-1.5 text-[10px] font-mono text-muted-foreground flex items-start gap-1">
            <Scale className="h-3 w-3 text-teal shrink-0 mt-0.5" />
            <span>
              {isZh ? "评价依据：" : "Guideline: "}
              {result.guideline_doc}
            </span>
          </div>
          <ThresholdPassBadge score={result.total_score} isZh={isZh} />
        </div>
      </div>

      {/* Headline: approval % hero + industry default vs discounted € (mock-ready) */}
      {result.industry_illustration && result.export_margin ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-carbon/35 bg-gradient-to-br from-carbon/[0.12] via-surface/40 to-teal/[0.06] p-5"
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-wider text-carbon">
                  {isZh ? "获得 CBAM 实际值通过的可能性" : "Likelihood of CBAM actual-values approval"}
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <motion.span
                    className="text-[56px] sm:text-[64px] font-mono font-semibold text-carbon leading-none tracking-tight"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35, type: "spring", stiffness: 160 }}
                  >
                    {Math.round(result.approval_likelihood_pct ?? 0)}
                  </motion.span>
                  <span className="text-[22px] font-mono text-carbon/70">%</span>
                </div>
                <p className="mt-2 text-[12.5px] text-foreground/90 max-w-md leading-snug">
                  {isZh ? result.outcome_label_zh : result.outcome_label}
                </p>
              </div>
              <div className="w-full sm:w-auto sm:min-w-[200px]">
                <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                  <span className="text-carbon flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {isZh ? "通过" : "Approve"} {Math.round(result.approval_likelihood_pct ?? 0)}%
                  </span>
                  <span className="text-warning flex items-center gap-1">
                    <ThumbsDown className="h-3 w-3" />
                    {isZh ? "否决" : "Deny"} {Math.round(result.deny_likelihood_pct ?? 0)}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden flex">
                  <motion.div
                    className="h-full bg-carbon"
                    initial={{ width: 0 }}
                    animate={{ width: `${result.approval_likelihood_pct ?? 0}%` }}
                    transition={{ duration: 0.9, delay: 0.3 }}
                  />
                  <div
                    className="h-full bg-warning/75"
                    style={{ width: `${result.deny_likelihood_pct ?? 0}%` }}
                  />
                </div>
                <p className="mt-2 text-[10.5px] text-muted-foreground leading-snug">
                  {isZh
                    ? "通过率越高，越能锁定实测路径而非 Annex I 默认路径。"
                    : "Higher approval odds lock in the measured €/t below — not the Annex I default."}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-primary/30 bg-primary/[0.05] p-4 space-y-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {isZh ? "行业基线成本 · 欧元 / 吨" : "Industry baseline cost · € / t"}
                </div>
                <div className="mt-0.5 text-[13px] font-semibold">
                  {isZh
                    ? result.industry_illustration.baseline_label_zh
                    : result.industry_illustration.baseline_label_en}
                  <span className="ml-2 font-mono text-[11px] font-normal text-muted-foreground">
                    CN {result.industry_illustration.cn_code}
                  </span>
                </div>
              </div>
              <Euro className="h-4 w-4 text-primary shrink-0" />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-warning/45 bg-warning/[0.07] p-3.5">
                <div className="text-[10px] font-mono text-warning uppercase tracking-wider">
                  {isZh ? "未配置 / 无透明碳足迹" : "Not configured · opaque lifecycle"}
                </div>
                <div className="mt-1.5 text-[28px] font-mono font-semibold text-warning leading-none">
                  €
                  {result.industry_illustration.default_path_eur_per_tonne.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="mt-2 text-[10.5px] font-mono text-muted-foreground leading-snug space-y-0.5">
                  <div>
                    {isZh ? "Annex I 默认 SEE" : "Annex I default SEE"}{" "}
                    {result.industry_illustration.default_see_tco2e_per_t} tCO₂e/t
                  </div>
                  <div>
                    {isZh ? "约占 FOB" : "~FOB share"}{" "}
                    {result.industry_illustration.cost_pct_of_fob_default}%
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-carbon/40 bg-carbon/[0.08] p-3.5 relative overflow-hidden">
                {result.industry_illustration.discount_pct > 0 && (
                  <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded bg-carbon/20 text-carbon text-[10px] font-mono font-semibold">
                    −{result.industry_illustration.discount_pct}%
                  </div>
                )}
                <div className="text-[10px] font-mono text-carbon uppercase tracking-wider">
                  {isZh ? "若通过 · 实测路径" : "If approved · measured path"}
                </div>
                <div className="mt-1.5 text-[28px] font-mono font-semibold text-carbon leading-none">
                  €
                  {result.industry_illustration.approved_path_eur_per_tonne.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="mt-2 text-[10.5px] font-mono text-muted-foreground leading-snug space-y-0.5">
                  <div>
                    {isZh ? "实测 SEE" : "Measured SEE"}{" "}
                    {result.industry_illustration.approved_see_tco2e_per_t} tCO₂e/t
                  </div>
                  <div>
                    {isZh ? "约占 FOB" : "~FOB share"}{" "}
                    {result.industry_illustration.cost_pct_of_fob_approved}%
                  </div>
                  <div className="text-carbon">
                    {isZh ? "相对默认少付" : "Saved vs default"} €
                    {result.industry_illustration.discount_eur_per_tonne.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                    /t
                  </div>
                </div>
              </div>
            </div>

            {!result.industry_illustration.has_lifecycle_transparency && (
              <div className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-[11px] text-warning leading-snug">
                {isZh
                  ? "尚未提供产品碳足迹透明数据 — 暂按 IR 2025/2621 Annex I 默认路径计价。补齐排放监测与装置级数据后，即可走实测路径。"
                  : "No transparent product carbon lifecycle yet — priced on the IR 2025/2621 Annex I default path. Add emissions monitoring + installation data to unlock the measured path."}
              </div>
            )}

            <p className="text-[10.5px] text-muted-foreground leading-relaxed">
              {isZh ? result.industry_illustration.note_zh : result.industry_illustration.note_en}
            </p>
            <div className="text-[10px] font-mono text-muted-foreground border-t border-border/60 pt-2">
              {isZh ? "护照管制估算（φ=2.5% · 引擎）" : "Passport regulated estimate (φ=2.5% · engine)"}
              {" · "}
              {isZh ? "通过" : "approved"} €
              {result.industry_illustration.regulated_approved_eur_per_tonne}/t ·{" "}
              {isZh ? "默认" : "default"} €
              {result.industry_illustration.regulated_denied_eur_per_tonne}/t · cert{" "}
              {result.tariff?.certificate_price_eur_per_tco2e ?? 75.36} €/tCO₂e ·{" "}
              {result.tariff?.certificate_price_quarter ?? "Q1-2026"}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-border bg-surface/40 p-4"
          >
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {isZh
                ? "中国出口利润空间（按行业基线 · 欧元/吨）"
                : "China export profit margin (industry baseline · €/t)"}
            </div>
            <div className="mt-3 grid sm:grid-cols-3 gap-2">
              <div className="rounded-lg border border-border bg-surface/60 p-3">
                <div className="text-[10px] font-mono text-muted-foreground">
                  {isZh ? "CBAM 前" : "Before CBAM"}
                </div>
                <div className="mt-1 text-[20px] font-mono font-semibold">
                  €
                  {result.export_margin.margin_eur_per_tonne_before.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                  {result.export_margin.margin_pct_before_cbam}% · FOB €
                  {result.export_margin.fob_eur_per_tonne}/t
                </div>
              </div>
              <div className="rounded-lg border border-carbon/30 bg-carbon/5 p-3">
                <div className="text-[10px] font-mono text-carbon">
                  {isZh ? "通过后利润（实测路径）" : "After approval (measured path)"}
                </div>
                <div className="mt-1 text-[20px] font-mono font-semibold text-carbon">
                  €
                  {result.export_margin.margin_eur_after_approved.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                  {result.export_margin.margin_pct_after_approved}% · −€
                  {result.export_margin.tariff_if_approved_eur_per_tonne}/t (
                  {result.export_margin.cost_pct_of_fob_if_approved}% FOB)
                </div>
              </div>
              <div className="rounded-lg border border-warning/40 bg-warning/5 p-3">
                <div className="text-[10px] font-mono text-warning">
                  {isZh ? "默认路径后利润" : "After default path"}
                </div>
                <div className="mt-1 text-[20px] font-mono font-semibold text-warning">
                  €
                  {result.export_margin.margin_eur_after_denied.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                  {result.export_margin.margin_pct_after_denied}% · −€
                  {result.export_margin.tariff_if_denied_eur_per_tonne}/t (
                  {result.export_margin.cost_pct_of_fob_if_denied}% FOB)
                </div>
              </div>
            </div>
            <p className="mt-2.5 text-[10.5px] text-muted-foreground leading-relaxed">
              {isZh ? result.export_margin.note_zh : result.export_margin.note_en}
            </p>
          </motion.div>

          <ResearchBaselineBlock
            isZh={isZh}
            fobEur={result.export_margin.fob_eur_per_tonne}
            defaultEur={result.industry_illustration.default_path_eur_per_tonne}
            approvedEur={result.industry_illustration.approved_path_eur_per_tonne}
            discountPct={result.industry_illustration.discount_pct}
          />
        </>
      ) : (
        <div className="rounded-lg border border-warning/40 bg-warning/5 p-3 text-[12px] text-warning">
          {isZh
            ? "关税结果未返回 — 请重新运行阶段 3。"
            : "Tariff payload missing — re-run Stage 3."}
        </div>
      )}

      <div>
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          {isZh ? "运营方快速指南流程" : "How the operator Quick Guide evaluates you"}
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
              <div className="text-[10px] font-mono text-teal">Step {s.n}</div>
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
          {isZh ? "基本准入（快速指南 §3）" : "Basic gates (Quick Guide §3)"}
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
          {isZh ? "五维就绪度（指南 §3–§6 · 钢铁 §5.6）" : "Five readiness dimensions (§3–§6 · steel §5.6)"}
        </div>
        <div className="space-y-2">
          {result.dimensions.map((dim, i) => (
            <DimensionCard
              key={dim.key}
              dim={dim}
              index={i}
              isZh={isZh}
              colorByKey={DIM_COLORS}
              expanded={expandedDim === dim.key}
              onToggle={() => setExpandedDim((k) => (k === dim.key ? null : dim.key))}
            />
          ))}
        </div>
      </div>

      {result.formulas.length > 0 && (
        <div className="rounded-lg border border-border/70 bg-surface/20 p-3 space-y-2">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            {isZh ? "关键公式（指南 / 附件四）" : "Key formulas (Guidance / Annex IV)"}
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
