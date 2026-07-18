"""EU CBAM installation-operator readiness score — deterministic Stage-3 scorer.

Criteria drawn from:
  Guidance Document on CBAM Implementation for Installation Operators
  Outside the EU (European Commission, DG TAXUD, 21 Nov 2023).

Dimensions map to Quick Guide §3 + Monitoring §6 + Iron & Steel §5.6/§7.2.
LLM never produces these numbers — only reads the scored result for advisory.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass


GUIDELINE = (
    "Guidance document on CBAM implementation for installation operators "
    "outside the EU (European Commission, 21 Nov 2023)"
)
GUIDELINE_SHORT = "CBAM Operator Guidance · DG TAXUD 21 Nov 2023"


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

    n_done = sum(1 for c in checklist if c.get("done"))
    n_total = len(checklist) or 9
    summary_en = (
        f"Scored {total}/100 against {GUIDELINE_SHORT} using passport checklist "
        f"({n_done}/{n_total} docs), intensity {intensity_tco2e_per_t} tCO2e/t, "
        f"and metering coverage {meter}%. "
        f"{'All veto gates passed.' if veto_passed else 'Veto gates incomplete — see Quick Guide §3.'}"
    )
    summary_zh = (
        f"依据欧委会《非欧盟装置运营方 CBAM 实施指南》（2023-11-21），结合护照清单 "
        f"{n_done}/{n_total} 份文件、强度 {intensity_tco2e_per_t} tCO2e/t、计量覆盖 {meter}%，"
        f"评分 {total}/100。"
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
    }
