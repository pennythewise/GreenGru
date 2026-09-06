// Mock procurement catalog for the Marketplace tab. Ranking is deterministic —
// no LLM call is involved in scoring, pricing, or the emissions-impact numbers,
// consistent with the calculation-engine rule the rest of the app follows.

export type MarketplaceCategory =
  | "energy-monitoring"
  | "waste-heat-recovery"
  | "furnace-heat-treatment"
  | "solar-pv"
  | "efficiency-retrofits";

export const marketplaceCategories: {
  key: MarketplaceCategory;
  en: string;
  zh: string;
}[] = [
  { key: "energy-monitoring", en: "Energy Monitoring", zh: "能耗监测" },
  { key: "waste-heat-recovery", en: "Waste Heat Recovery", zh: "余热回收" },
  {
    key: "furnace-heat-treatment",
    en: "Furnace & Heat Treatment",
    zh: "炉窑热处理",
  },
  { key: "solar-pv", en: "Solar & PV", zh: "光伏" },
  { key: "efficiency-retrofits", en: "Efficiency Retrofits", zh: "节能改造" },
];

export type PriorityTier = "high" | "medium" | "strategic" | "data";

export type MarketplaceListing = {
  id: string;
  category: MarketplaceCategory;
  nameEn: string;
  nameZh: string;
  supplierEn: string;
  supplierZh: string;
  priceRmb: number;
  marketPriceRmb: number;
  /** tCO2e/yr avoided by installing this — null when the listing's value is data-coverage, not a direct cut. */
  impactTco2e: number | null;
  impactNoteEn?: string;
  impactNoteZh?: string;
  assetId: string;
  whyEn: string;
  whyZh: string;
  priorityScore: number;
  priorityTier: PriorityTier;
  paybackYears: number | null;
  leadTime: string;
  specs: { labelEn: string; labelZh: string; value: string }[];
  diagnostic: {
    beforeLabelEn: string;
    beforeLabelZh: string;
    beforeValue: string;
    beforeSubEn: string;
    beforeSubZh: string;
    afterLabelEn: string;
    afterLabelZh: string;
    afterValue: string;
    afterSubEn: string;
    afterSubZh: string;
  };
  /** Grid emission factor (tCO2e/MWh, no green-power trading) used for the math line — mirrors lib/cisa-grid-ef.ts. */
  gridEfTPerMwh: number;
  mwhPerYear: number | null;
  contact: {
    nameEn: string;
    nameZh: string;
    responseTime: string;
    installsOnRecord: string;
  };
};

export function discountPct(listing: MarketplaceListing): number {
  return Math.round(
    ((listing.marketPriceRmb - listing.priceRmb) / listing.marketPriceRmb) *
      100,
  );
}

export const marketplaceListings: MarketplaceListing[] = [
  {
    id: "jn-500-waste-heat",
    category: "waste-heat-recovery",
    nameEn: "JN-500 Waste Heat Recovery Exchanger",
    nameZh: "捷能 JN-500 余热回收换热器",
    supplierEn: "Jieneng Environmental Equipment (Ningbo) Co., Ltd.",
    supplierZh: "捷能环保设备（宁波）有限公司",
    priceRmb: 186_000,
    marketPriceRmb: 220_000,
    impactTco2e: 340,
    assetId: "QTF-03",
    whyEn:
      "Your quench-temper furnace QTF-03 exhausts at 340°C with zero heat recovery — an estimated 610 MWh/yr of reusable heat is currently vented.",
    whyZh:
      "淬火回火炉 QTF-03 排烟温度340°C，未加装余热回收，年浪费可回收热量约610 MWh。",
    priorityScore: 94,
    priorityTier: "high",
    paybackYears: 2.1,
    leadTime: "6–8 weeks",
    specs: [
      {
        labelEn: "Recovery capacity",
        labelZh: "回收功率",
        value: "460 kW thermal",
      },
      { labelEn: "Install lead time", labelZh: "安装周期", value: "6–8 weeks" },
      { labelEn: "Footprint", labelZh: "占地", value: "3.2 × 1.8 m" },
      { labelEn: "Warranty", labelZh: "质保", value: "5 years" },
    ],
    diagnostic: {
      beforeLabelEn: "QTF-03 today",
      beforeLabelZh: "QTF-03 现状",
      beforeValue: "340°C",
      beforeSubEn: "exhaust vented, no recovery",
      beforeSubZh: "排烟直排，无回收",
      afterLabelEn: "With JN-500 installed",
      afterLabelZh: "加装 JN-500 后",
      afterValue: "~95°C",
      afterSubEn: "610 MWh/yr recovered to preheat",
      afterSubZh: "年回收约610 MWh用于预热",
    },
    gridEfTPerMwh: 0.5568,
    mwhPerYear: 610,
    contact: {
      nameEn: "Mr. Lin",
      nameZh: "林工",
      responseTime: "< 24h",
      installsOnRecord: "37 · Zhejiang region",
    },
  },
  {
    id: "vfd-90-compressor",
    category: "efficiency-retrofits",
    nameEn: "VFD-90 Compressor Retrofit Kit",
    nameZh: "英维克 VFD-90 变频节能改造包",
    supplierEn: "Invt Energy Technology Co., Ltd.",
    supplierZh: "英维克节能科技有限公司",
    priceRmb: 42_800,
    marketPriceRmb: 51_000,
    impactTco2e: 86,
    assetId: "AC-02",
    whyEn:
      "Air compressor AC-02 runs fixed-speed, 31% below the part-load efficiency benchmark for its duty cycle.",
    whyZh: "空压机 AC-02 定频运行，效率低于同类负载基准31%。",
    priorityScore: 81,
    priorityTier: "medium",
    paybackYears: 1.4,
    leadTime: "2–3 weeks",
    specs: [
      { labelEn: "Motor rating", labelZh: "电机功率", value: "90 kW" },
      { labelEn: "Install lead time", labelZh: "安装周期", value: "2–3 weeks" },
      { labelEn: "Retrofit type", labelZh: "改造类型", value: "Drop-in VFD" },
      { labelEn: "Warranty", labelZh: "质保", value: "3 years" },
    ],
    diagnostic: {
      beforeLabelEn: "AC-02 today",
      beforeLabelZh: "AC-02 现状",
      beforeValue: "Fixed-speed",
      beforeSubEn: "31% below part-load benchmark",
      beforeSubZh: "低于同类负载基准31%",
      afterLabelEn: "With VFD-90 installed",
      afterLabelZh: "加装 VFD-90 后",
      afterValue: "154 MWh/yr saved",
      afterSubEn: "matches part-load benchmark",
      afterSubZh: "达到同类负载基准",
    },
    gridEfTPerMwh: 0.5568,
    mwhPerYear: 154,
    contact: {
      nameEn: "Ms. Zhou",
      nameZh: "周工",
      responseTime: "< 24h",
      installsOnRecord: "112 · nationwide",
    },
  },
  {
    id: "igbt-rectifier-ep1",
    category: "furnace-heat-treatment",
    nameEn: "IGBT High-Efficiency Rectifier Upgrade",
    nameZh: "高效IGBT整流器改造",
    supplierEn: "Ningbo Zhongke Precision Plating Equipment Co., Ltd.",
    supplierZh: "宁波中科精密电镀设备有限公司",
    priceRmb: 128_000,
    marketPriceRmb: 149_000,
    impactTco2e: 64,
    assetId: "EP-1",
    whyEn:
      "Electroplating line EP-1's SCR rectifier converts at 82% vs 95%+ for IGBT — roughly 46 MWh/yr lost to heat.",
    whyZh:
      "电镀线 EP-1 晶闸管整流器效率仅82%，IGBT可达95%以上，年损耗约46 MWh。",
    priorityScore: 68,
    priorityTier: "medium",
    paybackYears: 3.6,
    leadTime: "4–5 weeks",
    specs: [
      { labelEn: "Conversion efficiency", labelZh: "转换效率", value: "95%+" },
      { labelEn: "Install lead time", labelZh: "安装周期", value: "4–5 weeks" },
      { labelEn: "Output rating", labelZh: "输出规格", value: "12V / 8000A" },
      { labelEn: "Warranty", labelZh: "质保", value: "3 years" },
    ],
    diagnostic: {
      beforeLabelEn: "EP-1 today",
      beforeLabelZh: "EP-1 现状",
      beforeValue: "82%",
      beforeSubEn: "SCR rectifier conversion efficiency",
      beforeSubZh: "晶闸管整流效率",
      afterLabelEn: "With IGBT rectifier",
      afterLabelZh: "更换IGBT整流器后",
      afterValue: "115 MWh/yr saved",
      afterSubEn: "95%+ conversion efficiency",
      afterSubZh: "转换效率提升至95%以上",
    },
    gridEfTPerMwh: 0.5568,
    mwhPerYear: 115,
    contact: {
      nameEn: "Mr. Xu",
      nameZh: "徐工",
      responseTime: "< 48h",
      installsOnRecord: "19 · Zhejiang region",
    },
  },
  {
    id: "sungrow-rooftop-pv-300kw",
    category: "solar-pv",
    nameEn: "Rooftop PV 300kW System",
    nameZh: "阳光电源屋顶光伏 300kW",
    supplierEn: "Sungrow Power Supply Co., Ltd.",
    supplierZh: "阳光电源股份有限公司",
    priceRmb: 1_260_000,
    marketPriceRmb: 1_480_000,
    impactTco2e: 510,
    assetId: "Workshop 3 roof",
    whyEn:
      "Grid electricity is 41% of your Scope 2 exposure; 2,400 m² of south-facing roof on Workshop 3 sits unused.",
    whyZh: "电网购电占Scope2排放41%，车间三号2,400平方米南向屋顶尚未利用。",
    priorityScore: 61,
    priorityTier: "strategic",
    paybackYears: 6.8,
    leadTime: "10–14 weeks",
    specs: [
      { labelEn: "System size", labelZh: "系统规模", value: "300 kW" },
      {
        labelEn: "Install lead time",
        labelZh: "安装周期",
        value: "10–14 weeks",
      },
      { labelEn: "Roof area used", labelZh: "占用屋顶面积", value: "2,400 m²" },
      { labelEn: "Warranty", labelZh: "质保", value: "25 years panels" },
    ],
    diagnostic: {
      beforeLabelEn: "Workshop 3 roof today",
      beforeLabelZh: "车间三号屋顶现状",
      beforeValue: "Unused",
      beforeSubEn: "2,400 m² south-facing, no generation",
      beforeSubZh: "2,400平方米南向，无发电",
      afterLabelEn: "With 300kW PV installed",
      afterLabelZh: "加装300kW光伏后",
      afterValue: "916 MWh/yr generated",
      afterSubEn: "offsets grid electricity",
      afterSubZh: "抵消电网购电",
    },
    gridEfTPerMwh: 0.5568,
    mwhPerYear: 916,
    contact: {
      nameEn: "Ms. Pan",
      nameZh: "潘工",
      responseTime: "< 48h",
      installsOnRecord: "260+ · nationwide",
    },
  },
  {
    id: "wasion-ws9800-submetering",
    category: "energy-monitoring",
    nameEn: "WS-9800 Sub-metering Sensor Kit ×4",
    nameZh: "威胜 WS-9800 分项计量传感器包 ×4",
    supplierEn: "Wasion Information Technology Co., Ltd.",
    supplierZh: "威胜信息技术股份有限公司",
    priceRmb: 18_600,
    marketPriceRmb: 21_000,
    impactTco2e: null,
    impactNoteEn: "Unlocks Tier 1 data credit",
    impactNoteZh: "解锁 Tier 1 数据加分",
    assetId: "CH-07–CH-12",
    whyEn:
      "Cold-heading line CH-07–CH-12 (6 units, ~18% of shop-floor load) is still unmetered — caps your CISA data-quality tier at Tier 2.",
    whyZh:
      "冷镦机组 CH-07–CH-12（6台，约占车间负荷18%）尚未计量，评级停留于Tier 2。",
    priorityScore: 55,
    priorityTier: "data",
    paybackYears: null,
    leadTime: "3 weeks",
    specs: [
      {
        labelEn: "Coverage",
        labelZh: "覆盖范围",
        value: "6 machines, 4 sensor units",
      },
      { labelEn: "Install lead time", labelZh: "安装周期", value: "3 weeks" },
      {
        labelEn: "Data interface",
        labelZh: "数据接口",
        value: "RS-485 → existing bus",
      },
      { labelEn: "Warranty", labelZh: "质保", value: "2 years" },
    ],
    diagnostic: {
      beforeLabelEn: "CH-07–CH-12 today",
      beforeLabelZh: "CH-07–CH-12 现状",
      beforeValue: "Unmetered",
      beforeSubEn: "~18% of shop-floor load, no data",
      beforeSubZh: "约占车间负荷18%，无数据",
      afterLabelEn: "With WS-9800 installed",
      afterLabelZh: "加装 WS-9800 后",
      afterValue: "Tier 1 eligible",
      afterSubEn: "full stage-level metering coverage",
      afterSubZh: "实现工序级全覆盖计量",
    },
    gridEfTPerMwh: 0.5568,
    mwhPerYear: null,
    contact: {
      nameEn: "Mr. Chen",
      nameZh: "陈工",
      responseTime: "< 24h",
      installsOnRecord: "540+ · nationwide",
    },
  },
];

/** Ranked descending by priority score — cost-effectiveness and gap severity first, raw impact second. */
export function rankedMarketplaceListings(
  category?: MarketplaceCategory,
): MarketplaceListing[] {
  return marketplaceListings
    .filter((l) => !category || l.category === category)
    .slice()
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getMarketplaceListing(
  id: string,
): MarketplaceListing | undefined {
  return marketplaceListings.find((l) => l.id === id);
}
