/**
 * Annex I China × CN reference for Stage-3 annotation.
 * SEE values from IR (EU) 2025/2621 Annex I — not literature €/t walkthroughs.
 * Passport €/t always come from calculation_engine.
 */

export type CbamResearchSource = {
  id: string;
  labelEn: string;
  labelZh: string;
  citeEn: string;
  citeZh: string;
  url?: string;
};

export type AnnexIChinaRow = {
  id: string;
  categoryEn: string;
  categoryZh: string;
  productEn: string;
  productZh: string;
  cnCode: string;
  /** Pre-mark-up Annex I China default SEE (tCO2e/t) */
  annexSeeTco2ePerT: number;
  /** 2026 SEE including 10% mark-up */
  see2026MarkedUp: number;
  noteEn: string;
  noteZh: string;
};

export const CBAM_RESEARCH_SOURCES: CbamResearchSource[] = [
  {
    id: "ir-2025-2621-annex-i",
    labelEn: "Commission Implementing Regulation (EU) 2025/2621 — Annex I",
    labelZh: "欧盟委员会实施条例 (EU) 2025/2621 — 附件 I",
    citeEn:
      "Country × CN default embedded emissions for CBAM Art. 7(2)(b). China cells verified on EUR-Lex.",
    citeZh: "CBAM 第 7(2)(b) 条国家×税则号默认隐含排放。中国单元格已对照 EUR-Lex。",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32025R2621",
  },
  {
    id: "ir-2025-2620-bm",
    labelEn: "Commission Implementing Regulation (EU) 2025/2620 — CBAM BM",
    labelZh: "欧盟委员会实施条例 (EU) 2025/2620 — CBAM 基准",
    citeEn: "Free-allocation / CBAM benchmark by route — BF/BOF route (C) = 1.370 tCO₂e/t.",
    citeZh: "按工艺路线的免费配额 / CBAM 基准 — BF/BOF 路线 (C) = 1.370 tCO₂e/t。",
  },
  {
    id: "cert-price-q1-2026",
    labelEn: "EU CBAM certificate price (Q1 2026 quarterly average)",
    labelZh: "欧盟 CBAM 证书价格（2026 年第一季度均价）",
    citeEn: "First official quarterly price: 75.36 €/tCO₂e — linked to EU ETS allowance auctions.",
    citeZh: "首个官方季度价格：75.36 €/tCO₂e — 挂钩欧盟排放交易体系（ETS）拍卖均价。",
  },
];

/** Locked-scope China Annex I SEE (pre-mark-up) — mirrors calculation_engine. */
export const ANNEX_I_CHINA_ROWS: AnnexIChinaRow[] = [
  {
    id: "7208",
    categoryEn: "Steel — flat",
    categoryZh: "钢铁 — 扁平材",
    productEn: "Hot-rolled flat ≥600 mm",
    productZh: "热轧扁平材（≥600 mm）",
    cnCode: "7208",
    annexSeeTco2ePerT: 3.187,
    see2026MarkedUp: 3.506,
    noteEn: "IR 2025/2621 Annex I · China × 7208. Engine uses this cell (not a Chinese GHG DB).",
    noteZh: "IR 2025/2621 附件 I · 中国 × 7208。引擎用此单元格（非中国 GHG 因子库）。",
  },
  {
    id: "7207",
    categoryEn: "Steel — semi-finished",
    categoryZh: "钢铁 — 半成品",
    productEn: "Semi-finished (e.g. 7207 11 14)",
    productZh: "半成品（如 7207 11 14）",
    cnCode: "7207",
    annexSeeTco2ePerT: 3.169,
    see2026MarkedUp: 3.486,
    noteEn: "Annex I China × 7207 family.",
    noteZh: "附件 I 中国 × 7207 族。",
  },
  {
    id: "7213",
    categoryEn: "Steel — bars",
    categoryZh: "钢铁 — 棒材",
    productEn: "Hot-rolled bars in coils",
    productZh: "热轧盘条",
    cnCode: "7213",
    annexSeeTco2ePerT: 3.169,
    see2026MarkedUp: 3.486,
    noteEn: "Annex I China × 7213.",
    noteZh: "附件 I 中国 × 7213。",
  },
  {
    id: "7318-15",
    categoryEn: "Steel — fasteners",
    categoryZh: "钢铁 — 紧固件",
    productEn: "Threaded screws & bolts",
    productZh: "螺纹螺钉与螺栓",
    cnCode: "7318 15",
    annexSeeTco2ePerT: 6.375,
    see2026MarkedUp: 7.013,
    noteEn: "Annex I China × 7318 15 — higher than flat products; maps to 7318 15 42 / 88.",
    noteZh: "附件 I 中国 × 7318 15 — 高于扁平材；对应 7318 15 42 / 88。",
  },
  {
    id: "7302",
    categoryEn: "Steel — railway",
    categoryZh: "钢铁 — 铁道",
    productEn: "Railway track material",
    productZh: "铁道轨道材料",
    cnCode: "7302",
    annexSeeTco2ePerT: 6.205,
    see2026MarkedUp: 6.826,
    noteEn: "Annex I China × 7302.",
    noteZh: "附件 I 中国 × 7302。",
  },
];

/** Cost as % of illustrative product value (FOB). */
export function costSharePct(tariffEurPerT: number, fobEurPerT: number): number {
  if (!fobEurPerT || fobEurPerT <= 0) return 0;
  return Math.round((tariffEurPerT / fobEurPerT) * 1000) / 10;
}

export function sourceById(id: string): CbamResearchSource | undefined {
  return CBAM_RESEARCH_SOURCES.find((s) => s.id === id);
}
