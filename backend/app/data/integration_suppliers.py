"""Mock downstream SME registry for Baowu/Ansteel integration API demos.

Scope 1+2 values are illustrative — production would come from verified
Carbon Passport submissions (deterministic calculation engine output).
Feeds anchor-enterprise Scope 3 Category 10 (processing of sold products).
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SupplierEmissions:
    scope1_tco2e: float  # direct combustion + process
    scope2_tco2e: float  # purchased electricity (location-based)
    scope1_plus_2_tco2e: float
    intensity_tco2e_per_tonne: float
    production_route: str
    reporting_period: str
    verification_status: str  # verified | provisional | pending
    data_source: str


@dataclass(frozen=True)
class SupplierRecord:
    id: str
    company_name_zh: str
    company_name_en: str
    cn_code: str
    cisa_grade: str
    cbam_risk_tier: str
    annual_exposure_eur: float
    baowu_sourced_tonnes: float
    emissions: SupplierEmissions
    last_verified_at: str
    passport_id: str | None


SUPPLIERS: tuple[SupplierRecord, ...] = (
    SupplierRecord(
        id="SUP-014",
        company_name_zh="宁波恒峰精密紧固件有限公司",
        company_name_en="Ningbo Hengfeng Precision Fasteners",
        cn_code="7318 15 88",
        cisa_grade="C",
        cbam_risk_tier="Exposed",
        annual_exposure_eur=236_980,
        baowu_sourced_tonnes=1_240,
        emissions=SupplierEmissions(
            scope1_tco2e=7_820,
            scope2_tco2e=2_020,
            scope1_plus_2_tco2e=9_840,
            intensity_tco2e_per_tonne=1.87,
            production_route="BF-BOF",
            reporting_period="2025-01-01/2025-12-31",
            verification_status="verified",
            data_source="measured_installation_data",
        ),
        last_verified_at="2026-03-14",
        passport_id="CBP-2026-0417",
    ),
    SupplierRecord(
        id="SUP-009",
        company_name_zh="台州鑫瑞钢结构有限公司",
        company_name_en="Taizhou Xinrui Steel Structures",
        cn_code="7301",
        cisa_grade="D",
        cbam_risk_tier="High",
        annual_exposure_eur=412_150,
        baowu_sourced_tonnes=2_180,
        emissions=SupplierEmissions(
            scope1_tco2e=14_620,
            scope2_tco2e=3_800,
            scope1_plus_2_tco2e=18_420,
            intensity_tco2e_per_tonne=2.14,
            production_route="BF-BOF",
            reporting_period="2025-01-01/2025-12-31",
            verification_status="verified",
            data_source="china_default_with_metering_partial",
        ),
        last_verified_at="2026-03-11",
        passport_id="CBP-2026-0388",
    ),
    SupplierRecord(
        id="SUP-022",
        company_name_zh="温州振华轧钢有限公司",
        company_name_en="Wenzhou Zhenhua Rolled Steel",
        cn_code="7213/7214",
        cisa_grade="B",
        cbam_risk_tier="Low-risk",
        annual_exposure_eur=58_400,
        baowu_sourced_tonnes=980,
        emissions=SupplierEmissions(
            scope1_tco2e=4_710,
            scope2_tco2e=1_440,
            scope1_plus_2_tco2e=6_150,
            intensity_tco2e_per_tonne=1.42,
            production_route="SCRAP-EAF",
            reporting_period="2025-01-01/2025-12-31",
            verification_status="verified",
            data_source="measured_installation_data",
        ),
        last_verified_at="2026-03-12",
        passport_id="CBP-2026-0401",
    ),
    SupplierRecord(
        id="SUP-031",
        company_name_zh="嘉兴远大铁道器材有限公司",
        company_name_en="Jiaxing Yuanda Railway Materials",
        cn_code="7302",
        cisa_grade="C",
        cbam_risk_tier="Marginal",
        annual_exposure_eur=94_620,
        baowu_sourced_tonnes=1_050,
        emissions=SupplierEmissions(
            scope1_tco2e=6_180,
            scope2_tco2e=1_750,
            scope1_plus_2_tco2e=7_930,
            intensity_tco2e_per_tonne=1.68,
            production_route="BF-BOF",
            reporting_period="2025-01-01/2025-12-31",
            verification_status="provisional",
            data_source="china_default",
        ),
        last_verified_at="2026-03-08",
        passport_id="CBP-2026-0395",
    ),
    SupplierRecord(
        id="SUP-005",
        company_name_zh="绍兴金岛紧固件制造有限公司",
        company_name_en="Shaoxing Jindao Fastener Mfg",
        cn_code="7318 15 42",
        cisa_grade="A",
        cbam_risk_tier="Low-risk",
        annual_exposure_eur=21_050,
        baowu_sourced_tonnes=420,
        emissions=SupplierEmissions(
            scope1_tco2e=1_540,
            scope2_tco2e=770,
            scope1_plus_2_tco2e=2_310,
            intensity_tco2e_per_tonne=1.12,
            production_route="SCRAP-EAF",
            reporting_period="2025-01-01/2025-12-31",
            verification_status="verified",
            data_source="measured_installation_data",
        ),
        last_verified_at="2026-03-13",
        passport_id="CBP-2026-0412",
    ),
    SupplierRecord(
        id="SUP-018",
        company_name_zh="湖州盛达五金制品有限公司",
        company_name_en="Huzhou Shengda Hardware Products",
        cn_code="7326",
        cisa_grade="D",
        cbam_risk_tier="High",
        annual_exposure_eur=301_780,
        baowu_sourced_tonnes=1_680,
        emissions=SupplierEmissions(
            scope1_tco2e=11_420,
            scope2_tco2e=3_240,
            scope1_plus_2_tco2e=14_660,
            intensity_tco2e_per_tonne=2.02,
            production_route="BF-BOF",
            reporting_period="2025-01-01/2025-12-31",
            verification_status="verified",
            data_source="china_default_with_metering_partial",
        ),
        last_verified_at="2026-03-05",
        passport_id="CBP-2026-0371",
    ),
    SupplierRecord(
        id="SUP-027",
        company_name_zh="杭州瑞钢管业有限公司",
        company_name_en="Hangzhou Ruigang Tube Industries",
        cn_code="7208 10 00",
        cisa_grade="C",
        cbam_risk_tier="Marginal",
        annual_exposure_eur=118_300,
        baowu_sourced_tonnes=1_120,
        emissions=SupplierEmissions(
            scope1_tco2e=6_580,
            scope2_tco2e=2_140,
            scope1_plus_2_tco2e=8_720,
            intensity_tco2e_per_tonne=1.76,
            production_route="BF-BOF",
            reporting_period="2025-01-01/2025-12-31",
            verification_status="verified",
            data_source="measured_installation_data",
        ),
        last_verified_at="2026-03-10",
        passport_id="CBP-2026-0405",
    ),
    SupplierRecord(
        id="SUP-011",
        company_name_zh="宁波兴业型钢有限公司",
        company_name_en="Ningbo Xingye Sections Steel",
        cn_code="7207",
        cisa_grade="E",
        cbam_risk_tier="High",
        annual_exposure_eur=587_920,
        baowu_sourced_tonnes=3_420,
        emissions=SupplierEmissions(
            scope1_tco2e=19_840,
            scope2_tco2e=5_070,
            scope1_plus_2_tco2e=24_910,
            intensity_tco2e_per_tonne=2.31,
            production_route="BF-BOF",
            reporting_period="2025-01-01/2025-12-31",
            verification_status="verified",
            data_source="china_default",
        ),
        last_verified_at="2026-02-27",
        passport_id="CBP-2026-0359",
    ),
)

SCOPE3_MONTHLY_TREND = [
    {"month": "2025-04", "scope3_category_10_tco2e": 121_300},
    {"month": "2025-05", "scope3_category_10_tco2e": 117_800},
    {"month": "2025-06", "scope3_category_10_tco2e": 122_900},
    {"month": "2025-07", "scope3_category_10_tco2e": 119_400},
    {"month": "2025-08", "scope3_category_10_tco2e": 113_200},
    {"month": "2025-09", "scope3_category_10_tco2e": 116_800},
    {"month": "2025-10", "scope3_category_10_tco2e": 110_500},
    {"month": "2025-11", "scope3_category_10_tco2e": 104_900},
    {"month": "2025-12", "scope3_category_10_tco2e": 108_700},
    {"month": "2026-01", "scope3_category_10_tco2e": 99_800},
    {"month": "2026-02", "scope3_category_10_tco2e": 95_400},
    {"month": "2026-03", "scope3_category_10_tco2e": 92_940},
]


def portfolio_summary() -> dict:
    total_s3 = sum(s.emissions.scope1_plus_2_tco2e for s in SUPPLIERS)
    verified = sum(1 for s in SUPPLIERS if s.emissions.verification_status == "verified")
    return {
        "anchor_enterprise": "Baowu / Ansteel (demo tenant)",
        "reporting_standard": "GHG Protocol Scope 3 · Category 10",
        "supplier_count": len(SUPPLIERS),
        "verified_supplier_count": verified,
        "total_scope3_category_10_tco2e": total_s3,
        "total_baowu_sourced_tonnes": sum(s.baowu_sourced_tonnes for s in SUPPLIERS),
        "total_cbam_exposure_eur": sum(s.annual_exposure_eur for s in SUPPLIERS),
        "data_residency": "cn-beijing",
        "last_aggregated_at": "2026-03-14T09:41:00+08:00",
    }


def supplier_to_dict(s: SupplierRecord, *, include_emissions: bool = True) -> dict:
    row = {
        "id": s.id,
        "company_name_zh": s.company_name_zh,
        "company_name_en": s.company_name_en,
        "cn_code": s.cn_code,
        "cisa_grade": s.cisa_grade,
        "cbam_risk_tier": s.cbam_risk_tier,
        "annual_exposure_eur": s.annual_exposure_eur,
        "baowu_sourced_tonnes": s.baowu_sourced_tonnes,
        "last_verified_at": s.last_verified_at,
        "passport_id": s.passport_id,
    }
    if include_emissions:
        e = s.emissions
        row["emissions"] = {
            "scope1_tco2e": e.scope1_tco2e,
            "scope2_tco2e": e.scope2_tco2e,
            "scope1_plus_2_tco2e": e.scope1_plus_2_tco2e,
            "intensity_tco2e_per_tonne": e.intensity_tco2e_per_tonne,
            "production_route": e.production_route,
            "reporting_period": e.reporting_period,
            "verification_status": e.verification_status,
            "data_source": e.data_source,
        }
    return row
