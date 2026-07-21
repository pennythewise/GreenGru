/**
 * Client-side mock / normalize for Stage-3 industry CBAM €/t.
 * Used when the API omits industry_illustration (stale response) so the panel
 * never blocks on "Tariff payload missing".
 */

import type { CbamIndustryIllustration, CbamScoreResult } from "@/lib/api";
import { costSharePct } from "@/lib/cbam-research-baseline";

const FOB = 850;
const BM = 1.364;
const FREE_ALLOC = 0.975;
const PRICE = 80;

function walkthroughEur(see: number): number {
  return Math.round(Math.max(0, see - BM * FREE_ALLOC) * PRICE * 100) / 100;
}

function cnFamily(cn: string | undefined | null): "fastener" | "slab" {
  const digits = (cn ?? "").replace(/\D/g, "");
  const head = digits.slice(0, 4);
  if (head === "7318" || head === "7326") return "fastener";
  return "slab";
}

/** Build literature-baseline illustration from whatever Stage-3 fields we have. */
export function buildMockIndustryIllustration(
  result: Partial<CbamScoreResult> & { total_score?: number },
  opts?: { cnCode?: string | null; hasTransparency?: boolean },
): CbamIndustryIllustration {
  const cn = opts?.cnCode ?? "7318 15 88";
  const family = cnFamily(cn);
  const isFastener = family === "fastener";
  const defaultSee = isFastener ? 7.911 : 3.486;
  const defaultEur = isFastener ? 526.47 : 172.46;
  const hasTransparency =
    opts?.hasTransparency ??
    (result.tariff?.data_source === "measured" || (result.approval_likelihood_pct ?? 0) >= 55);

  const approvedSee = hasTransparency ? 1.6 : defaultSee;
  const approvedEur = hasTransparency
    ? Math.min(walkthroughEur(approvedSee), defaultEur * 0.98)
    : defaultEur;
  const discount = Math.round(Math.max(0, defaultEur - approvedEur) * 100) / 100;
  const discountPct = defaultEur > 0 ? Math.round((discount / defaultEur) * 1000) / 10 : 0;

  return {
    baseline_key: isFastener ? "fastener" : "slab",
    baseline_label_en: isFastener
      ? "Downstream fasteners (screws/bolts)"
      : "Semi-finished steel (slab/billet)",
    baseline_label_zh: isFastener ? "下游紧固件（螺钉/螺栓）" : "半成品钢（板坯/方坯）",
    cn_code: cn,
    has_lifecycle_transparency: hasTransparency,
    default_see_tco2e_per_t: defaultSee,
    approved_see_tco2e_per_t: approvedSee,
    see_source: hasTransparency ? "mock_china_actual_1.60" : "no_lifecycle_transparency",
    benchmark_tco2e_per_t: BM,
    free_allocation_pct: FREE_ALLOC,
    carbon_price_eur: PRICE,
    default_path_eur_per_tonne: defaultEur,
    approved_path_eur_per_tonne: approvedEur,
    discount_eur_per_tonne: discount,
    discount_pct: discountPct,
    cost_pct_of_fob_default: costSharePct(defaultEur, FOB),
    cost_pct_of_fob_approved: costSharePct(approvedEur, FOB),
    regulated_approved_eur_per_tonne: result.tariff_if_approved?.tariff_eur_per_tonne ?? 4.02,
    regulated_denied_eur_per_tonne: result.tariff_if_denied?.tariff_eur_per_tonne ?? 4.43,
    note_en:
      "Client mock industry baseline (literature walkthrough). Re-run Stage 3 for server-computed illustration.",
    note_zh: "前端示意行业基线（文献算例）。重新运行阶段 3 可获取服务端计算值。",
  };
}

/** Ensure tariff UX fields exist — fill from mock when API payload is partial. */
export function withIndustryIllustration(result: CbamScoreResult): CbamScoreResult {
  if (result.industry_illustration?.default_path_eur_per_tonne != null) {
    return result;
  }
  const ill = buildMockIndustryIllustration(result, {
    cnCode: "7318 15 88",
    hasTransparency: (result.approval_likelihood_pct ?? 0) >= 55,
  });
  const fob = result.export_margin?.fob_eur_per_tonne ?? FOB;
  const marginBefore = result.export_margin?.margin_eur_per_tonne_before ?? 102;
  const afterOk = Math.round((marginBefore - ill.approved_path_eur_per_tonne) * 100) / 100;
  const afterNo = Math.round((marginBefore - ill.default_path_eur_per_tonne) * 100) / 100;
  return {
    ...result,
    industry_illustration: ill,
    export_margin: {
      fob_eur_per_tonne: fob,
      margin_pct_before_cbam: result.export_margin?.margin_pct_before_cbam ?? 12,
      margin_eur_per_tonne_before: marginBefore,
      tariff_if_approved_eur_per_tonne: ill.approved_path_eur_per_tonne,
      margin_eur_after_approved: afterOk,
      margin_pct_after_approved: Math.round((afterOk / fob) * 10000) / 100,
      tariff_if_denied_eur_per_tonne: ill.default_path_eur_per_tonne,
      margin_eur_after_denied: afterNo,
      margin_pct_after_denied: Math.round((afterNo / fob) * 10000) / 100,
      margin_saved_by_approval_eur_per_tonne: ill.discount_eur_per_tonne,
      cost_pct_of_fob_if_approved: ill.cost_pct_of_fob_approved,
      cost_pct_of_fob_if_denied: ill.cost_pct_of_fob_default,
      note_en:
        result.export_margin?.note_en ??
        "Illustrative margin using industry baseline CBAM €/t (mock).",
      note_zh: result.export_margin?.note_zh ?? "示意利润（行业基线 CBAM €/t · 前端 mock）。",
    },
  };
}
