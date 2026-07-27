"""
Tests for the deterministic CBAM calculation engine.

Anchor: CN 7208 10 00 HRC, China origin, BF-BOF, 2026 — Annex I China×7208
base 3.187 tCO2e/t × 10% mark-up = 3.5057 SEE; BM 1.370 from IR 2025/2620.
Mark-up is applied once to SEE, never again to the tariff.
"""

import pytest

from app.calculation_engine import (
    ANNEX_I_CHINA_DEFAULT_SEE_TCO2E_PER_TONNE,
    CBAM_PHASE_IN_FACTOR_BY_YEAR,
    CBAMInput,
    ProductionRoute,
    annex_i_china_default_see,
    calculate_cbam_exposure,
    EU_BENCHMARK_TCO2E_PER_TONNE,
)

Q1_2026_CERT_PRICE = 75.36  # EUR/tCO2e


def test_worked_example_hrc_bf_bof_2026():
    """Annex I China×7208 @2026 — single mark-up on SEE."""
    inp = CBAMInput(
        cn_code="7208 10 00",
        route=ProductionRoute.BF_BOF,
        annual_export_tonnes=5000,
        year=2026,
    )
    result = calculate_cbam_exposure(inp, Q1_2026_CERT_PRICE)

    assert result.annex_i_base_see_tco2e_per_tonne == pytest.approx(3.187)
    assert result.intensity_tco2e_per_tonne == pytest.approx(3.187 * 1.10)
    assert result.markup_applied == 0.10
    # (3.187×1.10 − 1.370) × 75.36 — no second ×1.10
    taxable = 3.187 * 1.10 - 1.370
    assert result.taxable_emissions_tco2e_per_tonne == pytest.approx(taxable)
    assert result.gross_tariff_cost_eur_per_tonne == pytest.approx(taxable * Q1_2026_CERT_PRICE, abs=0.01)
    assert result.phase_in_factor == 0.025
    assert result.tariff_cost_eur_per_tonne == pytest.approx(
        taxable * Q1_2026_CERT_PRICE * 0.025, abs=0.01
    )
    assert result.annual_exposure_eur == pytest.approx(
        result.tariff_cost_eur_per_tonne * 5000, rel=1e-3
    )
    assert result.data_source == "china_default"


def test_fastener_7318_15_uses_higher_annex_cell():
    """China×7318 15 base 6.375 — not the 7208 cell."""
    inp = CBAMInput(
        cn_code="7318 15 88",
        route=ProductionRoute.BF_BOF,
        annual_export_tonnes=100,
        year=2026,
    )
    result = calculate_cbam_exposure(inp, Q1_2026_CERT_PRICE)
    assert result.annex_i_base_see_tco2e_per_tonne == pytest.approx(6.375)
    assert result.intensity_tco2e_per_tonne == pytest.approx(6.375 * 1.10)  # 7.0125 ≈ 7.013


@pytest.mark.parametrize("year,expected_factor", list(CBAM_PHASE_IN_FACTOR_BY_YEAR.items()) + [(2034, 1.0), (2040, 1.0)])
def test_phase_in_factor_schedule(year, expected_factor):
    inp = CBAMInput(cn_code="72081000", route=ProductionRoute.BF_BOF, annual_export_tonnes=1, year=year)
    result = calculate_cbam_exposure(inp, Q1_2026_CERT_PRICE)
    assert result.phase_in_factor == expected_factor


def test_measured_data_overrides_default_and_gets_no_markup():
    inp = CBAMInput(
        cn_code="72081000",
        route=ProductionRoute.BF_BOF,
        annual_export_tonnes=1000,
        year=2026,
        measured_intensity_tco2e_per_tonne=1.8,
    )
    result = calculate_cbam_exposure(inp, Q1_2026_CERT_PRICE)

    assert result.data_source == "measured"
    assert result.markup_applied == 0.0
    assert result.annex_i_base_see_tco2e_per_tonne is None
    assert result.gross_tariff_cost_eur_per_tonne == pytest.approx(0.43 * 75.36, rel=1e-4)
    assert result.tariff_cost_eur_per_tonne == pytest.approx(0.43 * 75.36 * 0.025, rel=1e-4)


def test_intensity_below_benchmark_owes_nothing():
    inp = CBAMInput(
        cn_code="72131000",
        route=ProductionRoute.SCRAP_EAF,
        annual_export_tonnes=1000,
        year=2026,
        measured_intensity_tco2e_per_tonne=0.05,
    )
    result = calculate_cbam_exposure(inp, Q1_2026_CERT_PRICE)

    assert result.taxable_emissions_tco2e_per_tonne == 0.0
    assert result.tariff_cost_eur_per_tonne == 0.0
    assert result.annual_exposure_eur == 0.0


@pytest.mark.parametrize(
    "year,expected_markup",
    [(2026, 0.10), (2027, 0.20), (2028, 0.30), (2029, 0.30), (2034, 0.30)],
)
def test_default_value_markup_schedule(year, expected_markup):
    inp = CBAMInput(
        cn_code="72081000",
        route=ProductionRoute.BF_BOF,
        annual_export_tonnes=100,
        year=year,
    )
    result = calculate_cbam_exposure(inp, Q1_2026_CERT_PRICE)
    assert result.markup_applied == expected_markup
    assert result.intensity_tco2e_per_tonne == pytest.approx(3.187 * (1 + expected_markup))


def test_reference_constants_unchanged():
    assert EU_BENCHMARK_TCO2E_PER_TONNE[ProductionRoute.BF_BOF] == 1.370
    assert EU_BENCHMARK_TCO2E_PER_TONNE[ProductionRoute.DRI_EAF] == 0.481
    assert EU_BENCHMARK_TCO2E_PER_TONNE[ProductionRoute.SCRAP_EAF] == 0.072
    assert ANNEX_I_CHINA_DEFAULT_SEE_TCO2E_PER_TONNE["7208"] == 3.187
    assert ANNEX_I_CHINA_DEFAULT_SEE_TCO2E_PER_TONNE["7318 15"] == 6.375
    assert annex_i_china_default_see("7208 10 00") == 3.187
    assert annex_i_china_default_see("73181588") == 6.375


def test_unknown_cn_raises():
    with pytest.raises(ValueError, match="Annex I"):
        annex_i_china_default_see("7606")


def test_determinism():
    inp = CBAMInput(
        cn_code="73181588",
        route=ProductionRoute.BF_BOF,
        annual_export_tonnes=250,
        year=2027,
    )
    r1 = calculate_cbam_exposure(inp, Q1_2026_CERT_PRICE)
    r2 = calculate_cbam_exposure(inp, Q1_2026_CERT_PRICE)
    assert r1 == r2
