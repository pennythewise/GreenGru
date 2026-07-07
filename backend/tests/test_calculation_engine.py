import pytest

from app.calculation_engine import (
    CBAMInput,
    ProductionRoute,
    calculate_cbam_exposure,
    phase_in_factor_for_year,
)


def test_worked_example_gross_matches_original_build_spec():
    """The original build spec's €177/tonne worked example is the GROSS
    (fully-phased-in) figure — see calculation_engine.py's module comment
    on why the phase-in factor changes what a 2026 passport actually shows."""
    example = CBAMInput(cn_code="72081000", route=ProductionRoute.BF_BOF, annual_export_tonnes=5000, year=2026)
    result = calculate_cbam_exposure(example, certificate_price_eur_per_tco2e=75.36)
    assert result.gross_tariff_cost_eur_per_tonne == pytest.approx(177.07, abs=0.01)


def test_worked_example_net_applies_2026_phase_in():
    example = CBAMInput(cn_code="72081000", route=ProductionRoute.BF_BOF, annual_export_tonnes=5000, year=2026)
    result = calculate_cbam_exposure(example, certificate_price_eur_per_tco2e=75.36)
    assert result.phase_in_factor == pytest.approx(0.025)
    assert result.tariff_cost_eur_per_tonne == pytest.approx(4.4266, abs=0.001)
    assert result.annual_exposure_eur == pytest.approx(result.tariff_cost_eur_per_tonne * 5000, abs=0.01)


@pytest.mark.parametrize(
    "year,expected_factor",
    [
        (2026, 0.025),
        (2027, 0.05),
        (2028, 0.10),
        (2029, 0.225),
        (2030, 0.485),
        (2031, 0.61),
        (2032, 0.735),
        (2033, 0.86),
        (2034, 1.0),
        (2040, 1.0),
    ],
)
def test_phase_in_factor_schedule(year, expected_factor):
    assert phase_in_factor_for_year(year) == pytest.approx(expected_factor)


def test_net_and_gross_diverge_before_2034_and_converge_from_2034():
    """PRD §8.11 edge case #12."""
    for year in range(2026, 2034):
        example = CBAMInput(cn_code="7301", route=ProductionRoute.BF_BOF, annual_export_tonnes=100, year=year)
        result = calculate_cbam_exposure(example, certificate_price_eur_per_tco2e=75.36)
        assert result.tariff_cost_eur_per_tonne < result.gross_tariff_cost_eur_per_tonne

    for year in (2034, 2035, 2040):
        example = CBAMInput(cn_code="7301", route=ProductionRoute.BF_BOF, annual_export_tonnes=100, year=year)
        result = calculate_cbam_exposure(example, certificate_price_eur_per_tco2e=75.36)
        assert result.tariff_cost_eur_per_tonne == pytest.approx(result.gross_tariff_cost_eur_per_tonne)


def test_measured_data_overrides_china_default_and_is_never_marked_up():
    example = CBAMInput(
        cn_code="7301",
        route=ProductionRoute.BF_BOF,
        annual_export_tonnes=100,
        year=2026,
        measured_intensity_tco2e_per_tonne=1.5,
    )
    result = calculate_cbam_exposure(example, certificate_price_eur_per_tco2e=75.36)
    assert result.data_source == "measured"
    assert result.markup_applied == 0.0


def test_intensity_at_or_below_benchmark_is_zero_taxable_not_an_error():
    example = CBAMInput(
        cn_code="7213",
        route=ProductionRoute.SCRAP_EAF,
        annual_export_tonnes=100,
        year=2026,
        measured_intensity_tco2e_per_tonne=0.05,
    )
    result = calculate_cbam_exposure(example, certificate_price_eur_per_tco2e=75.36)
    assert result.taxable_emissions_tco2e_per_tonne == 0.0
    assert result.tariff_cost_eur_per_tonne == 0.0


@pytest.mark.parametrize("bad_year", [2020, 2025])
def test_pre_2026_year_is_a_hard_error(bad_year):
    example = CBAMInput(cn_code="7301", route=ProductionRoute.BF_BOF, annual_export_tonnes=100, year=bad_year)
    with pytest.raises(ValueError, match="2026"):
        calculate_cbam_exposure(example, certificate_price_eur_per_tco2e=75.36)


def test_negative_export_tonnes_is_a_hard_error():
    example = CBAMInput(cn_code="7301", route=ProductionRoute.BF_BOF, annual_export_tonnes=-1, year=2026)
    with pytest.raises(ValueError):
        calculate_cbam_exposure(example, certificate_price_eur_per_tco2e=75.36)


def test_non_positive_measured_intensity_is_a_hard_error():
    example = CBAMInput(
        cn_code="7301", route=ProductionRoute.BF_BOF, annual_export_tonnes=100, year=2026, measured_intensity_tco2e_per_tonne=0
    )
    with pytest.raises(ValueError):
        calculate_cbam_exposure(example, certificate_price_eur_per_tco2e=75.36)


def test_non_positive_certificate_price_is_a_hard_error():
    example = CBAMInput(cn_code="7301", route=ProductionRoute.BF_BOF, annual_export_tonnes=100, year=2026)
    with pytest.raises(ValueError):
        calculate_cbam_exposure(example, certificate_price_eur_per_tco2e=0)
