"""
Deterministic CBAM carbon passport calculation engine.

No LLM anywhere in this file. Every number this module produces must be
traceable to a cited regulatory value.

Default embedded emissions (when the declarant has no verified installation
data) come from Commission Implementing Regulation (EU) 2025/2621 Annex I
— country × CN code. They are NOT taken from a Chinese domestic GHG factor
database. Free-allocation benchmarks come from IR (EU) 2025/2620 (route
indicators C/D/E cross-referenced by 2621 Annex I notes).
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Optional


class ProductionRoute(Enum):
    BF_BOF = "BF-BOF"  # 高炉-转炉 (blast furnace - basic oxygen furnace)
    DRI_EAF = "DRI-EAF"  # 直接还原铁-电弧炉
    SCRAP_EAF = "scrap-EAF"  # 废钢-电弧炉


# --- Official reference data -------------------------------------------
# Update only when the source regulation updates; keep citations attached.

# Source: Commission Implementing Regulation (EU) 2025/2620 — CBAM free-
# allocation / benchmark (BM) by underlying production route.
EU_BENCHMARK_TCO2E_PER_TONNE = {
    ProductionRoute.BF_BOF: 1.370,  # route (C) carbon steel BF/BOF
    ProductionRoute.DRI_EAF: 0.481,  # route (D)
    ProductionRoute.SCRAP_EAF: 0.072,  # route (E)
}

# Source: IR (EU) 2025/2621 Annex I — China table, "Default Value (total
# emissions)" column (direct; indirect N/A for iron & steel Annex II goods).
# Verified against EUR-Lex CELEX 32025R2621 (European decimal comma → float).
# Year columns already publish "including mark-up"; this engine stores the
# *pre-mark-up* total and applies MARKUP_BY_YEAR once — never twice.
#
# Locked CN scope (PRD §6.1) → China cells used here:
ANNEX_I_CHINA_DEFAULT_SEE_TCO2E_PER_TONNE: dict[str, float] = {
    "7207": 3.169,  # representative semi-finished (e.g. 7207 11 14 / 7207 12 10)
    "7208": 3.187,  # heading 7208 hot-rolled flat ≥600 mm
    "7208 10 00": 3.187,
    "7213": 3.169,
    "7214": 3.169,  # e.g. 7214 20 00
    "7301": 2.275,
    "7302": 6.205,
    "7318 15": 6.375,
    "7318 15 42": 6.375,
    "7318 15 88": 6.375,
    "7326": 3.076,  # e.g. 7326 11 00 / 7326 90 98 family
}

# Legacy route-level proxy for non-CBAM widgets (CISA dashboard). BF-BOF uses
# Annex I China×7208 *pre-mark-up* SEE — not a China GHG Factor DB figure.
# DRI-EAF / scrap-EAF remain worldsteel 2024 globals (interim) until Annex I
# route-(D)/(E) cells are wired per CN.
CHINA_DEFAULT_INTENSITY_TCO2E_PER_TONNE = {
    ProductionRoute.BF_BOF: ANNEX_I_CHINA_DEFAULT_SEE_TCO2E_PER_TONNE["7208"],
    ProductionRoute.DRI_EAF: 1.47,
    ProductionRoute.SCRAP_EAF: 0.69,
}

# Source: IR 2025/2621 Annex I year columns / Annex IV point 4.1 — mark-up on
# default (non-verified) SEE only. Measured data is never marked up.
# Applied once: intensity_used = base_see × (1 + markup). Do not also multiply
# the tariff by (1 + markup).
MARKUP_BY_YEAR = {2026: 0.10, 2027: 0.20, 2028: 0.30}

# Source: Regulation (EU) 2023/956 Article 31(3) + Directive 2003/87/EC
# Article 10a(1a) — CBAM certificate phase-in factor. Distinct from mark-up.
CBAM_PHASE_IN_FACTOR_BY_YEAR = {
    2026: 0.025,
    2027: 0.05,
    2028: 0.10,
    2029: 0.225,
    2030: 0.485,
    2031: 0.61,
    2032: 0.735,
    2033: 0.86,
}
CBAM_PHASE_IN_FACTOR_FULL_FROM_YEAR = 2034


def normalize_cn_code(cn_code: str) -> str:
    """Normalize CN strings ('72081000', '7208 10 00', 'CN 7208') for lookup."""
    raw = (cn_code or "").strip()
    # Classifier sometimes emits "7213 / 7214" — use the first heading.
    if "/" in raw:
        raw = raw.split("/", 1)[0].strip()
    digits = "".join(ch for ch in raw if ch.isdigit())
    if len(digits) >= 8:
        return f"{digits[:4]} {digits[4:6]} {digits[6:8]}"
    if len(digits) >= 6:
        return f"{digits[:4]} {digits[4:6]}"
    if len(digits) >= 4:
        return digits[:4]
    return raw


def annex_i_china_default_see(cn_code: str) -> float:
    """Pre-mark-up Annex I China default SEE (tCO2e/t) for a CN code.

    Raises ValueError if the code is outside the locked table — never invent
    a default.
    """
    normalized = normalize_cn_code(cn_code)
    if normalized in ANNEX_I_CHINA_DEFAULT_SEE_TCO2E_PER_TONNE:
        return ANNEX_I_CHINA_DEFAULT_SEE_TCO2E_PER_TONNE[normalized]

    # Longest-prefix match on spaced keys (e.g. 7318 15 88 → 7318 15)
    digits = "".join(ch for ch in normalized if ch.isdigit())
    candidates: list[tuple[int, str]] = []
    for key in ANNEX_I_CHINA_DEFAULT_SEE_TCO2E_PER_TONNE:
        key_digits = "".join(ch for ch in key if ch.isdigit())
        if digits.startswith(key_digits):
            candidates.append((len(key_digits), key))
    if candidates:
        candidates.sort(reverse=True)
        return ANNEX_I_CHINA_DEFAULT_SEE_TCO2E_PER_TONNE[candidates[0][1]]

    raise ValueError(
        f"No IR 2025/2621 Annex I China default SEE for CN {cn_code!r} "
        f"(normalized={normalized!r}). Locked codes only — do not invent."
    )


def markup_for_year(year: int) -> float:
    if year <= 2026:
        return MARKUP_BY_YEAR[2026]
    if year == 2027:
        return MARKUP_BY_YEAR[2027]
    return MARKUP_BY_YEAR[2028]  # 2028+ plateau


@dataclass
class CBAMInput:
    cn_code: str
    route: ProductionRoute
    annual_export_tonnes: float
    year: int
    # Verified installation-level data always overrides Annex I default.
    measured_intensity_tco2e_per_tonne: Optional[float] = None


def phase_in_factor_for_year(year: int) -> float:
    if year >= CBAM_PHASE_IN_FACTOR_FULL_FROM_YEAR:
        return 1.0
    return CBAM_PHASE_IN_FACTOR_BY_YEAR[year]


@dataclass
class CBAMResult:
    intensity_tco2e_per_tonne: float
    # "measured" or "china_default" (= EU Annex I China×CN default path)
    data_source: str
    benchmark_tco2e_per_tonne: float
    taxable_emissions_tco2e_per_tonne: float
    certificate_price_eur_per_tco2e: float
    markup_applied: float
    phase_in_factor: float
    tariff_cost_eur_per_tonne: float
    gross_tariff_cost_eur_per_tonne: float
    annual_exposure_eur: float
    # Pre-mark-up Annex I cell when on default path; None if measured
    annex_i_base_see_tco2e_per_tonne: float | None = None


def calculate_cbam_exposure(
    inp: CBAMInput,
    certificate_price_eur_per_tco2e: float,
) -> CBAMResult:
    """Pure function. Same input always produces the same output."""

    if inp.year < 2026:
        raise ValueError(f"CBAM definitive regime starts 2026; got year={inp.year}")
    if inp.annual_export_tonnes < 0:
        raise ValueError(f"annual_export_tonnes must be >= 0; got {inp.annual_export_tonnes}")
    if inp.measured_intensity_tco2e_per_tonne is not None and inp.measured_intensity_tco2e_per_tonne <= 0:
        raise ValueError(
            f"measured intensity must be > 0; got {inp.measured_intensity_tco2e_per_tonne}"
        )
    if certificate_price_eur_per_tco2e <= 0:
        raise ValueError(f"certificate price must be > 0; got {certificate_price_eur_per_tco2e}")

    annex_base: float | None = None

    # Step 1 — verified data wins; else Annex I China × CN (pre-mark-up × year mark-up once)
    if inp.measured_intensity_tco2e_per_tonne is not None:
        intensity = inp.measured_intensity_tco2e_per_tonne
        source = "measured"
        markup = 0.0
    else:
        annex_base = annex_i_china_default_see(inp.cn_code)
        markup = markup_for_year(inp.year)
        intensity = annex_base * (1.0 + markup)
        source = "china_default"

    # Step 2 — subtract free-allocation BM for the declared route
    benchmark = EU_BENCHMARK_TCO2E_PER_TONNE[inp.route]
    taxable = max(0.0, intensity - benchmark)

    # Step 3 — certificate cost (mark-up already in intensity when default;
    # do NOT multiply by (1+markup) again)
    gross_tariff_cost = taxable * certificate_price_eur_per_tco2e

    # Step 4 — phase-in factor (Art. 31(3)) — everyone, measured or default
    phase_in = phase_in_factor_for_year(inp.year)
    tariff_cost = gross_tariff_cost * phase_in
    annual_exposure = tariff_cost * inp.annual_export_tonnes

    return CBAMResult(
        intensity_tco2e_per_tonne=intensity,
        data_source=source,
        benchmark_tco2e_per_tonne=benchmark,
        taxable_emissions_tco2e_per_tonne=taxable,
        certificate_price_eur_per_tco2e=certificate_price_eur_per_tco2e,
        markup_applied=markup,
        phase_in_factor=phase_in,
        tariff_cost_eur_per_tonne=tariff_cost,
        gross_tariff_cost_eur_per_tonne=gross_tariff_cost,
        annual_exposure_eur=annual_exposure,
        annex_i_base_see_tco2e_per_tonne=annex_base,
    )


if __name__ == "__main__":
    example = CBAMInput(
        cn_code="7208 10 00",
        route=ProductionRoute.BF_BOF,
        annual_export_tonnes=5000,
        year=2026,
    )
    result = calculate_cbam_exposure(example, certificate_price_eur_per_tco2e=75.36)
    print(result)
    # intensity = 3.187 × 1.10 = 3.5057 ≈ Annex I 2026 column 3.506
    # taxable = 3.5057 − 1.370; gross = taxable × 75.36 (no second mark-up)
    # net 2026 = gross × 0.025
