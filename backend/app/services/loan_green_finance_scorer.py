"""Green loan Stage-3 readiness score — deterministic dual-source scorer.

Sources:
  1. GB/T 36132—2025 绿色工厂评价通则 (§4.2 gates, §4.3 five dimensions, §5.2 linear scoring)
  2. 绿色金融支持项目目录（2025 年版）— use-of-funds eligibility (esp. §1.4 节能降碳改造 for steel)

LLM never produces these numbers.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass


GUIDELINE = (
    "GB/T 36132—2025 绿色工厂评价通则 + "
    "绿色金融支持项目目录（2025 年版）"
)

# Loan form category number → (catalogue_code, name_zh, name_en, ghg_tier)
# ghg_tier: 2 = √√ direct abatement, 1 = √ enabling, 0 = weak/indirect for steel SME
CATALOGUE_MAP: dict[int, tuple[str, str, str, int]] = {
    1: ("5.x", "绿色农业开发", "Green agriculture", 0),
    2: ("5.x", "绿色林业开发", "Green forestry", 0),
    3: (
        "1.4.1 / 1.4.2",
        "工业节能节水环保 → 节能降碳改造/工艺改进（钢铁）",
        "Industrial energy/water-saving → §1.4 retrofit (steel)",
        2,
    ),
    4: ("3.x", "自然保护、生态修复", "Nature protection / restoration", 0),
    5: ("2.x / 循环", "资源循环利用", "Resource recycling", 2),
    6: ("2.2", "垃圾处理及污染防治", "Waste treatment & pollution control", 1),
    7: ("1.x / 清洁能源", "可再生能源及清洁能源", "Renewable & clean energy", 2),
    8: ("水务", "农村及城市水", "Rural & urban water", 0),
    9: ("建筑", "建筑节能及绿色建筑", "Building energy efficiency", 1),
    10: ("交通", "绿色交通运输", "Green transport", 0),
    11: ("1.x 服务", "节能环保服务", "Energy-saving & environmental services", 1),
    12: ("境外", "境外项目（国际标准）", "Overseas projects (intl. standards)", 0),
}


@dataclass
class IndicatorScore:
    seq: int
    name_en: str
    name_zh: str
    indicator_type: str
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
class LoanScoreResult:
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
    """GB/T 36132 §5.2 — full at leading, zero at/beyond benchmark, linear between."""
    if higher_is_better:
        if actual >= leading:
            return float(weight_points)
        if actual <= benchmark:
            return 0.0
        span = leading - benchmark
        return round(weight_points * (actual - benchmark) / span, 2) if span > 0 else 0.0
    if actual <= leading:
        return float(weight_points)
    if actual >= benchmark:
        return 0.0
    span = benchmark - leading
    return round(weight_points * (benchmark - actual) / span, 2) if span > 0 else 0.0


def _selected_category(application_form: dict) -> tuple[int | None, dict | None]:
    uof = application_form.get("use_of_funds_category") or {}
    selected_n = uof.get("selected_category_number")
    cats = uof.get("categories") or []
    picked = None
    for c in cats:
        if c.get("selected"):
            picked = c
            selected_n = c.get("number", selected_n)
            break
    if picked is None and selected_n is not None:
        for c in cats:
            if c.get("number") == selected_n:
                picked = c
                break
    # Steel SME default if nothing selected: category 3
    if picked is None and not cats:
        return 3, {"number": 3, "name_cn": "工业节能节水环保", "selected": True}
    if picked is None:
        return None, None
    return int(selected_n) if selected_n is not None else None, picked


def compute_loan_green_finance_score(
    *,
    scrap_ratio_pct: float = 24.5,
    green_electricity_pct: float = 45.0,
    intensity_tco2e_per_t: float = 3.506,
    metering_pct: float | None = None,
    checklist: list[dict] | None = None,
    application_form: dict | None = None,
) -> LoanScoreResult:
    checklist = checklist or []
    application_form = application_form or {}
    done_docs = {c.get("name", ""): bool(c.get("done")) for c in checklist}

    has_licence = done_docs.get("Business licence · 营业执照", False)
    has_utility = done_docs.get("Latest 12-mo utility invoices", False)
    has_emissions = done_docs.get("Emissions ledger · Q1–Q4 2025", False)
    has_bank = done_docs.get("Bank statement · last 6 mo", False)
    has_uop = done_docs.get("Green-project use-of-proceeds", False)
    has_auditor = done_docs.get("Auditor attestation (optional)", False)

    comp = application_form.get("compliance_declaration") or {}
    loan_proj = application_form.get("loan_project_information") or {}
    mop = (loan_proj.get("management_of_proceeds") or {}).get("method") or {}
    env_rep = application_form.get("environmental_benefit_and_reporting") or {}
    glp_proc = (application_form.get("use_of_funds_category") or {}).get(
        "glp_evaluation_and_selection_process"
    ) or {}

    # --- Veto: 通则 §4.2 + loan compliance ---
    veto_items = [
        VetoItem(
            "no_env_violation",
            "No major environmental violation (3 yrs) — GB/T 36132 §4.2(a)",
            "近三年无重大环保违法 — 通则 §4.2(a)",
            bool(comp.get("no_major_environmental_violation_3yrs")),
            "loan form · compliance",
        ),
        VetoItem(
            "no_safety",
            "No safety-production violation",
            "无安全生产违法违规记录",
            bool(comp.get("no_safety_production_violation")),
            "loan form · compliance",
        ),
        VetoItem(
            "not_phased_out",
            "Not on phased-out / obsolete capacity list",
            "未列入落后产能淘汰名单",
            bool(comp.get("not_on_phased_out_capacity_list")),
            "loan form · compliance",
        ),
        VetoItem(
            "discharge_permit",
            "Valid pollutant discharge permit (if applicable)",
            "持有有效排污许可证（如适用）",
            bool(comp.get("holds_valid_discharge_permit")),
            "loan form · compliance",
        ),
        VetoItem(
            "ems",
            "EMS in place (ISO 14001 / GB/T 24001) — §4.2(c)",
            "环境管理体系已建立 — 通则 §4.2(c)",
            bool(comp.get("has_ems_iso14001_or_equivalent")),
            "loan form · compliance",
        ),
        VetoItem(
            "single_category",
            "Use of funds maps to one catalogue category",
            "资金用途明确对应目录单一类别",
            bool(comp.get("use_of_funds_maps_clearly_to_one_category")),
            "loan form · 目录 2025",
        ),
        VetoItem(
            "business_licence",
            "Business licence on file",
            "营业执照已上传",
            has_licence,
            "loan checklist",
        ),
    ]
    veto_passed = all(v.passed for v in veto_items)

    cat_n, cat_obj = _selected_category(application_form)
    cat_meta = CATALOGUE_MAP.get(cat_n or -1)
    if cat_meta is None and cat_n is None:
        # Prefer industrial default narrative when form empty
        cat_n = 3
        cat_meta = CATALOGUE_MAP[3]

    code, name_zh, name_en, ghg_tier = cat_meta or ("—", "未选择", "Unselected", 0)

    # Dimension 1 · Catalogue eligibility (25)
    cat_base = {2: 18.0, 1: 12.0, 0: 6.0}.get(ghg_tier, 4.0)
    if cat_n == 3:
        cat_base = 20.0  # steel retrofit sweet spot §1.4.1/1.4.2 √√
    if has_uop:
        cat_base = min(25.0, cat_base + 3.0)
    if bool(comp.get("use_of_funds_maps_clearly_to_one_category")):
        cat_base = min(25.0, cat_base + 2.0)
    cat_score = round(min(25.0, cat_base), 2)

    ind_catalogue = [
        IndicatorScore(
            1,
            "2025 Catalogue use-of-funds fit",
            "2025 版目录用途契合度",
            "forward_qual",
            "—",
            18,
            round(min(18.0, cat_score * 18 / 25), 2),
            f"{code} · {name_en}",
            "§1.4.1/1.4.2 steel √√",
            "unmapped",
            "目录 1.4",
            "loan form · use_of_funds_category",
            "Map loan purpose to 绿色金融支持项目目录（2025）. Steel SME retrofits typically land in §1.4.1 energy-efficiency upgrade or §1.4.2 process/EAF optimisation (√√ direct abatement).",
            "将贷款用途映射至《绿色金融支持项目目录（2025 年版）》。钢铁 SME 技改通常对应 §1.4.1 节能降碳改造或 §1.4.2 工艺改进/电炉短流程（√√ 直接减排）。",
        ),
        IndicatorScore(
            2,
            "GHG contribution class (√ / √√)",
            "温室气体减排贡献标注",
            "forward_qual",
            "tier",
            7,
            {2: 7.0, 1: 4.0, 0: 1.0}.get(ghg_tier, 0.0),
            "√√" if ghg_tier == 2 else ("√" if ghg_tier == 1 else "—"),
            "√√",
            "none",
            "目录备注",
            "catalogue footnote",
            "Catalogue marks √√ for direct abatement and √ for enabling contributions. Prefer √√ entries for green-loan pricing narratives.",
            "目录以 √√ 标注直接减排、√ 标注赋能型贡献；绿色贷款定价叙述宜优先 √√ 条目。",
        ),
    ]
    # renormalize indicator 1 to keep dim sum = cat_score
    ind_catalogue[0] = IndicatorScore(
        **{
            **asdict(ind_catalogue[0]),
            "score": round(max(0.0, cat_score - ind_catalogue[1].score), 2),
        }
    )
    dim_catalogue = DimensionScore(
        "catalogue",
        "Catalogue eligibility",
        "目录准入（2025）",
        25,
        round(sum(i.score for i in ind_catalogue), 2),
        25.0,
        ind_catalogue,
    )

    # Dimension 2 · Energy low-carbon (25) — 通则 §4.3.1 / §5.2
    meter = metering_pct if metering_pct is not None else 78.0
    if has_utility:
        meter = min(95.0, meter + 3.0)
    intensity = intensity_tco2e_per_t
    if has_emissions:
        intensity = max(1.2, intensity * 0.97)
    green = green_electricity_pct

    intensity_pts = _linear_points(
        intensity, leading=1.50, benchmark=3.80, weight_points=12, higher_is_better=False
    )
    green_pts = _linear_points(
        green, leading=60.0, benchmark=15.0, weight_points=8, higher_is_better=True
    )
    meter_pts = _linear_points(
        meter, leading=95.0, benchmark=55.0, weight_points=5, higher_is_better=True
    )

    ind_energy = [
        IndicatorScore(
            3,
            "Unit product CO₂ intensity",
            "单位产品碳排放强度",
            "inverse_quant",
            "tCO2e/t",
            12,
            intensity_pts,
            intensity,
            1.50,
            3.80,
            "通则 §5.2 / B",
            "dashboard + emissions ledger",
            "GB/T 36132 §4.3.1 energy-low-carbon: score linearly between leading (top ~5%) and industry baseline (§5.2).",
            "通则 §4.3.1 能源低碳化：按 §5.2 在引领值与基准值之间线性赋分。",
        ),
        IndicatorScore(
            4,
            "Renewable electricity share",
            "可再生能源利用率",
            "forward_quant",
            "%",
            8,
            green_pts,
            green,
            60,
            15,
            "通则 §4.3.1.2",
            "dashboard green slider",
            "Renewable energy utilization supports 能源低碳化 and aligns with catalogue zero-carbon electricity substitution in §1.4.2.",
            "可再生能源利用支撑能源低碳化，并与目录 §1.4.2 零碳电力替代方向一致。",
        ),
        IndicatorScore(
            5,
            "Energy metering coverage",
            "能源计量覆盖",
            "forward_quant",
            "%",
            5,
            meter_pts,
            meter,
            95,
            55,
            "通则 / GB17167",
            "process matrix + utility invoices",
            "Metering evidence underpins auditable green-loan impact and green-factory energy indicators.",
            "计量证据支撑绿色贷款环境影响可审计性及绿色工厂能源指标。",
        ),
    ]
    dim_energy = DimensionScore(
        "energy",
        "Energy low-carbon",
        "能源低碳化",
        25,
        round(sum(i.score for i in ind_energy), 2),
        25.0,
        ind_energy,
    )

    # Dimension 3 · Resource efficient (15) — 通则 §4.3.2
    scrap_pts = _linear_points(
        scrap_ratio_pct, leading=40.0, benchmark=10.0, weight_points=10, higher_is_better=True
    )
    bank_pts = 5.0 if has_bank else 2.0
    ind_resource = [
        IndicatorScore(
            6,
            "Scrap / secondary material ratio",
            "废钢/再生料占比",
            "forward_quant",
            "%",
            10,
            scrap_pts,
            scrap_ratio_pct,
            40,
            10,
            "通则 §4.3.2",
            "dashboard scrap slider",
            "Higher scrap share improves resource efficiency and supports EAF / short-process narratives under catalogue §1.4.2.",
            "更高废钢比提升资源高效化，并支撑目录 §1.4.2 电炉短流程叙述。",
        ),
        IndicatorScore(
            7,
            "Financial trail for proceeds",
            "资金轨迹（流水）",
            "forward_qual",
            "—",
            5,
            bank_pts,
            "bank stmt" if has_bank else "missing",
            "present",
            "absent",
            "目录 / GLP",
            "loan checklist",
            "Bank statements support proceeds tracking required for green-loan labelling.",
            "银行流水支撑绿色贷款资金跟踪要求。",
        ),
    ]
    dim_resource = DimensionScore(
        "resource",
        "Resource efficient",
        "资源高效化",
        15,
        round(sum(i.score for i in ind_resource), 2),
        15.0,
        ind_resource,
    )

    # Dimension 4 · Clean production & compliance (20) — 通则 §4.3.3 + form
    clean_pts = 0.0
    clean_pts += 4 if comp.get("no_major_environmental_violation_3yrs") else 0
    clean_pts += 3 if comp.get("not_on_phased_out_capacity_list") else 0
    clean_pts += 3 if comp.get("holds_valid_discharge_permit") else 0
    clean_pts += 3 if comp.get("has_ems_iso14001_or_equivalent") else 0
    clean_pts += 3 if has_emissions else 0
    clean_pts += 4 if has_auditor else 0

    ind_clean = [
        IndicatorScore(
            8,
            "Clean-production / compliance pack",
            "生产洁净化与合规包",
            "forward_qual",
            "checks",
            20,
            round(min(20.0, clean_pts), 2),
            f"{int(clean_pts)}/20 signals",
            "full pack",
            "gaps",
            "通则 §4.2–4.3.3",
            "loan form + checklist",
            "Combines §4.2 basic requirements with clean-production evidence (emissions ledger, auditor attestation).",
            "合并通则 §4.2 基本要求与洁净化证据（排放台账、审计证明）。",
        ),
    ]
    dim_clean = DimensionScore(
        "clean",
        "Clean production",
        "生产洁净化",
        20,
        round(sum(i.score for i in ind_clean), 2),
        20.0,
        ind_clean,
    )

    # Dimension 5 · Proceeds & reporting (15)
    proc_pts = 0.0
    if mop.get("dedicated_account") or mop.get("internal_tracking_ledger"):
        proc_pts += 5
    if has_uop:
        proc_pts += 4
    freq = env_rep.get("reporting_frequency") or {}
    if freq.get("annual") or freq.get("semi_annual"):
        proc_pts += 3
    if (env_rep.get("expected_realised_tco2e_reduction") or "").strip():
        proc_pts += 2
    if (glp_proc.get("environmental_sustainability_objectives") or "").strip():
        proc_pts += 1

    ind_report = [
        IndicatorScore(
            9,
            "Proceeds management & impact reporting",
            "资金管理与效益报告",
            "forward_qual",
            "—",
            15,
            round(min(15.0, proc_pts), 2),
            f"{int(proc_pts)}/15",
            "dedicated + quantified impact",
            "incomplete",
            "目录 / GLP Reporting",
            "loan form · management_of_proceeds + environmental_benefit",
            "Green loans need tracked proceeds and renewing impact disclosure (tCO2e / energy / water) until allocation or maturity.",
            "绿色贷款需可追踪资金，并持续披露 tCO2e/节能/节水等影响至拨付完毕或到期。",
        ),
    ]
    dim_report = DimensionScore(
        "reporting",
        "Proceeds & reporting",
        "资金与报告",
        15,
        round(sum(i.score for i in ind_report), 2),
        15.0,
        ind_report,
    )

    dimensions = [dim_catalogue, dim_energy, dim_resource, dim_clean, dim_report]
    total = round(sum(d.score for d in dimensions), 1)
    if not veto_passed:
        total = round(min(total, 54.9), 1)

    qualified = veto_passed and total >= 70.0
    if qualified:
        tier, tier_zh = f"{total:.0f}% — pass (thr 70%)", f"{total:.0f}% — 通过（阈值 70%）"
    else:
        tier, tier_zh = f"{total:.0f}% — below thr 70%", f"{total:.0f}% — 未达阈值 70%"

    formulas = [
        {
            "eq": "通则 §5.2",
            "label": "Linear proportion scoring",
            "latex": "score = weight × (actual − benchmark) / (leading − benchmark)",
            "values": {"intensity": intensity, "green_%": green, "scrap_%": scrap_ratio_pct},
            "result": dim_energy.score,
        },
        {
            "eq": "目录 1.4",
            "label": "Steel retrofit catalogue fit",
            "latex": "Eligible if purpose ∈ {1.4.1 节能降碳改造, 1.4.2 工艺改进} ∧ meets advanced/benchmark energy limit",
            "values": {"category": cat_n, "code": code, "ghg": ghg_tier},
            "result": dim_catalogue.score,
        },
        {
            "eq": "通则 §6.1",
            "label": "Roll-up",
            "latex": "Total = Catalogue25 + Energy25 + Resource15 + Clean20 + Reporting15",
            "values": {"veto": veto_passed},
            "result": total,
        },
    ]

    n_done = sum(1 for c in checklist if c.get("done"))
    n_total = len(checklist) or 6
    summary_en = (
        f"Scored {total}/100 using GB/T 36132—2025 factory indicators and "
        f"绿色金融支持项目目录（2025）use-of-funds fit "
        f"(category {cat_n}: {name_en}). Checklist {n_done}/{n_total}. "
        f"{'All veto gates passed.' if veto_passed else 'Compliance gates incomplete.'}"
    )
    summary_zh = (
        f"依据 GB/T 36132—2025《绿色工厂评价通则》与《绿色金融支持项目目录（2025 年版）》"
        f"用途契合度（类别 {cat_n}：{name_zh}），结合清单 {n_done}/{n_total}，"
        f"评分 {total}/100。"
        f"{'合规准入全部满足。' if veto_passed else '合规准入未全部满足。'}"
    )

    return LoanScoreResult(
        standard="GB/T 36132—2025 + 目录 2025",
        standard_zh="绿色工厂评价通则 · 绿色金融支持项目目录",
        guideline_doc=GUIDELINE,
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


def result_to_dict(result: LoanScoreResult) -> dict:
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
