"""EU CBAM installation-operator readiness score — deterministic Stage-3 scorer.

Criteria drawn from:
  Guidance Document on CBAM Implementation for Installation Operators
  Outside the EU (European Commission, DG TAXUD, 21 Nov 2023).

Dimensions map to Quick Guide §3 + Monitoring §6 + Iron & Steel §5.6/§7.2.
Tariff € uses app.calculation_engine + Q1-2026 certificate price (75.36 €/tCO2e).
LLM never produces these numbers — only reads the scored result for advisory.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass

from app.calculation_engine import CBAMInput, ProductionRoute, calculate_cbam_exposure
from app.config import get_settings
from app.data.cert_price import get_certificate_price


GUIDELINE = (
    "Guidance document on CBAM implementation for installation operators "
    "outside the EU (European Commission, 21 Nov 2023)"
)
GUIDELINE_SHORT = "CBAM Operator Guidance · DG TAXUD 21 Nov 2023"

CBAM_YEAR = 2026


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
class TariffEstimate:
    """Deterministic CBAM cost per tonne / year — calculation_engine only."""

    certificate_price_eur_per_tco2e: float
    certificate_price_quarter: str
    intensity_tco2e_per_tonne: float
    benchmark_tco2e_per_tonne: float
    taxable_emissions_tco2e_per_tonne: float
    phase_in_factor: float
    markup_applied: float
    data_source: str
    path_label: str
    path_label_zh: str
    tariff_eur_per_tonne: float
    gross_tariff_eur_per_tonne: float
    annual_exposure_eur: float
    export_tonnes: float
    formula_en: str
    formula_zh: str


@dataclass
class ExportMarginImpact:
    """Illustrative China→EU export margin before/after CBAM (not a regulated number)."""

    fob_eur_per_tonne: float
    margin_pct_before_cbam: float
    margin_eur_per_tonne_before: float
    tariff_if_approved_eur_per_tonne: float
    margin_eur_after_approved: float
    margin_pct_after_approved: float
    tariff_if_denied_eur_per_tonne: float
    margin_eur_after_denied: float
    margin_pct_after_denied: float
    margin_saved_by_approval_eur_per_tonne: float
    # CBAM €/t as % of illustrative FOB — shows why approval is appealing.
    cost_pct_of_fob_if_approved: float
    cost_pct_of_fob_if_denied: float
    note_en: str
    note_zh: str


@dataclass
class IndustryCostIllustration:
    """Literature-baseline industry CBAM €/t for Stage-3 UX (not the φ-regulated passport figure).

    Walkthrough: (SEE − benchmark × 97.5% free allocation) × ~80 €/tCO₂e
    — matches published 2026 examples (~€172 slab / ~€526 fasteners).
    """

    baseline_key: str
    baseline_label_en: str
    baseline_label_zh: str
    cn_code: str
    has_lifecycle_transparency: bool
    default_see_tco2e_per_t: float
    approved_see_tco2e_per_t: float
    see_source: str
    benchmark_tco2e_per_t: float
    free_allocation_pct: float
    carbon_price_eur: float
    # Industry standard when CBAM not configured / no transparent lifecycle data
    default_path_eur_per_tonne: float
    # Discounted cost if approval unlocked with verified / mock actual SEE
    approved_path_eur_per_tonne: float
    discount_eur_per_tonne: float
    discount_pct: float
    cost_pct_of_fob_default: float
    cost_pct_of_fob_approved: float
    # Regulated 2026 φ-net figures kept for disclosure (engine)
    regulated_approved_eur_per_tonne: float
    regulated_denied_eur_per_tonne: float
    note_en: str
    note_zh: str


@dataclass
class CbamOperatorScoreResult:
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
    # Stage-3 headline outputs for the passport UI
    approval_likelihood_pct: float
    deny_likelihood_pct: float
    outcome_label: str
    outcome_label_zh: str
    tariff: TariffEstimate
    tariff_if_approved: TariffEstimate
    tariff_if_denied: TariffEstimate
    export_margin: ExportMarginImpact
    industry_illustration: IndustryCostIllustration


# Illustrative SME fastener FOB economics for margin framing only (not regulated).
_ILLUSTRATIVE_FOB_EUR_PER_T = 850.0
_ILLUSTRATIVE_MARGIN_PCT_BEFORE = 12.0

# Literature walkthrough constants (Stage-3 UX) — not calculation_engine φ path.
_LIT_FREE_ALLOC_2026 = 0.975
_LIT_CARBON_PRICE_EUR = 80.0
_LIT_BENCHMARK_TCO2E = 1.364
# Published China crude-steel factor used when intake still carries a China-default placeholder.
_MOCK_CHINA_ACTUAL_SEE = 1.60
_CHINA_ROUTE_DEFAULT_SEE = 3.506

# CN-family → published 2026 default-path baseline (SEE + €/t anchor).
_INDUSTRY_BASELINES: dict[str, dict] = {
    "7207": {
        "key": "slab",
        "label_en": "Semi-finished steel (slab/billet)",
        "label_zh": "半成品钢（板坯/方坯）",
        "default_see": 3.486,
        "anchor_eur": 172.46,
    },
    "7208": {
        "key": "flat",
        "label_en": "Flat-rolled steel (hot-rolled)",
        "label_zh": "扁平材（热轧）",
        "default_see": 3.486,
        "anchor_eur": 172.46,
    },
    "7213": {
        "key": "bar",
        "label_en": "Bars / rods",
        "label_zh": "棒材 / 线材",
        "default_see": 3.486,
        "anchor_eur": 172.46,
    },
    "7214": {
        "key": "bar",
        "label_en": "Bars / rods",
        "label_zh": "棒材 / 线材",
        "default_see": 3.486,
        "anchor_eur": 172.46,
    },
    "7301": {
        "key": "sheet-piling",
        "label_en": "Sheet piling",
        "label_zh": "板桩",
        "default_see": 3.486,
        "anchor_eur": 172.46,
    },
    "7302": {
        "key": "rail",
        "label_en": "Railway material",
        "label_zh": "铁道用材",
        "default_see": 3.486,
        "anchor_eur": 172.46,
    },
    "7318": {
        "key": "fastener",
        "label_en": "Downstream fasteners (screws/bolts)",
        "label_zh": "下游紧固件（螺钉/螺栓）",
        # Reverse-engineered from published €526.47 @ 80 €/tCO₂e walkthrough.
        "default_see": 7.911,
        "anchor_eur": 526.47,
    },
    "7326": {
        "key": "articles",
        "label_en": "Other articles of iron/steel",
        "label_zh": "其他钢铁制品",
        "default_see": 7.911,
        "anchor_eur": 526.47,
    },
}


def _cn_family(cn_code: str | None) -> str:
    digits = "".join(ch for ch in (cn_code or "") if ch.isdigit())
    return digits[:4] if len(digits) >= 4 else "7318"


def _lit_walkthrough_eur(see: float, *, benchmark: float, free_alloc: float, price: float) -> float:
    taxable = max(0.0, see - benchmark * free_alloc)
    return round(taxable * price, 2)


def _is_placeholder_see(see: float, default_see: float) -> bool:
    """Intake still carries China-default / literature-default as if it were plant actual."""
    return abs(see - _CHINA_ROUTE_DEFAULT_SEE) < 0.05 or abs(see - default_see) < 0.05


def _industry_cost_illustration(
    *,
    cn_code: str | None,
    intensity_tco2e_per_t: float,
    has_lifecycle_transparency: bool,
    regulated_approved: TariffEstimate,
    regulated_denied: TariffEstimate,
) -> IndustryCostIllustration:
    family = _cn_family(cn_code)
    base = _INDUSTRY_BASELINES.get(family, _INDUSTRY_BASELINES["7318"])
    bm = _LIT_BENCHMARK_TCO2E
    free_alloc = _LIT_FREE_ALLOC_2026
    price = _LIT_CARBON_PRICE_EUR
    default_see = float(base["default_see"])
    # Pin default € to published anchor when walkthrough rounds match; else recompute.
    default_eur = float(base["anchor_eur"])
    walk_default = _lit_walkthrough_eur(default_see, benchmark=bm, free_alloc=free_alloc, price=price)
    if abs(walk_default - default_eur) > 1.0:
        default_eur = walk_default

    try:
        input_see = float(intensity_tco2e_per_t)
    except (TypeError, ValueError):
        input_see = default_see
    if input_see <= 0:
        input_see = default_see

    if has_lifecycle_transparency:
        if _is_placeholder_see(input_see, default_see):
            approved_see = _MOCK_CHINA_ACTUAL_SEE
            see_source = "mock_china_actual_1.60"
        else:
            approved_see = input_see
            see_source = "input_measured"
        approved_eur = _lit_walkthrough_eur(
            approved_see, benchmark=bm, free_alloc=free_alloc, price=price
        )
        # Never show "approved" above industry default — clamp for UX sanity.
        approved_eur = min(approved_eur, round(default_eur * 0.98, 2))
    else:
        approved_see = default_see
        approved_eur = default_eur
        see_source = "no_lifecycle_transparency"

    discount = round(max(0.0, default_eur - approved_eur), 2)
    discount_pct = round((discount / default_eur) * 100.0, 1) if default_eur else 0.0
    fob = _ILLUSTRATIVE_FOB_EUR_PER_T
    pct_def = round((default_eur / fob) * 100.0, 1) if fob else 0.0
    pct_ok = round((approved_eur / fob) * 100.0, 1) if fob else 0.0

    return IndustryCostIllustration(
        baseline_key=str(base["key"]),
        baseline_label_en=str(base["label_en"]),
        baseline_label_zh=str(base["label_zh"]),
        cn_code=_sanitize_cn_code(cn_code),
        has_lifecycle_transparency=has_lifecycle_transparency,
        default_see_tco2e_per_t=default_see,
        approved_see_tco2e_per_t=approved_see,
        see_source=see_source,
        benchmark_tco2e_per_t=bm,
        free_allocation_pct=free_alloc,
        carbon_price_eur=price,
        default_path_eur_per_tonne=default_eur,
        approved_path_eur_per_tonne=approved_eur,
        discount_eur_per_tonne=discount,
        discount_pct=discount_pct,
        cost_pct_of_fob_default=pct_def,
        cost_pct_of_fob_approved=pct_ok,
        regulated_approved_eur_per_tonne=regulated_approved.tariff_eur_per_tonne,
        regulated_denied_eur_per_tonne=regulated_denied.tariff_eur_per_tonne,
        note_en=(
            "Industry illustration for Stage-3 UX — not the passport's φ-regulated 2026 invoice. "
            "Default path = published walkthrough when lifecycle data is missing/opaque "
            f"(SEE {default_see} tCO₂e/t → €{default_eur}/t). "
            "Approved path = same formula on verified/mock actual SEE "
            f"({approved_see} tCO₂e/t → €{approved_eur}/t, −{discount_pct}%). "
            f"Regulated φ=2.5% engine figures remain €{regulated_approved.tariff_eur_per_tonne}/t "
            f"vs €{regulated_denied.tariff_eur_per_tonne}/t."
        ),
        note_zh=(
            "阶段 3 行业示意 — 非护照 φ 管制 2026 应缴额。"
            f"无碳足迹透明数据时走默认路径（SEE {default_see} → €{default_eur}/t）；"
            f"核验通过后按实际/示意 SEE {approved_see} 折算 €{approved_eur}/t（节省 {discount_pct}%）。"
            f"引擎 φ=2.5% 管制数字仍为 €{regulated_approved.tariff_eur_per_tonne}/t "
            f"对 €{regulated_denied.tariff_eur_per_tonne}/t。"
        ),
    )


def _doc_done(done_docs: dict[str, bool], *needles: str) -> bool:
    for name, done in done_docs.items():
        if not done:
            continue
        low = name.lower()
        if any(n.lower() in low or n.lower() in name for n in needles):
            return True
    return False


def _points_from_bool(ok: bool, weight: int) -> float:
    return float(weight) if ok else 0.0


def _linear_inverse(
    actual: float,
    *,
    leading: float,
    benchmark: float,
    weight_points: int,
) -> float:
    """Lower intensity is better — full marks at/below leading, zero at/above benchmark."""
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
        return 70.0
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
    return round((ok * 95 + warn * 78 + bad * 55) / n, 1)


def _parse_route(production_route: str | None) -> ProductionRoute:
    text = (production_route or "BF-BOF").strip().upper().replace("_", "-")
    if "SCRAP" in text or text in {"EAF-SCRAP", "SCRAP-EAF"}:
        return ProductionRoute.SCRAP_EAF
    if "DRI" in text:
        return ProductionRoute.DRI_EAF
    return ProductionRoute.BF_BOF


def _approval_likelihood(
    *,
    total: float,
    veto_passed: bool,
    verifier: bool,
    has_direct: bool,
) -> tuple[float, float, str, str]:
    """Likely approve/deny for actual-values declarant acceptance (not an EU legal decision).

    Deterministic map from readiness score + veto/verifier evidence.
    """
    if not veto_passed:
        approve = round(min(35.0, max(5.0, total * 0.5)), 1)
    else:
        approve = 15.0 + total * 0.75
        if verifier:
            approve += 3.0
        if has_direct:
            approve += 2.0
        approve = round(min(95.0, max(15.0, approve)), 1)
    deny = round(100.0 - approve, 1)
    if approve >= 70.0:
        return (
            approve,
            deny,
            "Likely approve — actual-values path for EU declarant",
            "倾向通过 — 可走实际值路径供欧盟申报人使用",
        )
    if approve >= 50.0:
        return (
            approve,
            deny,
            "Borderline — close MRV gaps before definitive period",
            "临界 — 确定期前须补齐 MRV 缺口",
        )
    return (
        approve,
        deny,
        "Likely deny / default-values penalty risk",
        "倾向否决 / 默认值惩罚风险高",
    )


def _sanitize_cn_code(cn_code: str | None) -> str:
    """Take first CN token; strip slashes from checklist shorthand like '7213 / 7214'."""
    raw = (cn_code or "7318 15 88").strip()
    if not raw:
        return "7318 15 88"
    # Prefer the left side of "7213 / 7214" or "7213/7214"
    head = raw.split("/")[0].strip()
    return head or "7318 15 88"


def _tariff_estimate(
    *,
    cn_code: str | None,
    production_route: str | None,
    intensity_tco2e_per_t: float,
    production_tonnes: float | None,
    use_measured: bool,
    path_label: str,
    path_label_zh: str,
) -> TariffEstimate:
    """CBAM Cost ≈ (Embedded − Benchmark) × cert price × (1+markup) × φ_year."""
    settings = get_settings()
    quarter = settings.cbam_certificate_price_quarter
    price_entry = get_certificate_price(quarter)
    route = _parse_route(production_route)
    tonnes = float(production_tonnes) if production_tonnes and production_tonnes > 0 else 1000.0
    measured = None
    if use_measured:
        try:
            measured = float(intensity_tco2e_per_t)
        except (TypeError, ValueError):
            measured = None
        if measured is not None and measured <= 0:
            measured = None
    cbam = calculate_cbam_exposure(
        CBAMInput(
            cn_code=_sanitize_cn_code(cn_code),
            route=route,
            annual_export_tonnes=tonnes,
            year=CBAM_YEAR,
            measured_intensity_tco2e_per_tonne=measured,
        ),
        certificate_price_eur_per_tco2e=price_entry.price_eur_per_tco2e,
    )
    return TariffEstimate(
        certificate_price_eur_per_tco2e=cbam.certificate_price_eur_per_tco2e,
        certificate_price_quarter=quarter,
        intensity_tco2e_per_tonne=cbam.intensity_tco2e_per_tonne,
        benchmark_tco2e_per_tonne=cbam.benchmark_tco2e_per_tonne,
        taxable_emissions_tco2e_per_tonne=round(cbam.taxable_emissions_tco2e_per_tonne, 4),
        phase_in_factor=cbam.phase_in_factor,
        markup_applied=cbam.markup_applied,
        data_source=cbam.data_source,
        path_label=path_label,
        path_label_zh=path_label_zh,
        tariff_eur_per_tonne=round(cbam.tariff_cost_eur_per_tonne, 2),
        gross_tariff_eur_per_tonne=round(cbam.gross_tariff_cost_eur_per_tonne, 2),
        annual_exposure_eur=round(cbam.annual_exposure_eur, 2),
        export_tonnes=tonnes,
        formula_en=(
            f"tariff €/t = max(0, SEE−benchmark) × {cbam.certificate_price_eur_per_tco2e} €/tCO2e "
            f"× (1+markup) × φ_{CBAM_YEAR}={cbam.phase_in_factor}"
        ),
        formula_zh=(
            f"关税 €/t = max(0, SEE−基准) × {cbam.certificate_price_eur_per_tco2e} €/tCO2e "
            f"× (1+加价) × φ_{CBAM_YEAR}={cbam.phase_in_factor}"
        ),
    )


def _export_margin_impact(
    *,
    tariff_approved: TariffEstimate,
    tariff_denied: TariffEstimate,
    industry: IndustryCostIllustration | None = None,
) -> ExportMarginImpact:
    fob = _ILLUSTRATIVE_FOB_EUR_PER_T
    pct_before = _ILLUSTRATIVE_MARGIN_PCT_BEFORE
    margin_before = round(fob * pct_before / 100.0, 2)
    # Prefer industry baseline € for UX margin story; fall back to φ-regulated.
    if industry is not None:
        t_ok = industry.approved_path_eur_per_tonne
        t_no = industry.default_path_eur_per_tonne
    else:
        t_ok = tariff_approved.tariff_eur_per_tonne
        t_no = tariff_denied.tariff_eur_per_tonne
    after_ok = round(margin_before - t_ok, 2)
    after_no = round(margin_before - t_no, 2)
    pct_ok = round((after_ok / fob) * 100.0, 2) if fob else 0.0
    pct_no = round((after_no / fob) * 100.0, 2) if fob else 0.0
    pct_fob_ok = round((t_ok / fob) * 100.0, 1) if fob else 0.0
    pct_fob_no = round((t_no / fob) * 100.0, 1) if fob else 0.0
    return ExportMarginImpact(
        fob_eur_per_tonne=fob,
        margin_pct_before_cbam=pct_before,
        margin_eur_per_tonne_before=margin_before,
        tariff_if_approved_eur_per_tonne=t_ok,
        margin_eur_after_approved=after_ok,
        margin_pct_after_approved=pct_ok,
        tariff_if_denied_eur_per_tonne=t_no,
        margin_eur_after_denied=after_no,
        margin_pct_after_denied=pct_no,
        margin_saved_by_approval_eur_per_tonne=round(t_no - t_ok, 2),
        cost_pct_of_fob_if_approved=pct_fob_ok,
        cost_pct_of_fob_if_denied=pct_fob_no,
        note_en=(
            "Illustrative China→EU FOB margin using industry baseline CBAM €/t "
            "(literature walkthrough, not φ-regulated 2026 invoice). "
            "Assumes exporter absorbs cost; legal obligation sits with the EU importer. "
            "FOB €850/t and 12% pre-CBAM margin are MVP framing constants. "
            "Opaque lifecycle → industry default path; approved actuals → discounted path."
        ),
        note_zh=(
            "示意性中国→欧盟 FOB 利润，采用行业基线 CBAM €/t（文献算例，非 φ 管制应缴额）。"
            "假设出口商吸收成本；法定义务在欧盟进口商。"
            "FOB €850/t、税前毛利 12% 为 MVP 示意常数。"
            "无碳足迹透明数据 → 行业默认路径；核验通过 → 折扣路径。"
        ),
    )


def compute_cbam_operator_score(
    *,
    cn_code: str | None = None,
    production_route: str | None = None,
    intensity_tco2e_per_t: float = 3.506,
    metering_pct: float | None = None,
    scrap_ratio_pct: float = 24.5,
    production_tonnes: float | None = None,
    checklist: list[dict] | None = None,
    process_matrix: list[dict] | None = None,
    has_verifier: bool | None = None,
    has_certificates_ledger: bool | None = None,
) -> CbamOperatorScoreResult:
    """Score non-EU installation operator readiness against CBAM guidance."""
    checklist = checklist or []
    done_docs = {c.get("name", ""): bool(c.get("done")) for c in checklist}

    has_cn = _doc_done(done_docs, "CN-code", "税则号") or bool(cn_code and cn_code.strip())
    has_route = _doc_done(done_docs, "Route-of-production", "生产工艺") or bool(
        production_route and production_route.strip()
    )
    has_summary = _doc_done(done_docs, "Summary_Process", "Summary_Communication")
    has_inst = _doc_done(done_docs, "A_InstData", "installation")
    has_codes = _doc_done(done_docs, "c_CodeLists", "CodeLists")
    has_direct = _doc_done(done_docs, "Direct + indirect", "embedded emissions", "直接")
    has_install_emissions = _doc_done(done_docs, "Installation-level", "装置级")
    verifier = (
        has_verifier
        if has_verifier is not None
        else _doc_done(done_docs, "Verifier", "核查")
    )
    certs = (
        has_certificates_ledger
        if has_certificates_ledger is not None
        else _doc_done(done_docs, "Purchased CBAM", "证书")
    )

    meter = metering_pct if metering_pct is not None else _avg_metering_pct(process_matrix)

    # --- Veto gates (Quick Guide §3 — must answer before reporting) ----------
    veto_items = [
        VetoItem(
            "cn_in_scope",
            "CN codes mapped to Annex I CBAM goods",
            "税则号对照 CBAM 附件一在列货物",
            has_cn,
            "checklist · Guidance §5.2 / §5.6",
        ),
        VetoItem(
            "production_route",
            "Production route identified (e.g. BF-BOF)",
            "已识别生产工艺路线（如 BF-BOF）",
            has_route,
            "checklist · Guidance §5.6.3",
        ),
        VetoItem(
            "system_boundaries",
            "Installation / production-process boundaries defined",
            "装置与生产工序边界已界定",
            has_inst or has_summary,
            "checklist · Guidance §3 Step 1 / §6.3",
        ),
        VetoItem(
            "direct_emissions",
            "Direct embedded emissions data available",
            "直接隐含排放数据可用（钢铁 Annex II）",
            has_direct or has_install_emissions,
            "checklist · Guidance §6.1.3 / §6.5",
        ),
        VetoItem(
            "communication_template",
            "Operator → declarant communication pack started",
            "运营方→申报人沟通模板已启动",
            has_summary or has_inst or has_codes,
            "checklist · Guidance §3 / §6.11",
        ),
    ]
    veto_passed = all(v.passed for v in veto_items)

    # --- Dimension 1 · Scope & goods (20) ------------------------------------
    ind_scope = [
        IndicatorScore(
            1,
            "Annex I goods identification",
            "附件一货物识别",
            "forward_qual",
            "—",
            10,
            _points_from_bool(has_cn, 10),
            "mapped" if has_cn else "missing",
            "CN list complete",
            "unmapped",
            "§5.2",
            "passport checklist · CN-code product list",
            "Compare product CN codes to Annex I of Reg (EU) 2023/956. Out-of-scope goods need not monitor under CBAM.",
            "对照法规 (EU) 2023/956 附件一税则号；非在列货物无需按 CBAM 监测。",
        ),
        IndicatorScore(
            2,
            "Iron & steel production route",
            "钢铁生产路线",
            "forward_qual",
            "—",
            10,
            _points_from_bool(has_route, 10),
            production_route or ("stated" if has_route else "missing"),
            "BF-BOF / EAF documented",
            "unknown",
            "§5.6.3",
            "passport checklist · Route-of-production statement",
            "Steel aggregated goods require a defined production route so system boundaries and precursor rules apply correctly (§5.6 / §7.2).",
            "钢铁汇总货物类别需明确生产路线，方可正确划定边界与前体规则（§5.6 / §7.2）。",
        ),
    ]
    dim_scope = DimensionScore(
        "scope",
        "Scope & goods",
        "范围与货物",
        20,
        round(sum(i.score for i in ind_scope), 2),
        20.0,
        ind_scope,
    )

    # --- Dimension 2 · Monitoring methodology (25) --------------------------
    mmd_score = 0.0
    mmd_parts = []
    if has_inst or has_summary:
        mmd_score += 8
        mmd_parts.append("boundaries")
    if has_codes:
        mmd_score += 7
        mmd_parts.append("code lists")
    if meter >= 85:
        mmd_score += 10
    elif meter >= 70:
        mmd_score += 6
    elif meter >= 55:
        mmd_score += 3
    mmd_parts.append(f"metering {meter}%")

    ind_mrv = [
        IndicatorScore(
            3,
            "Monitoring methodology documentation (MMD)",
            "监测方法学文件（MMD）",
            "forward_qual",
            "—",
            15,
            min(15.0, mmd_score),
            ", ".join(mmd_parts) if mmd_parts else "incomplete",
            "Steps 1–3 complete",
            "no MMD",
            "§3 / §6.4",
            "checklist + process matrix",
            "Quick Guide §3: define boundaries & routes, choose reporting period (≥3 months), identify all parameters to monitor.",
            "快速指南 §3：界定边界与路线、选定报告期（≥3 个月）、识别全部监测参数。",
        ),
        IndicatorScore(
            4,
            "Parameter metering coverage",
            "参数计量覆盖率",
            "forward_quant",
            "%",
            10,
            round(10 * min(1.0, max(0.0, (meter - 50) / 45)), 2),
            meter,
            95,
            50,
            "§6.4.4 / §6.7.1",
            "dashboard process matrix",
            "Best available data sources and metering of fuels/materials attributed to each production process (§6.4.4, §6.7.1).",
            "采用最佳可得数据源，并将燃料/物料计量归属至各生产工序（§6.4.4、§6.7.1）。",
        ),
    ]
    dim_mrv = DimensionScore(
        "monitoring",
        "Monitoring methodology",
        "监测方法学",
        25,
        round(sum(i.score for i in ind_mrv), 2),
        25.0,
        ind_mrv,
    )

    # --- Dimension 3 · Direct emissions (25) — steel Annex II ---------------
    # China default BF-BOF 3.506 vs EU benchmark ~1.370 — readiness rewards lower intensity + evidence
    intensity_pts = _linear_inverse(
        intensity_tco2e_per_t,
        leading=1.50,
        benchmark=3.80,
        weight_points=12,
    )
    evidence_pts = _points_from_bool(has_direct, 8) + _points_from_bool(has_install_emissions, 5)

    ind_direct = [
        IndicatorScore(
            5,
            "Direct SEE vs default band",
            "直接比隐含排放强度",
            "inverse_quant",
            "tCO2e/t",
            12,
            intensity_pts,
            intensity_tco2e_per_t,
            1.50,
            3.80,
            "§6.1.4 / Annex IV",
            "new submission intensity",
            "Specific embedded emissions (tCO2e/t). For iron & steel CBAM pricing focuses on direct emissions (Annex II). Lower than China default improves readiness.",
            "比隐含排放（tCO2e/t）。钢铁 CBAM 计价侧重直接排放（附件二）；低于中国默认值提升就绪度。",
        ),
        IndicatorScore(
            6,
            "Installation direct-emissions evidence",
            "装置直接排放证据",
            "forward_qual",
            "—",
            13,
            float(evidence_pts),
            "direct+install" if has_direct and has_install_emissions else ("direct" if has_direct else "gap"),
            "both layers",
            "none",
            "§6.5",
            "passport checklist",
            "Calculation-based or CEMS methods for installation direct emissions (§6.5); report at goods level via Annex IV attribution.",
            "装置直接排放可采用计算法或 CEMS（§6.5）；经附件四归属至货物层面报告。",
        ),
    ]
    dim_direct = DimensionScore(
        "direct",
        "Direct emissions",
        "直接排放",
        25,
        round(sum(i.score for i in ind_direct), 2),
        25.0,
        ind_direct,
    )

    # --- Dimension 4 · Precursors & complex goods (15) ----------------------
    scrap_pts = 0.0
    if scrap_ratio_pct >= 40:
        scrap_pts = 7.0
    elif scrap_ratio_pct >= 20:
        scrap_pts = 4.0
    elif scrap_ratio_pct > 0:
        scrap_pts = 2.0

    ind_precursor = [
        IndicatorScore(
            7,
            "Purchased precursors tracked (A_InstData)",
            "购入前体追踪（A_InstData）",
            "forward_qual",
            "—",
            8,
            _points_from_bool(has_inst, 8),
            "present" if has_inst else "missing",
            "template sheet filled",
            "absent",
            "§6.8.2",
            "passport checklist · A_InstData",
            "Complex goods (steel) must monitor precursor embedded emissions when materials are purchased (§6.8.2; §7.2 worked examples).",
            "复杂货物（钢铁）在购入物料时须监测前体隐含排放（§6.8.2；§7.2 算例）。",
        ),
        IndicatorScore(
            8,
            "Scrap / secondary material share",
            "废钢/再生料占比",
            "forward_quant",
            "%",
            7,
            scrap_pts,
            scrap_ratio_pct,
            40,
            0,
            "§5.6 / §7.2",
            "dashboard scrap slider",
            "Higher scrap share shifts route toward lower direct intensity; still requires transparent precursor documentation for EU declarants.",
            "更高废钢比通常降低直接强度；仍须向前体/申报人提供透明前体文件。",
        ),
    ]
    dim_precursor = DimensionScore(
        "precursors",
        "Precursors & complex goods",
        "前体与复杂货物",
        15,
        round(sum(i.score for i in ind_precursor), 2),
        15.0,
        ind_precursor,
    )

    # --- Dimension 5 · Communication & reporting (15) -----------------------
    ind_report = [
        IndicatorScore(
            9,
            "Communication template completeness",
            "沟通模板完整度",
            "forward_qual",
            "sheets",
            9,
            round(
                (3 if has_summary else 0) + (3 if has_inst else 0) + (3 if has_codes else 0),
                2,
            ),
            f"{sum([has_summary, has_inst, has_codes])}/3 core sheets",
            "3/3",
            "0/3",
            "§6.11",
            "passport checklist · Summary / A_InstData / c_CodeLists",
            "Operators should reply to EU importers using the Commission communication template (§3, §6.11).",
            "运营方宜使用欧委会沟通模板向欧盟进口商提供数据（§3、§6.11）。",
        ),
        IndicatorScore(
            10,
            "Verification & carbon-price reporting readiness",
            "核查与碳价报告就绪",
            "forward_qual",
            "—",
            6,
            _points_from_bool(verifier, 3) + _points_from_bool(certs, 3),
            f"verifier={'yes' if verifier else 'no'}; certificates={'yes' if certs else 'no'}",
            "both",
            "neither",
            "§6.10 / definitive",
            "passport checklist",
            "Effective carbon price due (§6.10) and verifier accreditation support definitive-period certificate surrender by declarants.",
            "应付有效碳价（§6.10）与核查资质支撑确定期申报人缴销证书。",
        ),
    ]
    dim_report = DimensionScore(
        "reporting",
        "Communication & reporting",
        "沟通与报告",
        15,
        round(sum(i.score for i in ind_report), 2),
        15.0,
        ind_report,
    )

    dimensions = [dim_scope, dim_mrv, dim_direct, dim_precursor, dim_report]
    total = round(sum(d.score for d in dimensions), 1)
    # Cap when veto fails — readiness not claimable
    if not veto_passed:
        total = round(min(total, 54.9), 1)

    qualified = veto_passed and total >= 70.0
    if qualified and total >= 85:
        tier, tier_zh = "Operator ready — declarant packable", "运营方就绪 — 可打包给申报人"
    elif qualified:
        tier, tier_zh = "Transitional-period ready", "过渡期就绪"
    elif veto_passed:
        tier, tier_zh = "Partial readiness — close MRV gaps", "部分就绪 — 需补齐 MRV"
    else:
        tier, tier_zh = "Not ready — veto gates open", "未就绪 — 准入项未满足"

    tons_note = f"{production_tonnes:.1f} t" if production_tonnes else "volume n/a"
    formulas = [
        {
            "eq": "§6.1.4",
            "label": "Specific embedded emissions",
            "latex": "SEE = Embedded emissions / Quantity of goods  [tCO2e / t]",
            "values": {"SEE": intensity_tco2e_per_t, "qty": tons_note},
            "result": intensity_pts,
        },
        {
            "eq": "Annex IV",
            "label": "Attribution to goods (complex)",
            "latex": "Attributed emissions = Direct + Heat ± Waste gas − Exports + Precursors",
            "values": {"route": production_route or "BF-BOF", "scrap_%": scrap_ratio_pct},
            "result": dim_precursor.score,
        },
        {
            "eq": "§3",
            "label": "Operator readiness roll-up",
            "latex": "Score = Scope20 + Monitoring25 + Direct25 + Precursors15 + Reporting15",
            "values": {"veto": veto_passed, "metering_%": meter},
            "result": total,
        },
    ]

    approve_pct, deny_pct, outcome_en, outcome_zh = _approval_likelihood(
        total=total,
        veto_passed=veto_passed,
        verifier=verifier,
        has_direct=has_direct or has_install_emissions,
    )
    # Expected path follows evidence; always also compute approve vs deny scenarios.
    use_measured = bool(has_direct or has_install_emissions)
    common = dict(
        cn_code=cn_code,
        production_route=production_route or "BF-BOF",
        intensity_tco2e_per_t=float(intensity_tco2e_per_t or 3.506),
        production_tonnes=production_tonnes,
    )
    try:
        tariff_if_approved = _tariff_estimate(
            **common,
            use_measured=True,
            path_label="If approved — actual values (no default markup)",
            path_label_zh="若通过 — 实际值路径（无默认值加价）",
        )
        tariff_if_denied = _tariff_estimate(
            **common,
            use_measured=False,
            path_label="If denied — China default values + 10% markup (2026)",
            path_label_zh="若否决 — 中国默认值 + 10% 加价（2026）",
        )
        tariff = _tariff_estimate(
            **common,
            use_measured=use_measured,
            path_label=(
                "Expected path — actual-values evidence present"
                if use_measured
                else "Expected path — default-values / evidence gap"
            ),
            path_label_zh=(
                "预期路径 — 已有实际值证据" if use_measured else "预期路径 — 默认值 / 证据缺口"
            ),
        )
        industry_illustration = _industry_cost_illustration(
            cn_code=cn_code,
            intensity_tco2e_per_t=float(intensity_tco2e_per_t or 3.506),
            has_lifecycle_transparency=use_measured,
            regulated_approved=tariff_if_approved,
            regulated_denied=tariff_if_denied,
        )
        export_margin = _export_margin_impact(
            tariff_approved=tariff_if_approved,
            tariff_denied=tariff_if_denied,
            industry=industry_illustration,
        )
    except Exception as exc:  # noqa: BLE001 — Stage 3 must still return readiness score
        settings = get_settings()
        quarter = settings.cbam_certificate_price_quarter
        empty = TariffEstimate(
            certificate_price_eur_per_tco2e=75.36,
            certificate_price_quarter=quarter,
            intensity_tco2e_per_tonne=float(intensity_tco2e_per_t or 3.506),
            benchmark_tco2e_per_tonne=0.0,
            taxable_emissions_tco2e_per_tonne=0.0,
            phase_in_factor=0.025,
            markup_applied=0.0,
            data_source="error",
            path_label=f"Tariff calc error: {exc}",
            path_label_zh=f"关税计算错误：{exc}",
            tariff_eur_per_tonne=0.0,
            gross_tariff_eur_per_tonne=0.0,
            annual_exposure_eur=0.0,
            export_tonnes=float(production_tonnes or 1000),
            formula_en="n/a",
            formula_zh="不适用",
        )
        tariff = tariff_if_approved = tariff_if_denied = empty
        industry_illustration = _industry_cost_illustration(
            cn_code=cn_code,
            intensity_tco2e_per_t=float(intensity_tco2e_per_t or 3.506),
            has_lifecycle_transparency=False,
            regulated_approved=empty,
            regulated_denied=empty,
        )
        export_margin = _export_margin_impact(
            tariff_approved=empty,
            tariff_denied=empty,
            industry=industry_illustration,
        )

    formulas.append(
        {
            "eq": "Art. 31 / ETS",
            "label": "CBAM tariff €/t if approved vs denied (2026)",
            "latex": (
                f"approved €{tariff_if_approved.tariff_eur_per_tonne}/t · "
                f"denied €{tariff_if_denied.tariff_eur_per_tonne}/t · "
                f"{tariff.formula_en}"
            ),
            "values": {
                "approved_€/t": tariff_if_approved.tariff_eur_per_tonne,
                "denied_€/t": tariff_if_denied.tariff_eur_per_tonne,
                "cert_€": tariff.certificate_price_eur_per_tco2e,
                "φ": tariff.phase_in_factor,
            },
            "result": tariff.tariff_eur_per_tonne,
        }
    )
    formulas.append(
        {
            "eq": "Industry walkthrough",
            "label": "Default vs discounted industry CBAM €/t (literature baseline)",
            "latex": (
                f"(SEE − {industry_illustration.benchmark_tco2e_per_t}×"
                f"{industry_illustration.free_allocation_pct}) × "
                f"{industry_illustration.carbon_price_eur} € → "
                f"default €{industry_illustration.default_path_eur_per_tonne}/t · "
                f"approved €{industry_illustration.approved_path_eur_per_tonne}/t "
                f"(−{industry_illustration.discount_pct}%)"
            ),
            "values": {
                "default_€/t": industry_illustration.default_path_eur_per_tonne,
                "approved_€/t": industry_illustration.approved_path_eur_per_tonne,
                "discount_%": industry_illustration.discount_pct,
                "SEE_default": industry_illustration.default_see_tco2e_per_t,
                "SEE_approved": industry_illustration.approved_see_tco2e_per_t,
            },
            "result": industry_illustration.approved_path_eur_per_tonne,
        }
    )

    n_done = sum(1 for c in checklist if c.get("done"))
    n_total = len(checklist) or 9
    summary_en = (
        f"Scored {total}/100 against {GUIDELINE_SHORT} using passport checklist "
        f"({n_done}/{n_total} docs), intensity {intensity_tco2e_per_t} tCO2e/t, "
        f"and metering coverage {meter}%. "
        f"Approval likelihood {approve_pct}% / deny {deny_pct}%. "
        f"Industry default path ≈ €{industry_illustration.default_path_eur_per_tonne}/t; "
        f"if approved (discounted) ≈ €{industry_illustration.approved_path_eur_per_tonne}/t "
        f"(−{industry_illustration.discount_pct}%). "
        f"{'All veto gates passed.' if veto_passed else 'Veto gates incomplete — see Quick Guide §3.'}"
    )
    summary_zh = (
        f"依据欧委会《非欧盟装置运营方 CBAM 实施指南》（2023-11-21），结合护照清单 "
        f"{n_done}/{n_total} 份文件、强度 {intensity_tco2e_per_t} tCO2e/t、计量覆盖 {meter}%，"
        f"评分 {total}/100。通过可能性 {approve_pct}% / 否决 {deny_pct}%。"
        f"行业默认路径约 €{industry_illustration.default_path_eur_per_tonne}/t；"
        f"若通过折扣价约 €{industry_illustration.approved_path_eur_per_tonne}/t"
        f"（节省 {industry_illustration.discount_pct}%）。"
        f"{'准入项全部满足。' if veto_passed else '准入项未全部满足 — 见快速指南 §3。'}"
    )

    return CbamOperatorScoreResult(
        standard="CBAM Operator Guidance",
        standard_zh="非欧盟装置运营方 CBAM 实施指南",
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
        approval_likelihood_pct=approve_pct,
        deny_likelihood_pct=deny_pct,
        outcome_label=outcome_en,
        outcome_label_zh=outcome_zh,
        tariff=tariff,
        tariff_if_approved=tariff_if_approved,
        tariff_if_denied=tariff_if_denied,
        export_margin=export_margin,
        industry_illustration=industry_illustration,
    )


def result_to_dict(result: CbamOperatorScoreResult) -> dict:
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
        "approval_likelihood_pct": result.approval_likelihood_pct,
        "deny_likelihood_pct": result.deny_likelihood_pct,
        "outcome_label": result.outcome_label,
        "outcome_label_zh": result.outcome_label_zh,
        "tariff": asdict(result.tariff),
        "tariff_if_approved": asdict(result.tariff_if_approved),
        "tariff_if_denied": asdict(result.tariff_if_denied),
        "export_margin": asdict(result.export_margin),
        "industry_illustration": asdict(result.industry_illustration),
    }
