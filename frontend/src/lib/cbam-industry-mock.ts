/**
 * Fallback when Stage-3 API omits industry_illustration (stale response).
 * Uses calculation_engine tariffs from the same payload — never literature €172/€526.
 */

import type { CbamIndustryIllustration, CbamScoreResult } from "@/lib/api";
import { costSharePct } from "@/lib/cbam-research-baseline";

const FOB = 850;

/** Build illustration from engine tariff scenarios already on the score result. */
export function buildMockIndustryIllustration(
  result: Partial<CbamScoreResult> & { total_score?: number },
  opts?: { cnCode?: string | null; hasTransparency?: boolean },
): CbamIndustryIllustration {
  const cn = opts?.cnCode ?? result.industry_illustration?.cn_code ?? "7208 10 00";
  const denied = result.tariff_if_denied;
  const approved = result.tariff_if_approved;
  const hasTransparency =
    opts?.hasTransparency ??
    (result.tariff?.data_source === "measured" || (result.approval_likelihood_pct ?? 0) >= 55);

  const defaultEur = denied?.tariff_eur_per_tonne ?? 0;
  const approvedEur = hasTransparency ? (approved?.tariff_eur_per_tonne ?? defaultEur) : defaultEur;
  const defaultSee = denied?.intensity_tco2e_per_tonne ?? 0;
  const approvedSee = hasTransparency
    ? (approved?.intensity_tco2e_per_tonne ?? defaultSee)
    : defaultSee;
  const discount = Math.round(Math.max(0, defaultEur - approvedEur) * 100) / 100;
  const discountPct = defaultEur > 0 ? Math.round((discount / defaultEur) * 1000) / 10 : 0;
  const bm = denied?.benchmark_tco2e_per_tonne ?? 1.37;
  const phi = denied?.phase_in_factor ?? 0.025;
  const price = denied?.certificate_price_eur_per_tco2e ?? 75.36;

  return {
    baseline_key: "engine",
    baseline_label_en: "Annex I default vs measured (engine)",
    baseline_label_zh: "Annex I 默认 vs 实测（引擎）",
    cn_code: cn,
    has_lifecycle_transparency: hasTransparency,
    default_see_tco2e_per_t: defaultSee,
    approved_see_tco2e_per_t: approvedSee,
    see_source: hasTransparency ? "engine_measured" : "engine_annex_i_default",
    benchmark_tco2e_per_t: bm,
    free_allocation_pct: phi,
    carbon_price_eur: price,
    default_path_eur_per_tonne: defaultEur,
    approved_path_eur_per_tonne: approvedEur,
    discount_eur_per_tonne: discount,
    discount_pct: discountPct,
    cost_pct_of_fob_default: costSharePct(defaultEur, FOB),
    cost_pct_of_fob_approved: costSharePct(approvedEur, FOB),
    regulated_approved_eur_per_tonne: approved?.tariff_eur_per_tonne ?? approvedEur,
    regulated_denied_eur_per_tonne: denied?.tariff_eur_per_tonne ?? defaultEur,
    note_en:
      "Client fallback from engine tariff scenarios (IR 2025/2621 Annex I). Re-run Stage 3 for full server payload.",
    note_zh: "前端回退：使用引擎关税情景（IR 2025/2621 附件 I）。重新运行阶段 3 以获取完整服务端载荷。",
  };
}

/** Ensure tariff UX fields exist — fill from engine tariffs when API payload is partial. */
export function withIndustryIllustration(result: CbamScoreResult): CbamScoreResult {
  if (result.industry_illustration?.default_path_eur_per_tonne != null) {
    return result;
  }
  const ill = buildMockIndustryIllustration(result, {
    cnCode: result.industry_illustration?.cn_code,
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
        "Illustrative margin using calculation_engine CBAM €/t (Annex I vs measured).",
      note_zh: result.export_margin?.note_zh ?? "示意利润（核算引擎 CBAM €/t · Annex I vs 实测）。",
    },
  };
}
