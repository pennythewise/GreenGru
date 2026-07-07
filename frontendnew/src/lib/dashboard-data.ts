// Demo data for the Carbon Passport MVP flow.
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

export const cbamPhaseIn = [
  { year: 2026, factor: 2.5, costPerT: 7.8, cum: 7.8 },
  { year: 2027, factor: 5, costPerT: 15.7, cum: 23.5 },
  { year: 2028, factor: 10, costPerT: 31.3, cum: 54.8 },
  { year: 2029, factor: 22.5, costPerT: 70.4, cum: 125.2 },
  { year: 2030, factor: 48.5, costPerT: 151.8, cum: 277.0 },
  { year: 2031, factor: 61, costPerT: 190.9, cum: 467.9 },
  { year: 2032, factor: 73.5, costPerT: 230.0, cum: 697.9 },
  { year: 2033, factor: 86, costPerT: 269.2, cum: 967.1 },
  { year: 2034, factor: 100, costPerT: 313.0, cum: 1280.1 },
];

export const intensityTrend = [
  { m: "Sep", measured: 2.31, benchmark: 1.37, default: 3.51 },
  { m: "Oct", measured: 2.24, benchmark: 1.37, default: 3.51 },
  { m: "Nov", measured: 2.18, benchmark: 1.37, default: 3.51 },
  { m: "Dec", measured: 2.09, benchmark: 1.37, default: 3.51 },
  { m: "Jan", measured: 1.98, benchmark: 1.37, default: 3.51 },
  { m: "Feb", measured: 1.94, benchmark: 1.37, default: 3.51 },
  { m: "Mar", measured: 1.87, benchmark: 1.37, default: 3.51 },
];

export const cisaGrades = [
  { grade: "E", label: "Baseline", max: 2.5, color: "danger" as const },
  { grade: "D", label: "Entry", max: 2.1, color: "warning" as const },
  { grade: "C", label: "Improved", max: 1.75, color: "warning" as const },
  { grade: "B", label: "Advanced", max: 1.35, color: "carbon" as const },
  { grade: "A", label: "Near-zero", max: 0.4, color: "carbon" as const },
];

export const submissions = [
  { id: "S-0417", cn: "7318 15 88", desc: "Hex bolt M12", tons: 1240, cbamTier: "Exposed", grade: "C", status: "Signed", date: "2026-03-14" },
  { id: "S-0416", cn: "7318 15 42", desc: "Screw M8", tons: 860, cbamTier: "Exposed", grade: "C", status: "Signed", date: "2026-03-09" },
  { id: "S-0415", cn: "7326", desc: "Steel bracket", tons: 520, cbamTier: "High", grade: "D", status: "Needs input", date: "2026-03-05" },
  { id: "S-0414", cn: "7301", desc: "Welded angle", tons: 310, cbamTier: "High", grade: "D", status: "Signed", date: "2026-02-27" },
  { id: "S-0413", cn: "7302", desc: "Rail track material", tons: 145, cbamTier: "Marginal", grade: "C", status: "Signed", date: "2026-02-20" },
  { id: "S-0412", cn: "7213", desc: "Hot-rolled wire rod", tons: 90, cbamTier: "De minimis?", grade: "C", status: "Signed", date: "2026-02-11" },
];

export const products = submissions.slice(0, 4).map((s) => ({
  cn: s.cn, desc: s.desc, tons: s.tons, intensity: s.grade === "C" ? 1.87 : 2.08, grade: s.grade,
  cbam2026: Math.round(s.tons * 78), cbam2034: Math.round(s.tons * 3123),
}));

export const paths = [
  { id: "P1", name: "Lightweight digital monitoring", zh: "数字监测", tag: "quick win",
    cost: 8000, saving: 0, costPerT: 0, payback: 0.3,
    detail: "Deploy 6 CT-clamp kWh meters on shopfloor mains; closes measurement gap so verified data replaces defaults. Sub-¥10k, weeks not months.",
    status: "recommended", range: "¥1,000–¥10,000 · closes measurement gap" },
  { id: "P2", name: "Market diversification", zh: "市场分散", tag: "moderate",
    cost: 480_000, saving: 1180, costPerT: 407, payback: 2.1,
    detail: "Rebalance 18% of EU-bound tonnes to SEA + domestic anchor buyers; reduces EU exposure share while renewable PPA lands.",
    status: "eligible", range: "moderate cost · reduces EU exposure share" },
  { id: "P3", name: "Heavy retrofit — scrap-EAF route", zh: "短流程改造", tag: "structural",
    cost: 41_000_000, saving: 3900, costPerT: 10513, payback: 9.2,
    detail: "Full route switch to scrap-EAF; benchmark gap goes from +37% to −8%. Only if the lighter paths cannot close the gap.",
    status: "future", range: "¥100,000+ · full route change" },
];

export const financing = [
  { name: "PBOC 碳减排支持工具 (CERF)", tier: "深绿", rate: "1.75%", ceiling: "¥60M", pass: true, citation: "PBOC 2026-01-26 press briefing", note: "Jan 2026 expansion covers 节能改造 + 绿色升级" },
  { name: "衢州碳账户金融 · 优质档", tier: "深绿", rate: "LPR −85bp", ceiling: "1.5× base", pass: true, citation: "Quzhou 4-tier carbon-account model", note: "Top tier · deep-green" },
  { name: "零碳工厂 国家级奖补", tier: "—", rate: "grant", ceiling: "¥2.0M", pass: true, citation: "工信部联节〔2026〕13号", note: "National zero-carbon-factory subsidy" },
  { name: "浙江省绿色低碳转型贴息", tier: "—", rate: "grant", ceiling: "¥1.0M", pass: false, citation: "浙经信节能〔2025〕42号", note: "Requires provincial 零碳工厂 certification (in-progress)" },
];

export const kpis = {
  intensity: 1.87,
  intensityDelta: -0.44,
  benchmarkGap: 36.5,
  cisaGrade: "C",
  financingTier: "深绿",
  cbam2026: 236_980,
  cbam2034: 9_489_100,
  netTariff: 38,      // €/t this year
  grossTariff: 313,   // €/t 2034
  certPrice: 75.36,   // Q1 2026
  submissionsYtd: 12,
  tonnesCovered: 2930,
};

export const pipelineStages = [
  { n: 1, key: "Intake", zh: "接入", model: "qwen3-vl-flash · vision", status: "done", elapsed: "812 ms" },
  { n: 2, key: "Validate", zh: "校验", model: "deterministic · plausibility", status: "done", elapsed: "38 ms" },
  { n: 3, key: "Classify", zh: "分类", model: "qwen-flash · CN 7318 15 88", status: "active", elapsed: "1.2 s" },
  { n: 4, key: "Calculate", zh: "计算", model: "python · CBAM + intensity", status: "pending", elapsed: null },
  { n: 5, key: "Score", zh: "评分", model: "rule-based · CISA + benchmark", status: "pending", elapsed: null },
  { n: 6, key: "Generate docs", zh: "生成文件", model: "qwen-plus · EN/中文", status: "pending", elapsed: null },
];

export const passportFields = {
  exporter: { name: company.nameEn, nameZh: company.name, id: company.registration, addr: company.location },
  cn: "7318 15 88",
  route: "BF-BOF (integrated)",
  tonnage: 1240,
  intensity: 1.87,
  intensitySource: "Measured — installer-certified CT clamps + invoice recon (12 mo)",
  taxable: 1240 * 1.87,
  certQuarter: "Q1 2026",
  certPrice: 75.36,
  net: 38,
  gross: 313,
  phaseIn: 2.5,
  hash: "sha256:9b2c…f14e",
};

export const confirmCase = {
  reason: "Classifier confidence 61% on Flash pass; hint disagrees.",
  hint: { cn: "7318 15 88", label: "Hex bolt, tensile ≥ 800 MPa", conf: null },
  classifier: { cn: "7318 15 42", label: "Screw, wood/self-tapping", conf: 0.61 },
  invoiceExcerpt: "M12×80 六角螺栓 · 高强度 8.8级 · 数量 12,400pcs",
};

export const partnerSuppliers = [
  { name: "Supplier · Ningbo 001", grade: "B", tier: "深绿", exposure: 1420 },
  { name: "Supplier · Suzhou 044", grade: "C", tier: "浅绿", exposure: 2930 },
  { name: "Supplier · Tangshan 118", grade: "D", tier: "黄", exposure: 4720 },
  { name: "Supplier · Foshan 087", grade: "A", tier: "深绿", exposure: 610 },
  { name: "Supplier · Handan 209", grade: "D", tier: "红", exposure: 5810 },
  { name: "Supplier · Anshan 012", grade: "B", tier: "深绿", exposure: 1180 },
];
