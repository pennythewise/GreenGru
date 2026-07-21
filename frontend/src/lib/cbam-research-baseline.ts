/**
 * Literature / industry CBAM cost baselines for Stage-3 annotation.
 * These are NOT the passport's regulated numbers (those come from calculation_engine).
 * Citations are shown in the UI so operators can see why actual-values approval matters.
 */

export type CbamResearchSource = {
  id: string;
  labelEn: string;
  labelZh: string;
  /** Short citation line */
  citeEn: string;
  citeZh: string;
  url?: string;
};

export type CbamResearchExample = {
  id: string;
  categoryEn: string;
  categoryZh: string;
  productEn: string;
  productZh: string;
  cnCode: string;
  /** Published / worked-example default-path CBAM €/t (literature) */
  defaultPathEurPerT: number | null;
  defaultSeeTco2ePerT: number | null;
  benchmarkTco2ePerT: number | null;
  carbonPriceUsedEur: number | null;
  noteEn: string;
  noteZh: string;
  sourceIds: string[];
  /** In-scope for GreenGru steel MVP */
  inScope: boolean;
};

export const CBAM_RESEARCH_SOURCES: CbamResearchSource[] = [
  {
    id: "cisa-defaults-2026",
    labelEn: "China Iron and Steel Association (via China Environmental Network)",
    labelZh: "中国钢铁工业协会（转引自中国环境网）",
    citeEn:
      "30 Apr 2026 — EU CBAM default values for Chinese products generally above 3 tCO₂/t, some up to ~7 tCO₂/t; clear gap vs actuals.",
    citeZh:
      "2026-04-30 — 欧委会对中国产品设定的 CBAM 默认排放值普遍高于 3 tCO₂/t，部分可达约 7 tCO₂/t，与实际值差距显著。",
    url: "https://www.cenews.com.cn/",
  },
  {
    id: "cert-price-q1-2026",
    labelEn: "EU CBAM certificate price (Q1 2026 quarterly average)",
    labelZh: "欧盟 CBAM 证书价格（2026 年第一季度均价）",
    citeEn: "First official quarterly price: 75.36 €/tCO₂e — linked to EU ETS allowance auctions.",
    citeZh: "首个官方季度价格：75.36 €/tCO₂e — 挂钩欧盟排放交易体系（ETS）拍卖均价。",
    url: "https://www.regjeringen.no/",
  },
  {
    id: "star-securities-2026",
    labelEn: "Star of Securities industry note",
    labelZh: "证券之星产业分析",
    citeEn:
      "23 Jan 2026 — Discusses how high default-path carbon tariffs can erase margins on low value-added steel/aluminium exports.",
    citeZh: "2026-01-23 — 分析默认值路径下碳关税对低附加值钢铝出口利润的挤压。",
  },
  {
    id: "screws-worked-example",
    labelEn: "Downstream steel worked example (CN 7318 12 10)",
    labelZh: "下游钢铁算例（CN 7318 12 10）",
    citeEn:
      "Stainless wood screws: ~€526.47/t CBAM at 80 €/tCO₂e using (default − benchmark×free-allocation%) × carbon price.",
    citeZh:
      "不锈钢木螺钉：在 80 €/tCO₂e 下，按（默认值 − 基准×免费配额比例）× 碳价估算约 €526.47/t。",
  },
  {
    id: "slab-worked-example",
    labelEn: "Semi-finished steel worked example (CN 7207 12 10)",
    labelZh: "半成品钢算例（CN 7207 12 10）",
    citeEn:
      "Slab/billet: ~€172.46/t at default 3.486 tCO₂e/t, benchmark 1.364, 97.5% free allocation (2026), ~80 €/tCO₂e in the published walkthrough.",
    citeZh:
      "板坯/方坯：默认 3.486 tCO₂e/t、基准 1.364、2026 年 97.5% 免费配额，公开算例约 €172.46/t。",
  },
  {
    id: "china-factor-1-60",
    labelEn: "China national crude-steel emissions factor (context)",
    labelZh: "中国粗钢排放因子（对照）",
    citeEn:
      "Official China crude-steel intensity often cited near ~1.60 tCO₂e/t — well below many EU default values for Chinese goods.",
    citeZh: "中国粗钢官方强度常引用约 1.60 tCO₂e/t — 远低于多项对华默认值。",
  },
  {
    id: "trademap",
    labelEn: "TradeMap trade statistics",
    labelZh: "TradeMap 贸易统计",
    citeEn: "Export value/volume time series used as context for how €/t CBAM scales with shipment size.",
    citeZh: "出口金额/数量时间序列，用于理解 €/t CBAM 随出货规模放大的影响。",
    url: "https://www.trademap.org/",
  },
  {
    id: "hanwen-al-price",
    labelEn: "Hanwen Information — aluminium export price (out-of-scope context)",
    labelZh: "汉文信息 — 铝锭出口价（范围外对照）",
    citeEn:
      "Nov 2025 China aluminium ingot avg export price ≈ $2,701.65/t (~€2,500). Shown only as price-scale context — GreenGru MVP is steel-only.",
    citeZh:
      "2025-11 中国铝锭出口均价约 $2,701.65/t（约 €2,500）。仅作价格量级对照 — GreenGru MVP 仅覆盖钢铁。",
  },
];

export const CBAM_RESEARCH_EXAMPLES: CbamResearchExample[] = [
  {
    id: "slab-72071210",
    categoryEn: "Steel — semi-finished",
    categoryZh: "钢铁 — 半成品",
    productEn: "Slab / billet",
    productZh: "板坯 / 方坯",
    cnCode: "7207 12 10",
    defaultPathEurPerT: 172.46,
    defaultSeeTco2ePerT: 3.486,
    benchmarkTco2ePerT: 1.364,
    carbonPriceUsedEur: 80,
    noteEn:
      "Literature walkthrough: (3.486 − 1.364×97.5%) × ~80 € ≈ €172.46/t on the default path. Free allocation phases out → cost rises after 2026.",
    noteZh:
      "公开算例：（3.486 − 1.364×97.5%）× 约 80 € ≈ €172.46/t（默认值路径）。免费配额退坡后成本将上升。",
    sourceIds: ["slab-worked-example", "cisa-defaults-2026", "cert-price-q1-2026"],
    inScope: true,
  },
  {
    id: "screws-73181210",
    categoryEn: "Steel — downstream fasteners",
    categoryZh: "钢铁 — 下游紧固件",
    productEn: "Stainless wood screws",
    productZh: "不锈钢木螺钉",
    cnCode: "7318 12 10",
    defaultPathEurPerT: 526.47,
    defaultSeeTco2ePerT: null,
    benchmarkTco2ePerT: null,
    carbonPriceUsedEur: 80,
    noteEn:
      "Downstream product example at 80 €/tCO₂e — default-path CBAM can exceed €500/t and wipe thin SME margins. Closest GreenGru codes: 7318 15 42 / 7318 15 88.",
    noteZh:
      "下游产品算例（80 €/tCO₂e）— 默认值路径 CBAM 可超 €500/t，吞噬中小企业薄利。本产品最接近 GreenGru 码：7318 15 42 / 7318 15 88。",
    sourceIds: ["screws-worked-example", "star-securities-2026", "cisa-defaults-2026"],
    inScope: true,
  },
  {
    id: "al-context",
    categoryEn: "Aluminium (context only)",
    categoryZh: "铝（仅对照）",
    productEn: "Primary / alloy plate (not in MVP scope)",
    productZh: "原铝 / 合金厚板（不在 MVP 范围）",
    cnCode: "—",
    defaultPathEurPerT: null,
    defaultSeeTco2ePerT: 4.12,
    benchmarkTco2ePerT: null,
    carbonPriceUsedEur: null,
    noteEn:
      "Industry notes EU default 4.12 vs China actual ~2.57 tCO₂/t (>60% gap). Aluminium is out of GreenGru locked scope — cited only to show why verified actuals matter.",
    noteZh:
      "行业称欧盟默认 4.12、中国实际约 2.57 tCO₂/t（差距超 60%）。铝不在 GreenGru 锁定范围 — 仅说明实际值核验的重要性。",
    sourceIds: ["hanwen-al-price", "cisa-defaults-2026", "star-securities-2026"],
    inScope: false,
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
