import pytest

from app.calculation_engine import CBAMInput, ProductionRoute, calculate_cbam_exposure
from app.services.threshold_scoring import DE_MINIMIS_THRESHOLD_TONNES, score_calculation


def _calc(intensity=None, route=ProductionRoute.BF_BOF, year=2026):
    example = CBAMInput(
        cn_code="7301", route=route, annual_export_tonnes=100, year=year, measured_intensity_tco2e_per_tonne=intensity
    )
    return calculate_cbam_exposure(example, certificate_price_eur_per_tco2e=75.36)


def test_grade_a_for_near_zero_intensity():
    # BF-BOF (0% scrap) Grade A boundary per the CISA draft standard's Table 1/2
    # formula is 0.15 tCO2/t-crude-steel (a=0.15, b=0.04, alpha=0 at 0% scrap).
    result = score_calculation(_calc(intensity=0.1), annual_export_tonnes=100)
    assert result.cisa_grade == "A"
    assert result.cisa_grade_is_provisional is True


def test_grade_e_for_china_default_bf_bof():
    result = score_calculation(_calc(), annual_export_tonnes=5000)  # uses china_default 3.506
    assert result.cisa_grade == "E"


def test_cbam_risk_tier_exempt_when_taxable_is_zero():
    result = score_calculation(_calc(intensity=1.0), annual_export_tonnes=100)  # below BF-BOF benchmark 1.370
    assert result.cbam_risk_tier == "exempt"


def test_de_minimis_boundary_is_inclusive():
    calc = _calc(intensity=3.5)
    at_boundary = score_calculation(calc, annual_export_tonnes=DE_MINIMIS_THRESHOLD_TONNES)
    just_over = score_calculation(calc, annual_export_tonnes=DE_MINIMIS_THRESHOLD_TONNES + 0.01)
    assert at_boundary.de_minimis_possible is True
    assert just_over.de_minimis_possible is False


def test_de_minimis_is_named_possible_not_exempt():
    """PRD §8.5 — field name and semantics must never imply a guarantee."""
    result = score_calculation(_calc(intensity=3.5), annual_export_tonnes=10)
    assert hasattr(result, "de_minimis_possible")
    assert not hasattr(result, "de_minimis_exempt")
