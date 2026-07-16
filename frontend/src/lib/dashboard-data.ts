// Demo data for the GreenGru MVP flow.
// Illustrative only — real system pulls from cited sources.

export const company = {
  name: "宁波恒峰精密紧固件有限公司",
  nameEn: "Ningbo Hengfeng Precision Fasteners Co., Ltd.",
  id: "CBP-2026-0417",
  route: "BF-BOF",
  location: "浙江宁波 · Ningbo, Zhejiang",
  status: "Verified · 已核验",
  lastSync: "2026-03-14 09:41 CST",
  operator: "Zhao Min · QC lead",
  registration: "91330203MA2G4X7K9L",
};

// Three route-scoped grade cards shown on Dashboard.
export const routeGrades = [
  {
    key: "loan",
    label: "Green loan",
    zh: "绿色贷款",
    grade: "B",
    status: "Low-risk · eligible",
    statusZh: "低风险 · 符合条件",
    tone: "carbon" as const,
    gapLabel: "gap −0.4 to A",
    gapLabelZh: "距 A 级差 0.4",
    kb: "PBOC 2025 Green Finance Catalogue",
  },
  {
    key: "grant",
    label: "Factory grant",
    zh: "零碳工厂补贴",
    grade: "C",
    status: "Two gaps to close",
    statusZh: "两项差距待关闭",
    tone: "warning" as const,
    gapLabel: "+6 pts to B",
    gapLabelZh: "距 B 级 +6 分",
    kb: "GB/T 36132 · 工信部联节〔2026〕13号",
  },
  {
    key: "cbam",
    label: "EU license (CBAM)",
    zh: "碳关税",
    grade: "C",
    status: "Exposed · €38/t 2026",
    statusZh: "暴露 · 2026 年 €38/吨",
    tone: "ember" as const,
    gapLabel: "+37% over benchmark",
    gapLabelZh: "超基准 +37%",
    kb: "Reg (EU) 2023/956 · IR (EU) 2025/2621",
  },
];

// Ratio sliders shown on Dashboard (grant rubric levers).
export const ratioSliders = [
  { key: "scrap", label: "Scrap steel ratio", zh: "废钢比", value: 24.5, target: 40, unit: "%" },
  { key: "green", label: "Green electricity ratio", zh: "绿电比", value: 45.0, target: 60, unit: "%" },
  { key: "meter", label: "Metering coverage", zh: "计量覆盖", value: 78.0, target: 95, unit: "%" },
];

// Gauge — how close to next tier on the highest-priority route (Grant here).
export const tierGauge = { value: 68, min: 0, max: 100, label: "Grant score", nextTier: "B", zh: "距 B 级" };

// Process-stage matrix / heatmap (CISA screenshot pattern).
export const processMatrix = [
  { stage: "Sintering",   zh: "烧结", energy: "ok",    intensity: "warn", metering: "ok",   audit: "ok"   },
  { stage: "Melting",     zh: "炼钢", energy: "warn",  intensity: "bad",  metering: "warn", audit: "warn" },
  { stage: "Rolling",     zh: "轧制", energy: "ok",    intensity: "ok",   metering: "ok",   audit: "ok"   },
  { stage: "Galvanizing", zh: "镀锌", energy: "warn",  intensity: "warn", metering: "ok",   audit: "ok"   },
  { stage: "Finishing",   zh: "精加工", energy: "ok",   intensity: "ok",   metering: "warn", audit: "ok"   },
];

// Donut breakdown — emissions source split.
export const emissionsBreakdown = [
  { key: "direct",   label: "Direct combustion", value: 42, color: "var(--color-ember)" },
  { key: "process",  label: "Process reactions", value: 24, color: "var(--color-warning)" },
  { key: "indirect", label: "Indirect · grid",   value: 22, color: "var(--color-teal)" },
  { key: "upstream", label: "Upstream inputs",   value: 12, color: "var(--color-carbon)" },
];

// Simulated factory floor — live sensor snapshot per stage.
// Array order = production flow; keys sync 1:1 with processMatrix rows
// and the 3D factory zones in FactoryScene.
export type FactoryStageDatum = {
  key: string;
  stage: string;
  zh: string;
  voltage: number;
  current: number;
  power: number;
  carbon: number; // stage carbon intensity, tCO2e/t
  status: "ok" | "warn";
  warning?: string;
};

export const factoryFloor: FactoryStageDatum[] = [
  { key: "sintering",   stage: "Sintering",   zh: "烧结",   voltage: 396, current: 612, power: 242, carbon: 1.42, status: "ok" },
  { key: "melting",     stage: "Melting",     zh: "炼钢",   voltage: 402, current: 890, power: 358, carbon: 2.18, status: "warn", warning: "kW draw 12% over threshold" },
  { key: "rolling",     stage: "Rolling",     zh: "轧制",   voltage: 398, current: 540, power: 215, carbon: 1.05, status: "ok" },
  { key: "galvanizing", stage: "Galvanizing", zh: "镀锌",   voltage: 401, current: 470, power: 188, carbon: 0.98, status: "ok" },
  { key: "finishing",   stage: "Finishing",   zh: "精加工", voltage: 399, current: 310, power: 124, carbon: 0.41, status: "ok" },
];

// Interior equipment per stage — shown when the operator zooms into a building
// in the 3D factory. powerShare/carbonShare are % of the parent stage's power
// and carbon (each column sums to 100), so equipment numbers always reconcile
// with the stage totals above. Equipment lists follow standard plant layouts:
// sinter plant (proportioning → mixing → ignition → strand → cooler → ESP),
// BOF melt shop (scrap bay → hot metal → converter → LF → caster → OG),
// hot strip mill (reheat → roughing → finishing → laminar cooling → coiler),
// continuous hot-dip galvanizing line (cleaning → anneal → zinc pot → air
// knife → skin-pass), and a finishing/dispatch bay.
export type FactoryEquipment = {
  key: string;
  name: string;
  zh: string;
  role: string;
  powerShare: number;  // % of stage power
  carbonShare: number; // % of stage carbon intensity
  hotspot?: boolean;   // main emission source of the stage
};

export const factoryEquipment: Record<string, FactoryEquipment[]> = {
  sintering: [
    { key: "bins",     name: "Proportioning bins", zh: "配料仓",   role: "Weigh-feeds ore, coke breeze and flux", powerShare: 8,  carbonShare: 2 },
    { key: "drum",     name: "Mixing drum",        zh: "混料机",   role: "Granulates the raw mix with moisture",  powerShare: 6,  carbonShare: 2 },
    { key: "ignition", name: "Ignition furnace",   zh: "点火炉",   role: "Gas burners ignite the sinter bed",     powerShare: 12, carbonShare: 18 },
    { key: "strand",   name: "Sinter strand",      zh: "烧结机",   role: "Coke breeze burns through the bed",     powerShare: 38, carbonShare: 62, hotspot: true },
    { key: "cooler",   name: "Annular cooler",     zh: "环冷机",   role: "Air-cools hot sinter on a ring",        powerShare: 16, carbonShare: 4 },
    { key: "esp",      name: "ESP dust collector", zh: "静电除尘", role: "Cleans strand waste gas",               powerShare: 20, carbonShare: 12 },
  ],
  melting: [
    { key: "scrap",  name: "Scrap bay",         zh: "废钢加料跨", role: "Charges scrap into the converter",      powerShare: 4,  carbonShare: 2 },
    { key: "ladle",  name: "Hot metal ladle",   zh: "铁水包",     role: "Delivers BF hot metal for charging",    powerShare: 2,  carbonShare: 6 },
    { key: "bof",    name: "BOF converter",     zh: "转炉",       role: "O₂ blow oxidises C, Si, Mn from melt",  powerShare: 34, carbonShare: 58, hotspot: true },
    { key: "lf",     name: "Ladle furnace",     zh: "LF精炼炉",   role: "Arc reheating + alloy trim before cast", powerShare: 30, carbonShare: 14 },
    { key: "caster", name: "Continuous caster", zh: "连铸机",     role: "Casts steel into billets/slabs",        powerShare: 18, carbonShare: 12 },
    { key: "og",     name: "OG gas cleaning",   zh: "OG煤气净化", role: "Recovers and scrubs converter gas",     powerShare: 12, carbonShare: 8 },
  ],
  rolling: [
    { key: "reheat",  name: "Reheating furnace", zh: "加热炉",   role: "Gas-fired, brings billets to ~1200 °C", powerShare: 30, carbonShare: 72, hotspot: true },
    { key: "rough",   name: "Roughing stand",    zh: "粗轧机",   role: "First heavy reduction passes",          powerShare: 24, carbonShare: 10 },
    { key: "finish",  name: "Finishing stands",  zh: "精轧机组", role: "Tandem stands set final gauge",         powerShare: 28, carbonShare: 12 },
    { key: "laminar", name: "Laminar cooling",   zh: "层流冷却", role: "Water curtain sets coiling temp",       powerShare: 6,  carbonShare: 2 },
    { key: "coiler",  name: "Down coiler",       zh: "卷取机",   role: "Winds strip into hot coils",            powerShare: 12, carbonShare: 4 },
  ],
  galvanizing: [
    { key: "clean",  name: "Cleaning section",  zh: "清洗段", role: "Degreases strip before annealing",        powerShare: 10, carbonShare: 4 },
    { key: "anneal", name: "Annealing furnace", zh: "退火炉", role: "H₂/N₂ atmosphere, gas-fired recrystallise", powerShare: 34, carbonShare: 58, hotspot: true },
    { key: "pot",    name: "Zinc pot",          zh: "锌锅",   role: "Induction-heated molten zinc bath",       powerShare: 26, carbonShare: 28 },
    { key: "knife",  name: "Air knives",        zh: "气刀",   role: "Jets meter the zinc coating weight",      powerShare: 8,  carbonShare: 2 },
    { key: "spm",    name: "Skin-pass mill",    zh: "光整机", role: "Light pass for surface + flatness",       powerShare: 22, carbonShare: 8 },
  ],
  finishing: [
    { key: "ctl",     name: "Cut-to-length line", zh: "剪切线", role: "Shears strip to ordered lengths",   powerShare: 30, carbonShare: 30 },
    { key: "inspect", name: "Inspection station", zh: "检验台", role: "Surface + gauge QC before dispatch", powerShare: 8,  carbonShare: 5 },
    { key: "pack",    name: "Strapping machine",  zh: "打包机", role: "Straps and labels finished coils",   powerShare: 14, carbonShare: 10 },
    { key: "crane",   name: "Overhead crane",     zh: "行车",   role: "Moves coils to storage and trucks",  powerShare: 28, carbonShare: 35 },
    { key: "storage", name: "Coil storage",       zh: "卷材库区", role: "Saddle racks awaiting dispatch",   powerShare: 20, carbonShare: 20 },
  ],
};

export const factorySync = {
  lastSync: "09:41:22 CST",
  downstream: ["Readiness pre-screener", "Advisory agent", "Grant score writeback"],
};

export const submissions = [
  { id: "S-0417", route: "CBAM",  cn: "7318 15 88", desc: "Hex bolt M12",         tons: 1240, tier: "Exposed",   grade: "C", status: "Signed",      date: "2026-03-14" },
  { id: "S-0416", route: "Grant", cn: "—",           desc: "2025 Q4 factory pack", tons: 0,    tier: "Tier 2",    grade: "C", status: "Signed",      date: "2026-03-09" },
  { id: "S-0415", route: "Loan",  cn: "—",           desc: "3-yr working capital", tons: 0,    tier: "Low-risk",  grade: "B", status: "Needs input", date: "2026-03-05" },
  { id: "S-0414", route: "CBAM",  cn: "7301",        desc: "Welded angle",         tons: 310,  tier: "High",      grade: "D", status: "Signed",      date: "2026-02-27" },
  { id: "S-0413", route: "CBAM",  cn: "7302",        desc: "Rail track material",  tons: 145,  tier: "Marginal",  grade: "C", status: "Signed",      date: "2026-02-20" },
  { id: "S-0412", route: "Grant", cn: "—",           desc: "Metering upgrade",     tons: 0,    tier: "Tier 2",    grade: "C", status: "Signed",      date: "2026-02-11" },
];

// Six-stage pipeline per section 4 of brief.
export const pipelineStages = [
  { n: 1, key: "Intake",                zh: "接入",     model: "deterministic · OCR + StructBERT",       status: "done",    elapsed: "812 ms" },
  { n: 2, key: "Validate",              zh: "校验",     model: "诺诺 Nuonuo · invoiceInspection → 税务局", status: "done",    elapsed: "428 ms" },
  { n: 3, key: "Classify",              zh: "分类",     model: "qwen3.7-plus · CN code classifier → picks calc. method", status: "active", elapsed: "1.2 s" },
  { n: 4, key: "Calculate",             zh: "计算",     model: "python · rule-based",                      status: "pending", elapsed: null },
  { n: 5, key: "Update dashboard",      zh: "更新总览", model: "deterministic · data commit (no model)",  status: "pending", elapsed: null },
  { n: 6, key: "Authorize → Upstream",  zh: "授权上传", model: "operator confirm → Baowu API",    status: "pending", elapsed: null, requiresAuth: true },
];

// Horizontal per-route stage strip (Section 6 / B in brief).
export function routeStrip(kb: string) {
  return [
    { n: 1, key: "Pre-screener",     zh: "预筛",       method: "deterministic · doc checklist",   status: "done",    elapsed: "310 ms" },
    { n: 2, key: "Report",           zh: "报告",       method: "python · rule-based",              status: "done",    elapsed: "1.4 s" },
    { n: 3, key: "Score",            zh: "评分",       method: `rule-based · ${kb}`,               status: "active",  elapsed: "0.6 s" },
    { n: 4, key: "Pull factory data",zh: "工厂数据",   method: "deterministic · dashboard bus",    status: "pending", elapsed: null },
    { n: 5, key: "Advisory",         zh: "建议",       method: "qwen3.7-plus · EN / 中文",             status: "pending", elapsed: null },
  ];
}

// Document checklists per route (Section A in brief).
export const docChecklists = {
  loan: {
    title: "Green loan — required documents",
    kb: "PBOC 2025 Green Finance Catalogue",
    items: [
      { name: "Business licence · 营业执照", done: true },
      { name: "Latest 12-mo utility invoices", done: true },
      { name: "Emissions ledger · Q1–Q4 2025", done: true },
      { name: "Bank statement · last 6 mo", done: true },
      { name: "Green-project use-of-proceeds", done: false },
      { name: "Auditor attestation (optional)", done: false },
    ],
  },
  grant: {
    title: "Zero-carbon factory grant — required documents",
    kb: "GB/T 36132",
    items: [
      { name: "Factory registration · 工厂登记", done: true },
      { name: "Metering coverage report", done: true },
      { name: "Scrap-steel ratio evidence", done: true },
      { name: "Green-electricity PPA / green cert", done: true },
      { name: "Third-party emissions report (12 mo)", done: false },
      { name: "Provincial 零碳工厂 pre-cert", done: false },
    ],
  },
  passport: {
    title: "EU license (CBAM) — required documents",
    titleZh: "欧盟许可（CBAM）— 必填文件",
    kb: "Reg (EU) 2023/956 · EU Communication Template",
    items: [
      { name: "Summary_Process · Summary_Communication / Processes / Products", nameZh: "Summary_Process · 汇总沟通/工序/产品", done: false },
      { name: "A_InstData — installation, processes, purchased precursors", nameZh: "A_InstData — 装置、工序、购入前体", done: false },
      { name: "c_CodeLists — country codes, routes, goods categories", nameZh: "c_CodeLists — 国家代码、路线、货物类别", done: false },
      { name: "CN-code product list · 税则号", done: true },
      { name: "Route-of-production statement", nameZh: "生产工艺路线说明", done: true },
      { name: "Direct + indirect embedded emissions", nameZh: "直接+间接隐含排放", done: true },
      { name: "Verifier accreditation", nameZh: "核查机构认证", done: true },
      { name: "Purchased CBAM certificates (Q ledger)", nameZh: "已购 CBAM 证书（季度台账）", done: false },
      { name: "Installation-level emissions data", nameZh: "装置级排放数据", done: false },
    ],
  },
};

export const routePages = {
  loan: {
    slug: "loan" as const,
    label: "Loan", zh: "贷款", n: "06",
    title: "Green Loan Preview",
    titleZh: "绿色贷款预览",
    subtitle: "Deterministic rubric — passes are auditable line by line.",
    subtitleZh: "确定性评分规则 — 每项通过均可逐行审计。",
    kb: "PBOC 2025 Green Finance Catalogue",
    scoreLabel: "Loan risk tier",
    scoreValue: "Low-risk",
    scoreGrade: "B",
    gauge: 78,
    gapUnit: "risk pts",
    advisoryImpactUnit: "loan score",
    citations: "PBOC 2025 · IR (EU) 2025/2621 · Reg (EU) 2023/956",
  },
  grant: {
    slug: "grant" as const,
    label: "Grant", zh: "补贴", n: "07",
    title: "Green Factory Grant Preview",
    titleZh: "零碳工厂补贴预览",
    subtitle: "GB/T 36132 rubric — every point cites the specific clause.",
    subtitleZh: "GB/T 36132 评分 — 每项均引用具体条款。",
    kb: "GB/T 36132",
    scoreLabel: "Grant tier",
    scoreValue: "Tier 2 · 深绿",
    scoreGrade: "C",
    gauge: 68,
    gapUnit: "grant pts",
    advisoryImpactUnit: "grant score",
    citations: "GB/T 36132 · 工信部联节〔2026〕13号 · PBOC",
  },
  passport: {
    slug: "passport" as const,
    label: "EU license", zh: "碳护照", n: "05",
    title: "CBAM Readiness Preview",
    titleZh: "CBAM 就绪预览",
    subtitle: "Benchmark gap against Reg (EU) 2023/956 default values.",
    subtitleZh: "对照 Reg (EU) 2023/956 默认值的基准差距。",
    kb: "Reg (EU) 2023/956 benchmark gap",
    scoreLabel: "CBAM tier",
    scoreValue: "Exposed",
    scoreGrade: "C",
    gauge: 41,
    gapUnit: "€ / t exposure",
    advisoryImpactUnit: "€/t saved",
    citations: "Reg (EU) 2023/956 · IR (EU) 2025/2621 · CISA",
  },
};

export const advisoryCards = {
  loan: [
    { title: "Lift metering coverage 78% → 95%", impact: "+8", why: "PBOC tier weights measurement evidence 25%. Missing meters keep you in Tier 2 despite low-carbon inputs.", status: "Not yet — planned" },
    { title: "Add auditor attestation", impact: "+5", why: "Attested emissions unlock LPR −85bp under Quzhou 4-tier model.", status: "Not yet — planned" },
    { title: "Refinance existing loan into CERF", impact: "+12", why: "PBOC 碳减排支持工具 covers 60% principal at 1.75%.", status: "Implemented" },
  ],
  grant: [
    { title: "Raise scrap-steel ratio 24.5% → 40%", impact: "+9", why: "GB/T 36132 §5.2 — scrap ratio is the single largest lever in the grant rubric.", status: "Not yet — planned" },
    { title: "Sign green-electricity PPA 45% → 60%", impact: "+6", why: "Directly meets 工信部联节〔2026〕13号 renewable clause.", status: "Not yet — planned" },
    { title: "Close Melting-stage metering gap", impact: "+3", why: "Without stage-level data the auditor caps your score at Tier 2.", status: "Implemented" },
  ],
  passport: [
    { title: "Switch to Scrap-EAF for 18% of tonnes", impact: "€142/t saved", why: "Benchmark gap goes from +37% to −8% for reallocated tonnage — the only structural fix.", status: "Not yet — planned" },
    { title: "Diversify EU-bound tonnes → SEA anchor", impact: "€48/t exposure ↓", why: "Cuts CBAM-exposed share while retrofit lands.", status: "Not yet — planned" },
    { title: "Install 6× CT-clamp kWh meters", impact: "€22/t verified", why: "Replaces default values with measured data — sub-¥10k, weeks not months.", status: "Implemented" },
  ],
};

export const gaps = {
  loan:   [ "Metering coverage below Tier-1 floor (78% < 90%)", "Use-of-proceeds document missing" ],
  grant:  [ "Scrap-steel ratio 24.5% below GB/T 36132 §5.2 floor of 30%", "Third-party emissions report not attached" ],
  passport:[ "Route BF-BOF intensity +37% vs Reg 2023/956 benchmark", "Q4 CBAM certificate ledger not attached" ],
};

export const kpis = {
  intensity: 1.87,
  intensityDelta: -0.44,
  benchmarkGap: 36.5,
  cisaGrade: "C",
  financingTier: "深绿",
  cbam2026: 236_980,
  cbam2034: 9_489_100,
  netTariff: 38,
  grossTariff: 313,
  certPrice: 75.36,
  submissionsYtd: 12,
  tonnesCovered: 2930,
};

// Entry-flow router output (Section 5 in brief).
export const routerOutput = [
  { key: "grant",    label: "Grant 补贴",       conf: 0.88, preSelected: true,  reason: "Factory registration + metering coverage clear the entry gate." },
  { key: "loan",     label: "Loan 贷款",        conf: 0.72, preSelected: true,  reason: "Cash-flow signals and green-project intent detected." },
  { key: "passport", label: "EU license CBAM",  conf: 0.34, preSelected: false, reason: "No EU-bound tonnes declared this period." },
];
