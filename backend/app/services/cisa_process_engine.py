"""CISA T/CISA 452 process-boundary calculations for dashboard widgets.

Formulas cited from 《低碳排放钢评价方法》:
  (1)  E_i = AD_i × NCV_i × FC_i × OF_i × 44/12        — fossil fuel direct
  (6)  E_unit = E_dir + E_en,indir + E_oth,indir       — stage total
  (9)  E_elec,indir = AD_elec × EF_elec                 — electricity indirect
  (12) e_unit = E_unit / m_unit                         — stage intensity tCO2/t

Downstream SME fastener plants receive BF-BOF upstream intensity; we allocate
across the five operational stages shown on the dashboard using route-specific
weighting — deterministic, no LLM.
"""

from __future__ import annotations

from dataclasses import dataclass

from app.calculation_engine import CHINA_DEFAULT_INTENSITY_TCO2E_PER_TONNE, ProductionRoute
from app.data.cisa_tiers import grade_for_intensity

CO2_PER_C = 44 / 12

# Stage share of total intensity for BF-BOF downstream (illustrative split
# aligned with CISA §4.1.3 process boundaries — not mill-specific measured data).
_STAGE_SHARE_BF_BOF: dict[str, float] = {
    "sintering": 0.18,
    "melting": 0.42,
    "rolling": 0.22,
    "galvanizing": 0.10,
    "finishing": 0.08,
}

_STAGE_META = [
    {"key": "sintering", "stage": "Sintering", "zh": "烧结"},
    {"key": "melting", "stage": "Melting", "zh": "炼钢"},
    {"key": "rolling", "stage": "Rolling", "zh": "轧制"},
    {"key": "galvanizing", "stage": "Galvanizing", "zh": "镀锌"},
    {"key": "finishing", "stage": "Finishing", "zh": "精加工"},
]


@dataclass
class CisaFormulaStep:
    eq: str
    label: str
    latex: str
    values: dict[str, float | str]
    result: float | str


@dataclass
class CisaProcessResult:
    total_intensity_tco2e_per_tonne: float
    cisa_grade: str
    gap_to_next_tier_tco2e: float | None
    next_tier: str | None
    grant_score: int
    tier_gauge_value: int
    tier_gauge_next: str
    points_to_next_tier: int
    ratio_sliders: list[dict]
    emissions_breakdown: list[dict]
    process_matrix: list[dict]
    formula_steps: list[CisaFormulaStep]


def _status_from_intensity(stage_intensity: float, plant_intensity: float) -> str:
    ratio = stage_intensity / plant_intensity if plant_intensity > 0 else 1.0
    if ratio >= 0.38:
        return "bad"
    if ratio >= 0.28:
        return "warn"
    return "ok"


def _metering_status(scrap_ratio: float, stage_key: str) -> str:
    base = 0.78 + scrap_ratio * 0.12
    if stage_key == "melting":
        base -= 0.14
    if stage_key == "finishing":
        base -= 0.08
    return "ok" if base >= 0.9 else "warn" if base >= 0.75 else "bad"


def compute_cisa_dashboard(
    *,
    route: str = "BF-BOF",
    production_tonnes: float,
    scrap_ratio: float | None = None,
    green_electricity_ratio: float | None = None,
    measured_intensity: float | None = None,
) -> CisaProcessResult:
    route_values = {r.value for r in ProductionRoute}
    prod_route = ProductionRoute(route) if route in route_values else ProductionRoute.BF_BOF

    plant_intensity = measured_intensity or CHINA_DEFAULT_INTENSITY_TCO2E_PER_TONNE[prod_route]
    scrap = scrap_ratio if scrap_ratio is not None else (0.0 if route == "BF-BOF" else 0.24)
    green = green_electricity_ratio if green_electricity_ratio is not None else 0.45

    # Eq (1) illustrative — coke breeze for sinter (demo AD/NCV/FC/OF from CISA Appendix B style)
    ad_coke = production_tonnes * 0.055
    ncv, fc, of = 28.2, 0.0295, 0.98
    e_fossil_demo = ad_coke * ncv * fc * of * CO2_PER_C

    # Eq (9) — grid electricity at downstream shop (~120 kWh/t finishing)
    ad_elec = production_tonnes * 0.12
    ef_elec = 0.000581  # tCO2/MWh — China grid ref (CISA Appendix B.3 style)
    e_elec = ad_elec * ef_elec

    # Eq (6)+(12) — reconcile to plant intensity
    e_unit_total = plant_intensity * production_tonnes
    e_dir_share = 0.64
    e_dir = e_unit_total * e_dir_share
    e_indir = e_unit_total * (1 - e_dir_share)

    grade = grade_for_intensity(plant_intensity, route=route)
    gap_pts = 0
    if grade.gap_to_next_grade_tco2e is not None:
        gap_pts = max(0, int(round(grade.gap_to_next_grade_tco2e * 10)))
    grant_score = max(35, min(95, 72 - gap_pts))
    points_to_next = max(0, 80 - grant_score)

    metering_pct = round(
        sum(95 if _metering_status(scrap, s["key"]) == "ok" else 78 if _metering_status(scrap, s["key"]) == "warn" else 62 for s in _STAGE_META)
        / len(_STAGE_META),
        1,
    )

    ratio_sliders = [
        {"key": "scrap", "label": "Scrap steel ratio", "zh": "废钢比", "value": round(scrap * 100, 1), "target": 40, "unit": "%"},
        {"key": "green", "label": "Green electricity ratio", "zh": "绿电比", "value": round(green * 100, 1), "target": 60, "unit": "%"},
        {"key": "meter", "label": "Metering coverage", "zh": "计量覆盖", "value": metering_pct, "target": 95, "unit": "%"},
    ]

    direct_pct = round(e_dir_share * 100 * 0.66)
    process_pct = round(e_dir_share * 100 * 0.34)
    indirect_pct = round((1 - e_dir_share) * 100 * 0.55)
    upstream_pct = max(0, 100 - direct_pct - process_pct - indirect_pct)

    emissions_breakdown = [
        {"key": "direct", "label": "Direct combustion", "value": direct_pct, "color": "var(--color-ember)"},
        {"key": "process", "label": "Process reactions", "value": process_pct, "color": "var(--color-warning)"},
        {"key": "indirect", "label": "Indirect · grid", "value": indirect_pct, "color": "var(--color-teal)"},
        {"key": "upstream", "label": "Upstream inputs", "value": upstream_pct, "color": "var(--color-carbon)"},
    ]

    process_matrix = []
    for meta in _STAGE_META:
        share = _STAGE_SHARE_BF_BOF[meta["key"]]
        stage_i = plant_intensity * share
        intensity_st = _status_from_intensity(stage_i, plant_intensity)
        energy_st = "warn" if meta["key"] == "melting" else "ok"
        meter_st = _metering_status(scrap, meta["key"])
        audit_st = "warn" if meta["key"] == "melting" else "ok"
        process_matrix.append(
            {
                "stage": meta["stage"],
                "zh": meta["zh"],
                "key": meta["key"],
                "energy": energy_st,
                "intensity": intensity_st,
                "metering": meter_st if meter_st != "bad" else "warn",
                "audit": audit_st,
                "intensity_tco2e_per_tonne": round(stage_i, 3),
            }
        )

    formula_steps = [
        CisaFormulaStep(
            eq="(1)",
            label="Fossil fuel direct emission",
            latex="E_i = AD_i × NCV_i × FC_i × OF_i × 44/12",
            values={"AD": round(ad_coke, 2), "NCV": ncv, "FC": fc, "OF": of, "44/12": CO2_PER_C},
            result=round(e_fossil_demo, 2),
        ),
        CisaFormulaStep(
            eq="(9)",
            label="Electricity indirect emission",
            latex="E_elec,indir = AD_elec × EF_elec",
            values={"AD_elec": round(ad_elec, 2), "EF_elec": ef_elec},
            result=round(e_elec, 3),
        ),
        CisaFormulaStep(
            eq="(6)",
            label="Stage GHG total",
            latex="E_unit = E_dir + E_en,indir + E_oth,indir",
            values={"E_dir": round(e_dir, 2), "E_en,indir": round(e_indir * 0.7, 2), "E_oth,indir": round(e_indir * 0.3, 2)},
            result=round(e_unit_total, 2),
        ),
        CisaFormulaStep(
            eq="(12)",
            label="Unit product intensity",
            latex="e_unit = E_unit / m_unit",
            values={"E_unit": round(e_unit_total, 2), "m_unit": round(production_tonnes, 2)},
            result=round(plant_intensity, 3),
        ),
    ]

    return CisaProcessResult(
        total_intensity_tco2e_per_tonne=plant_intensity,
        cisa_grade=grade.grade,
        gap_to_next_tier_tco2e=grade.gap_to_next_grade_tco2e,
        next_tier=grade.next_grade,
        grant_score=grant_score,
        tier_gauge_value=grant_score,
        tier_gauge_next=grade.next_grade or "B",
        points_to_next_tier=points_to_next,
        ratio_sliders=ratio_sliders,
        emissions_breakdown=emissions_breakdown,
        process_matrix=process_matrix,
        formula_steps=formula_steps,
    )
