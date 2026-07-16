"""GB/T 36132—2025 绿色工厂评价通则 — deterministic grant scorer.

Scores use the five primary indicators from Table C.1 (illustrative steel
downstream weights) and §5.2 linear proportion between benchmark and leading
values. LLM never produces these numbers.

Guideline: 绿色工厂评价通则 (GB/T 36132—2025), replacing GB/T 36132—2018.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass
class IndicatorScore:
    seq: int
    name_en: str
    name_zh: str
    indicator_type: str  # forward_quant | inverse_quant | forward_qual
    unit: str
    weight_points: int
    score: float
    actual: float | str | None
    leading: float | str | None
    benchmark: float | str | None
    formula_ref: str | None
    data_source: str
    explanation_en: str
    explanation_zh: str


@dataclass
class DimensionScore:
    key: str
    name_en: str
    name_zh: str
    weight_pct: int
    score: float
    max_score: float
    indicators: list[IndicatorScore]


@dataclass
class VetoItem:
    key: str
    label_en: str
    label_zh: str
    passed: bool
    source: str


@dataclass
class GreenFactoryScoreResult:
    standard: str
    standard_zh: str
    guideline_doc: str
    total_score: float
    max_score: float
    qualified: bool
    veto_passed: bool
    veto_items: list[VetoItem]
    dimensions: list[DimensionScore]
    tier_label: str
    tier_label_zh: str
    formulas: list[dict]
    summary_en: str
    summary_zh: str


def _linear_points(
    actual: float,
    *,
    leading: float,
    benchmark: float,
    weight_points: int,
    higher_is_better: bool,
) -> float:
    """GB/T 36132 §5.2 — full marks at leading, zero at/beyond benchmark."""
    if higher_is_better:
        if actual >= leading:
            return float(weight_points)
        if actual <= benchmark:
            return 0.0
        span = leading - benchmark
        if span <= 0:
            return 0.0
        return round(weight_points * (actual - benchmark) / span, 2)
    if actual <= leading:
        return float(weight_points)
    if actual >= benchmark:
        return 0.0
    span = benchmark - leading
    if span <= 0:
        return 0.0
    return round(weight_points * (benchmark - actual) / span, 2)


def _avg_metering_pct(process_matrix: list[dict] | None) -> float:
    if not process_matrix:
        return 78.0
    ok = warn = bad = 0
    for row in process_matrix:
        m = str(row.get("metering", "")).lower()
        if m == "ok":
            ok += 1
        elif m == "warn":
            warn += 1
        else:
            bad += 1
    n = len(process_matrix) or 1
    return round((ok * 95 + warn * 78 + bad * 62) / n, 1)


def compute_green_factory_score(
    *,
    scrap_ratio_pct: float = 24.5,
    green_electricity_pct: float = 45.0,
    intensity_tco2e_per_t: float = 3.506,
    metering_pct: float | None = None,
    water_reuse_pct: float = 62.0,
    solid_waste_util_pct: float = 72.0,
    production_tonnes: float | None = None,
    checklist: list[dict] | None = None,
    application_form: dict | None = None,
    self_evaluation: dict | None = None,
) -> GreenFactoryScoreResult:
    """Score factory against GB/T 36132—2025 using submission + form + docs."""
    checklist = checklist or []
    application_form = application_form or {}
    self_evaluation = self_evaluation or {}

    done_docs = {c.get("name", ""): bool(c.get("done")) for c in checklist}
    has_metering_doc = done_docs.get("Metering coverage report", False)
    has_scrap_doc = done_docs.get("Scrap-steel ratio evidence", False)
    has_green_elec_doc = done_docs.get("Green-electricity PPA / green cert", False)
    has_emissions_doc = done_docs.get("Third-party emissions report (12 mo)", False)
    has_factory_reg = done_docs.get("Factory registration · 工厂登记", False)

    veto_form = application_form.get("basic_veto_requirements") or {}
    veto_items = [
        VetoItem(
            "registered",
            "Registered China manufacturing (GB/T 4754)",
            "在中国境内注册且属制造业",
            has_factory_reg or bool(veto_form.get("registered_in_china_manufacturing_gb_t4754")),
            "checklist + application form",
        ),
        VetoItem(
            "qms",
            "QMS GB/T 19001",
            "质量管理体系 GB/T 19001",
            bool(veto_form.get("qms_gb_t19001_in_place")),
            "application form",
        ),
        VetoItem(
            "ohsms",
            "OHSMS GB/T 45001",
            "职业健康安全管理体系",
            bool(veto_form.get("ohsms_gb_t45001_28001_in_place")),
            "application form",
        ),
        VetoItem(
            "ems",
            "EMS GB/T 24001",
            "环境管理体系 GB/T 24001",
            bool(veto_form.get("ems_gb_t24001_in_place")),
            "application form",
        ),
        VetoItem(
            "energy_mgmt",
            "Energy mgmt GB/T 23331",
            "能源管理体系 GB/T 23331",
            bool(veto_form.get("energy_mgmt_system_gb_t23331_in_place")),
            "application form",
        ),
        VetoItem(
            "no_phased_out",
            "No phased-out / banned equipment",
            "无淘汰/禁止工艺设备",
            bool(veto_form.get("no_phased_out_banned_tech_process_equipment")),
            "application form",
        ),
        VetoItem(
            "emissions_permit",
            "Emissions comply with permit",
            "排放符合许可及管控要求",
            bool(veto_form.get("emissions_comply_with_control_and_permit_requirements")),
            "application form",
        ),
        VetoItem(
            "no_major_incident",
            "No major environmental incident (3 yrs)",
            "近三年无重大环境事件",
            bool(veto_form.get("no_major_environmental_incident_past_3yrs")),
            "application form",
        ),
    ]
    veto_passed = all(v.passed for v in veto_items)

    m_pct = metering_pct if metering_pct is not None else _avg_metering_pct(
        application_form.get("_process_matrix")
    )
    if has_metering_doc:
        m_pct = min(95.0, m_pct + 4.0)
    scrap = scrap_ratio_pct
    if has_scrap_doc:
        scrap = min(100.0, scrap + 2.0)
    green = green_electricity_pct
    if has_green_elec_doc:
        green = min(100.0, green + 5.0)
    intensity = intensity_tco2e_per_t
    if has_emissions_doc:
        intensity = max(1.2, intensity * 0.97)

    # Table C.1 illustrative weights (total 100 pts across 14 indicators)
    indicators_energy: list[IndicatorScore] = [
        IndicatorScore(
            1,
            "Energy consumption intensity",
            "能源消耗强度",
            "inverse_quant",
            "tce/t or tce/万元",
            8,
            _linear_points(intensity, leading=2.2, benchmark=3.9, weight_points=8, higher_is_better=False),
            round(intensity, 3),
            2.2,
            3.9,
            "B.1",
            "dashboard snapshot · new submission",
            "Unit product energy intensity vs industry leading (§4.3.1, Table C.1 #1).",
            "单位产品综合能耗与行业引领值对标（通则 §4.3.1，表 C.1 序号 1）。",
        ),
        IndicatorScore(
            2,
            "Carbon emission intensity",
            "碳排放强度",
            "inverse_quant",
            "tCO₂/t",
            8,
            _linear_points(intensity, leading=2.0, benchmark=3.7, weight_points=8, higher_is_better=False),
            round(intensity, 3),
            2.0,
            3.7,
            "B.3",
            "dashboard snapshot · CISA engine",
            "Unit product CO₂ per GB/T 32150 boundary aligned with energy scope (Table C.1 #2).",
            "单位产品二氧化碳排放量，核算边界与能耗一致（通则附录 B.3，表 C.1 序号 2）。",
        ),
        IndicatorScore(
            3,
            "Renewable energy utilization",
            "可再生能源利用率",
            "forward_quant",
            "%",
            8,
            _linear_points(green, leading=55.0, benchmark=18.0, weight_points=8, higher_is_better=True),
            round(green, 1),
            55.0,
            18.0,
            "B.5",
            "dashboard levers + green PPA doc",
            "Renewable share per Eq. (B.5); green certificate / PPA uploads add evidence.",
            "可再生能源利用率按式 B.5 计算；绿电合同/证书上传佐证。",
        ),
        IndicatorScore(
            4,
            "Energy-carbon management platform",
            "能碳管理系统平台",
            "forward_quant",
            "functions",
            6,
            _linear_points(m_pct / 10.0, leading=9.5, benchmark=6.0, weight_points=6, higher_is_better=True),
            round(m_pct / 10.0, 1),
            9.5,
            6.0,
            "—",
            "process matrix metering + metering report",
            "Proxy: stage metering coverage maps to platform function compliance (Table C.1 #4).",
            "以工序计量覆盖率映射能碳平台功能符合度（表 C.1 序号 4，工信厅节〔2025〕13 号）。",
        ),
    ]

    indicators_resource: list[IndicatorScore] = [
        IndicatorScore(
            5,
            "Raw material consumption intensity",
            "原材料消耗强度",
            "inverse_quant",
            "t scrap/t product",
            8,
            _linear_points(100 - scrap, leading=52.0, benchmark=78.0, weight_points=8, higher_is_better=False),
            round(100 - scrap, 1),
            52.0,
            78.0,
            "B.6",
            "scrap ratio lever + evidence doc",
            "Scrap-steel ratio inversely proxies virgin material intensity (Table C.1 #5).",
            "废钢比反向映射原生料消耗强度（表 C.1 序号 5，附录 B.6）。",
        ),
        IndicatorScore(
            6,
            "Water withdrawal intensity",
            "取水强度",
            "inverse_quant",
            "m³/t",
            8,
            _linear_points(4.2, leading=2.5, benchmark=6.0, weight_points=8, higher_is_better=False),
            4.2,
            2.5,
            6.0,
            "B.8",
            "default SME benchmark",
            "Illustrative withdrawal intensity until utility invoices parsed (Table C.1 #6).",
            "取水强度示例值，待水电发票结构化后替换（表 C.1 序号 6）。",
        ),
        IndicatorScore(
            7,
            "Industrial water reuse rate",
            "工业用水重复利用率",
            "forward_quant",
            "%",
            8,
            _linear_points(water_reuse_pct, leading=85.0, benchmark=55.0, weight_points=8, higher_is_better=True),
            round(water_reuse_pct, 1),
            85.0,
            55.0,
            "B.10",
            "default SME benchmark",
            "Water reuse per Eq. (B.10) (Table C.1 #7).",
            "工业用水重复利用率按式 B.10（表 C.1 序号 7）。",
        ),
        IndicatorScore(
            8,
            "Solid waste comprehensive utilization",
            "一般工业固废综合利用率",
            "forward_quant",
            "%",
            6,
            _linear_points(solid_waste_util_pct, leading=92.0, benchmark=65.0, weight_points=6, higher_is_better=True),
            round(solid_waste_util_pct, 1),
            92.0,
            65.0,
            "B.11",
            "default SME benchmark",
            "Solid waste utilization per Eq. (B.11) (Table C.1 #8).",
            "一般工业固废综合利用率按式 B.11（表 C.1 序号 8）。",
        ),
    ]

    process_upgrade_pct = 3.5 if has_green_elec_doc else 2.0
    indicators_clean: list[IndicatorScore] = [
        IndicatorScore(
            9,
            "Process & equipment advancement",
            "生产工艺和设备先进性",
            "forward_qual",
            "—",
            6,
            4.0 if has_scrap_doc and has_green_elec_doc else 2.5 if has_scrap_doc or has_green_elec_doc else 1.0,
            "evidence" if has_scrap_doc else "partial",
            "national catalogue",
            "—",
            "—",
            "uploaded green-tech evidence",
            "Qualitative: encouraged energy/water saving tech per §4.3.3 (Table C.1 #9).",
            "定性：节能节水等先进工艺设备证明材料（§4.3.3，表 C.1 序号 9）。",
        ),
        IndicatorScore(
            10,
            "Green retrofit investment share",
            "绿色低碳改造升级投资占比",
            "forward_quant",
            "%",
            4,
            _linear_points(process_upgrade_pct, leading=5.0, benchmark=1.0, weight_points=4, higher_is_better=True),
            process_upgrade_pct,
            5.0,
            1.0,
            "—",
            "doc checklist proxy",
            "3-year green CAPEX share proxy from uploaded project docs (Table C.1 #10).",
            "近三年绿色低碳改造投资占比代理（表 C.1 序号 10）。",
        ),
        IndicatorScore(
            11,
            "Pollutant emission intensity",
            "主要污染物排放强度",
            "inverse_quant",
            "index",
            6,
            _linear_points(intensity * 0.35, leading=0.45, benchmark=1.2, weight_points=6, higher_is_better=False),
            round(intensity * 0.35, 3),
            0.45,
            1.2,
            "B.20–B.23",
            "intensity-derived proxy",
            "Pollutant intensity proxy scaled from carbon intensity (Table C.1 #11).",
            "以碳强度比例估算污染物排放强度（表 C.1 序号 11）。",
        ),
    ]

    product_green_score = 5.0 if has_emissions_doc else 3.5
    indicators_product: list[IndicatorScore] = [
        IndicatorScore(
            12,
            "Green design",
            "绿色设计",
            "forward_qual",
            "—",
            8,
            min(8.0, product_green_score + (2.0 if has_emissions_doc else 0)),
            "GB/T 24256" if has_emissions_doc else "planned",
            "required",
            "—",
            "—",
            "emissions report + form",
            "Product eco-design per GB/T 24256 (Table C.1 #12).",
            "产品生态设计（GB/T 24256，表 C.1 序号 12）。",
        ),
        IndicatorScore(
            13,
            "Product carbon footprint",
            "产品碳足迹",
            "forward_qual",
            "—",
            8,
            5.0 if has_emissions_doc else 3.0,
            "quantified" if has_emissions_doc else "not yet",
            "GB/T 24067",
            "—",
            "—",
            "third-party emissions report",
            "Carbon footprint quantification per GB/T 24067 (Table C.1 #13).",
            "产品碳足迹量化（GB/T 24067，表 C.1 序号 13）。",
        ),
    ]

    indicators_land: list[IndicatorScore] = [
        IndicatorScore(
            14,
            "Land output rate",
            "土地产出率",
            "forward_quant",
            "万元/m²",
            8,
            _linear_points(
                0.42 if production_tonnes and production_tonnes > 500 else 0.35,
                leading=0.55,
                benchmark=0.22,
                weight_points=8,
                higher_is_better=True,
            ),
            0.42 if production_tonnes and production_tonnes > 500 else 0.35,
            0.55,
            0.22,
            "B.24–B.26",
            "production volume proxy",
            "Land productivity per Eq. (B.24) (Table C.1 #14).",
            "单位用地面积产出率按附录 B.24（表 C.1 序号 14）。",
        ),
    ]

    dimensions = [
        DimensionScore("energy", "Energy decarbonization", "能源低碳化", 30, 0, 30, indicators_energy),
        DimensionScore("resource", "Resource efficiency", "资源高效化", 30, 0, 30, indicators_resource),
        DimensionScore("clean", "Clean production", "生产洁净化", 16, 0, 16, indicators_clean),
        DimensionScore("product", "Green product", "产品绿色化", 16, 0, 16, indicators_product),
        DimensionScore("land", "Land intensification", "用地集约化", 8, 0, 8, indicators_land),
    ]

    # Blend self-evaluation from grant application form if provided
    se = self_evaluation
    se_map = {
        "energy": se.get("energy_resource_input"),
        "resource": se.get("energy_resource_input"),
        "clean": se.get("environmental_emissions"),
        "product": se.get("product"),
        "land": se.get("infrastructure"),
    }

    for dim in dimensions:
        computed = sum(i.score for i in dim.indicators)
        se_entry = se_map.get(dim.key)
        if isinstance(se_entry, dict) and se_entry.get("self_score") is not None:
            self_pct = float(se_entry["self_score"]) / 100.0
            self_pts = round(dim.max_score * self_pct, 2)
            dim.score = round(computed * 0.65 + self_pts * 0.35, 2)
        else:
            dim.score = round(computed, 2)

    total = round(sum(d.score for d in dimensions), 1)
    qualified = veto_passed and total >= 60.0

    if total >= 85:
        tier, tier_zh = "National green factory candidate", "国家级绿色工厂候选"
    elif total >= 70:
        tier, tier_zh = "Provincial 深绿 Tier 2", "省级深绿（二级）"
    elif total >= 60:
        tier, tier_zh = "Municipal green factory", "市级绿色工厂"
    else:
        tier, tier_zh = "Below threshold — gaps remain", "未达绿色工厂门槛"

    formulas = [
        {
            "eq": "§5.2",
            "label": "Linear proportion scoring",
            "latex": "score = weight × (actual − benchmark) / (leading − benchmark)",
            "values": {"leading": "行业前5%引领值", "benchmark": "行业平均水平"},
            "result": total,
        },
        {
            "eq": "B.5",
            "label": "Renewable energy utilization",
            "latex": "R_re = E_re / E × 100%",
            "values": {"R_re%": green, "E_re": "renewable tce", "E": "total tce"},
            "result": indicators_energy[2].score,
        },
        {
            "eq": "B.3",
            "label": "Unit product CO₂ emissions",
            "latex": "C_ui = C_i / Q_i",
            "values": {"C_ui": intensity, "C_i": "tCO₂", "Q_i": "tonnes"},
            "result": indicators_energy[1].score,
        },
    ]

    summary_en = (
        f"Scored {total}/100 against GB/T 36132—2025 using new-submission levers, "
        f"grant application form, and {sum(1 for c in checklist if c.get('done'))}/{len(checklist) or 6} checklist documents. "
        f"{'All veto gates passed.' if veto_passed else 'Veto gates incomplete — see checklist.'}"
    )
    summary_zh = (
        f"依据 GB/T 36132—2025《绿色工厂评价通则》，结合新建提交数据、补贴申请表与"
        f" {sum(1 for c in checklist if c.get('done'))}/{len(checklist) or 6} 份清单文件，"
        f"评分 {total}/100。{'基本准入全部满足。' if veto_passed else '基本准入未全部满足。'}"
    )

    return GreenFactoryScoreResult(
        standard="GB/T 36132—2025",
        standard_zh="绿色工厂评价通则",
        guideline_doc="绿色工厂评价通则.pdf · General principles for green factory evaluation",
        total_score=total,
        max_score=100.0,
        qualified=qualified,
        veto_passed=veto_passed,
        veto_items=veto_items,
        dimensions=dimensions,
        tier_label=tier,
        tier_label_zh=tier_zh,
        formulas=formulas,
        summary_en=summary_en,
        summary_zh=summary_zh,
    )


def result_to_dict(result: GreenFactoryScoreResult) -> dict:
    return {
        "standard": result.standard,
        "standard_zh": result.standard_zh,
        "guideline_doc": result.guideline_doc,
        "total_score": result.total_score,
        "max_score": result.max_score,
        "qualified": result.qualified,
        "veto_passed": result.veto_passed,
        "veto_items": [asdict(v) for v in result.veto_items],
        "dimensions": [
            {
                **{k: v for k, v in asdict(d).items() if k != "indicators"},
                "indicators": [asdict(i) for i in d.indicators],
            }
            for d in result.dimensions
        ],
        "tier_label": result.tier_label,
        "tier_label_zh": result.tier_label_zh,
        "formulas": result.formulas,
        "summary_en": result.summary_en,
        "summary_zh": result.summary_zh,
    }
