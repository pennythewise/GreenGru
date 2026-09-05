"""Deterministic precursor burden — regulated numbers never from LLM."""


def precursor_burden_tco2e(*, see_precursor: float, yield_factor_m: float) -> float:
    """SEE_product includes precursor as: m_i × SEE_precursor (tCO2e / t product)."""
    if see_precursor < 0 or yield_factor_m <= 0:
        raise ValueError("see_precursor must be >= 0 and yield_factor_m > 0")
    return round(yield_factor_m * see_precursor, 6)


def yield_factor_from_scrap_pct(scrap_pct: float) -> float:
    """scrap_pct=15 → yield 85% → m = 1/0.85 ≈ 1.176."""
    if not 0 <= scrap_pct < 100:
        raise ValueError("scrap_pct must be in [0, 100)")
    yield_frac = (100.0 - scrap_pct) / 100.0
    return round(1.0 / yield_frac, 6)
