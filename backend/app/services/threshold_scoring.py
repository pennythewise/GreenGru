"""Threshold scoring (PRD §8.5) — pure comparison logic, no LLM, not
generative. Compares a calculation's intensity against the EU benchmark and
CISA tier boundaries, and evaluates the de minimis question."""

from dataclasses import dataclass

from app.calculation_engine import CBAMResult
from app.data.cisa_tiers import grade_for_intensity

DE_MINIMIS_THRESHOLD_TONNES = 50.0  # PRD §6.3 / §8.5 — boundary is inclusive (<=)


@dataclass(frozen=True)
class ScoringResult:
    cisa_grade: str
    cisa_grade_is_provisional: bool
    cbam_risk_tier: str  # "exempt" | "exposed" | "high_exposure"
    gap_to_next_tier_tco2e: float | None
    de_minimis_possible: bool


def _cbam_risk_tier(taxable_emissions_tco2e_per_tonne: float, gross_tariff_cost_eur_per_tonne: float) -> str:
    """Intensity at or below the EU benchmark -> taxable emissions are
    legitimately 0 -> this is a valid, positive "exempt-tier" outcome
    (PRD §8.5), not an error state. Otherwise, split "exposed" vs
    "high_exposure" on the (arbitrary but documented) gross cost per tonne —
    using the *gross* (fully phased-in) figure for this tier split so the
    exposed/high-exposure distinction reflects long-run risk, not a
    temporarily small phase-in-adjusted number."""
    if taxable_emissions_tco2e_per_tonne <= 0:
        return "exempt"
    if gross_tariff_cost_eur_per_tonne >= 150.0:
        return "high_exposure"
    return "exposed"


def score_calculation(result: CBAMResult, annual_export_tonnes: float, route: str = "BF-BOF") -> ScoringResult:
    grade_result = grade_for_intensity(result.intensity_tco2e_per_tonne, route=route)
    risk_tier = _cbam_risk_tier(result.taxable_emissions_tco2e_per_tonne, result.gross_tariff_cost_eur_per_tonne)

    # PRD §8.5: the CBAM de minimis exemption is assessed per EU *importer*
    # per year, not per exporter — the SME's own tonnage being under the
    # threshold makes the exemption *possible*, never guaranteed. Boundary
    # value of exactly 50t is treated as within the threshold (<=).
    de_minimis_possible = annual_export_tonnes <= DE_MINIMIS_THRESHOLD_TONNES

    return ScoringResult(
        cisa_grade=grade_result.grade,
        cisa_grade_is_provisional=grade_result.is_provisional,
        cbam_risk_tier=risk_tier,
        gap_to_next_tier_tco2e=grade_result.gap_to_next_grade_tco2e,
        de_minimis_possible=de_minimis_possible,
    )
