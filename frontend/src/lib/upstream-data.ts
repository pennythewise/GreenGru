// Demo data for the Baowu account-manager ("Upstream") dashboard.
// Illustrative only. Shape mirrors backend/app/schemas.py's BaowuDashboardRow
// (cisa_grade, cbam_risk_tier, annual_exposure_eur) plus a company display
// name — real data would need the baowu_dashboard_role DB grant extended to
// expose that column (see PRD §10 / migration 0001_init.sql), not done yet.

export type CisaGrade = "A" | "B" | "C" | "D" | "E";
export type CbamRiskTier = "Low-risk" | "Marginal" | "Exposed" | "High";
export type Trend = "up" | "down" | "flat";

export type SupplierRow = {
  id: string;
  companyNameZh: string;
  companyNameEn: string;
  cnCode: string;
  cisaGrade: CisaGrade;
  cbamRiskTier: CbamRiskTier;
  annualExposureEur: number;
  // Verified production emissions on Baowu-sourced volume — the number that
  // feeds Baowu's Scope 3 Category 10 (processing of sold products) inventory.
  // Distinct from annualExposureEur (CBAM tariff €, EU-export-scoped only).
  verifiedEmissionsTco2e: number;
  trend: Trend;
  lastVerifiedAt: string;
};

export const suppliers: SupplierRow[] = [
  { id: "SUP-014", companyNameZh: "宁波恒峰精密紧固件有限公司", companyNameEn: "Ningbo Hengfeng Precision Fasteners", cnCode: "7318 15 88", cisaGrade: "C", cbamRiskTier: "Exposed",  annualExposureEur: 236_980, verifiedEmissionsTco2e: 9_840, trend: "down", lastVerifiedAt: "2026-03-14" },
  { id: "SUP-009", companyNameZh: "台州鑫瑞钢结构有限公司",     companyNameEn: "Taizhou Xinrui Steel Structures",     cnCode: "7301",        cisaGrade: "D", cbamRiskTier: "High",     annualExposureEur: 412_150, verifiedEmissionsTco2e: 18_420, trend: "up",   lastVerifiedAt: "2026-03-11" },
  { id: "SUP-022", companyNameZh: "温州振华轧钢有限公司",       companyNameEn: "Wenzhou Zhenhua Rolled Steel",        cnCode: "7213/7214",  cisaGrade: "B", cbamRiskTier: "Low-risk", annualExposureEur: 58_400, verifiedEmissionsTco2e: 6_150,  trend: "flat", lastVerifiedAt: "2026-03-12" },
  { id: "SUP-031", companyNameZh: "嘉兴远大铁道器材有限公司",   companyNameEn: "Jiaxing Yuanda Railway Materials",    cnCode: "7302",        cisaGrade: "C", cbamRiskTier: "Marginal", annualExposureEur: 94_620, verifiedEmissionsTco2e: 7_930,  trend: "flat", lastVerifiedAt: "2026-03-08" },
  { id: "SUP-005", companyNameZh: "绍兴金岛紧固件制造有限公司", companyNameEn: "Shaoxing Jindao Fastener Mfg",        cnCode: "7318 15 42", cisaGrade: "A", cbamRiskTier: "Low-risk", annualExposureEur: 21_050, verifiedEmissionsTco2e: 2_310,  trend: "down", lastVerifiedAt: "2026-03-13" },
  { id: "SUP-018", companyNameZh: "湖州盛达五金制品有限公司",   companyNameEn: "Huzhou Shengda Hardware Products",    cnCode: "7326",        cisaGrade: "D", cbamRiskTier: "High",     annualExposureEur: 301_780, verifiedEmissionsTco2e: 14_660, trend: "up",   lastVerifiedAt: "2026-03-05" },
  { id: "SUP-027", companyNameZh: "杭州瑞钢管业有限公司",       companyNameEn: "Hangzhou Ruigang Tube Industries",    cnCode: "7208 10 00", cisaGrade: "C", cbamRiskTier: "Marginal", annualExposureEur: 118_300, verifiedEmissionsTco2e: 8_720, trend: "down", lastVerifiedAt: "2026-03-10" },
  { id: "SUP-011", companyNameZh: "宁波兴业型钢有限公司",       companyNameEn: "Ningbo Xingye Sections Steel",        cnCode: "7207",        cisaGrade: "E", cbamRiskTier: "High",     annualExposureEur: 587_920, verifiedEmissionsTco2e: 24_910, trend: "up",   lastVerifiedAt: "2026-02-27" },
];

const gradeRank: Record<CisaGrade, number> = { A: 5, B: 4, C: 3, D: 2, E: 1 };

export const portfolioSummary = {
  totalSuppliers: suppliers.length,
  compliantPct: Math.round(
    (suppliers.filter((s) => gradeRank[s.cisaGrade] >= gradeRank.B).length / suppliers.length) * 100,
  ),
  totalExposureEur: suppliers.reduce((sum, s) => sum + s.annualExposureEur, 0),
  totalScope3Tco2e: suppliers.reduce((sum, s) => sum + s.verifiedEmissionsTco2e, 0),
  watchlistCount: suppliers.filter((s) => gradeRank[s.cisaGrade] <= gradeRank.D || s.trend === "up").length,
};

// Portfolio-level verified Scope 3 Category 10 emissions by month (tCO2e/yr,
// annualized) — ends at the current portfolioSummary.totalScope3Tco2e.
// Overall downward drift as supplier grades improve, with natural monthly
// noise (production seasonality, order cycles) rather than a smooth decline.
export const scope3Trend = [
  { month: "Apr", tco2e: 121_300 },
  { month: "May", tco2e: 117_800 },
  { month: "Jun", tco2e: 122_900 },
  { month: "Jul", tco2e: 119_400 },
  { month: "Aug", tco2e: 113_200 },
  { month: "Sep", tco2e: 116_800 },
  { month: "Oct", tco2e: 110_500 },
  { month: "Nov", tco2e: 104_900 },
  { month: "Dec", tco2e: 108_700 },
  { month: "Jan", tco2e: 99_800 },
  { month: "Feb", tco2e: 95_400 },
  { month: "Mar", tco2e: 92_940 },
];

// Daily verified Scope 3 run-rate (tCO2e/yr, annualized), Apr 2025 – Mar 2026.
// Deterministically generated: interpolates the monthly anchors above, plus a
// weekly production cycle and stable pseudo-noise — no Math.random(), so SSR
// and client render identical values.
export type Scope3DailyPoint = { date: string; month: string; day: number; tco2e: number };

export const scope3Daily: Scope3DailyPoint[] = (() => {
  const out: Scope3DailyPoint[] = [];
  const start = Date.UTC(2025, 3, 1); // Apr 1 2025
  const end = Date.UTC(2026, 2, 31);  // Mar 31 2026
  for (let ts = start, i = 0; ts <= end; ts += 86_400_000, i++) {
    const d = new Date(ts);
    const monthIdx = (d.getUTCMonth() + 9) % 12; // Apr=0 … Mar=11, matches scope3Trend order
    const frac = (d.getUTCDate() - 1) / 30;
    const anchor = scope3Trend[monthIdx].tco2e;
    const next = scope3Trend[Math.min(monthIdx + 1, 11)].tco2e;
    const base = anchor + (next - anchor) * frac;
    const weekly = 1400 * Math.sin(((d.getUTCDay() + 1) / 7) * Math.PI * 2);
    const noise = 900 * Math.sin(i * 12.9898) + 600 * Math.sin(i * 4.1414 + 2);
    out.push({
      date: d.toISOString().slice(0, 10),
      month: scope3Trend[monthIdx].month,
      day: d.getUTCDate(),
      tco2e: Math.round(base + weekly + noise),
    });
  }
  return out;
})();

export const gradeDistribution = (["A", "B", "C", "D", "E"] as const).map((grade) => ({
  key: grade,
  label: `Grade ${grade}`,
  value: suppliers.filter((s) => s.cisaGrade === grade).length,
  color:
    grade === "A" || grade === "B" ? "var(--color-carbon)"
    : grade === "C" ? "var(--color-gold)"
    : grade === "D" ? "var(--color-warning)"
    : "var(--color-danger)",
})).filter((g) => g.value > 0);

export const watchlist = suppliers
  .filter((s) => gradeRank[s.cisaGrade] <= gradeRank.D || s.trend === "up")
  .map((s) => ({
    id: s.id,
    companyNameZh: s.companyNameZh,
    companyNameEn: s.companyNameEn,
    reason:
      s.cisaGrade === "E" ? "Grade at floor (E) — highest exposure tier"
      : s.trend === "up" ? `Exposure trending up · currently grade ${s.cisaGrade}`
      : `Below Tier-1 floor · currently grade ${s.cisaGrade}`,
  }));
