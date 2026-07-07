"""
Tests for the deterministic CBAM calculation engine.

The anchor test reproduces the PRD §11 worked example: CN 7208 10 00
hot-rolled coil, BF-BOF route, 2026 → ≈ €177/tonne. If that test breaks,
the formula logic has drifted from the validated reference — do not
"fix" the test; fix the engine.
"""

import pytest

from app.engine.calculation import (
    CBAMInput,
    ProductionRoute,
    calculate_cbam_exposure,
    CHINA_DEFAULT_INTENSITY_TCO2E_PER_TONNE,
    EU_BENCHMARK_TCO2E_PER_TONNE,
)

Q1_2026_CERT_PRICE = 75.36  # EUR/tCO2e, PRD §6.2 — refreshed quarterly


def test_worked_example_hrc_bf_bof_2026():
    """PRD §11: HRC, BF-BOF, default value, 2026 → ≈ €177/tonne."""
    inp = CBAMInput(
        cn_code="72081000",
        route=ProductionRoute.BF_BOF,
        annual_export_tonnes=5000,
        year=2026,
    )
    result = calculate_cbam_exposure(inp, Q1_2026_CERT_PRICE)

    # (3.506 − 1.370) × 75.36 × 1.10 = 177.07
    assert result.tariff_cost_eur_per_tonne == pytest.approx(177.07, abs=0.01)
    assert result.annual_exposure_eur == pytest.approx(177.07 * 5000, rel=1e-4)
    assert result.data_source == "china_default"
    assert result.markup_applied == 0.10


def test_measured_data_overrides_default_and_gets_no_markup():
    """Verified installation data always wins, and is never marked up —
    this asymmetry is the product's core incentive (get measured, pay less)."""
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
    # (1.8 − 1.370) × 75.36 × 1.0
    assert result.tariff_cost_eur_per_tonne == pytest.approx(0.43 * 75.36, rel=1e-4)


def test_intensity_below_benchmark_owes_nothing():
    """Taxable emissions floor at zero — no negative tariff."""
    inp = CBAMInput(
        cn_code="72131000",
        route=ProductionRoute.SCRAP_EAF,
        annual_export_tonnes=1000,
        year=2026,
        measured_intensity_tco2e_per_tonne=0.05,  # below 0.072 benchmark
    )
    result = calculate_cbam_exposure(inp, Q1_2026_CERT_PRICE)

    assert result.taxable_emissions_tco2e_per_tonne == 0.0
    assert result.tariff_cost_eur_per_tonne == 0.0
    assert result.annual_exposure_eur == 0.0


@pytest.mark.parametrize(
    "year,expected_markup",
    [(2026, 0.10), (2027, 0.20), (2028, 0.30), (2029, 0.30), (2034, 0.30)],
)
def test_phase_in_markup_schedule(year, expected_markup):
    """EU IR 2025/2621 phase-in: 10%/20%/30%, capped at 30% thereafter."""
    inp = CBAMInput(
        cn_code="72081000",
        route=ProductionRoute.BF_BOF,
        annual_export_tonnes=100,
        year=year,
    )
    result = calculate_cbam_exposure(inp, Q1_2026_CERT_PRICE)
    assert result.markup_applied == expected_markup


def test_reference_constants_unchanged():
    """Regulatory constants must match their cited sources (PRD §6.2).
    BF-BOF default 3.506 is the only China-DB value confirmed; DRI-EAF and
    scrap-EAF are known placeholders (INVENTORY.md item 5) — this test pins
    the confirmed values only."""
    assert EU_BENCHMARK_TCO2E_PER_TONNE[ProductionRoute.BF_BOF] == 1.370
    assert EU_BENCHMARK_TCO2E_PER_TONNE[ProductionRoute.DRI_EAF] == 0.481
    assert EU_BENCHMARK_TCO2E_PER_TONNE[ProductionRoute.SCRAP_EAF] == 0.072
    assert CHINA_DEFAULT_INTENSITY_TCO2E_PER_TONNE[ProductionRoute.BF_BOF] == 3.506


def test_determinism():
    """Same input, same output — the reproducibility claim on the passport."""
    inp = CBAMInput(
        cn_code="73181588",
        route=ProductionRoute.BF_BOF,
        annual_export_tonnes=250,
        year=2027,
    )
    r1 = calculate_cbam_exposure(inp, Q1_2026_CERT_PRICE)
    r2 = calculate_cbam_exposure(inp, Q1_2026_CERT_PRICE)
    assert r1 == r2
