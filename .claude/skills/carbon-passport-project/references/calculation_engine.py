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
# emissions)" column (direct; indirect N/A for iron & steel Annex II goods),
# AS CORRECTED by IR (EU) 2026/1740 (OJ L, 31 Jul 2026; applies retroactively
# from 1 Jan 2026). All eight China cells below were re-read from the
# corrected annex (CELEX 32026R1740) on 2026-09-17 — values unchanged.
# 2026/1740 also DELETED the pre-computed "including mark-up" year columns;
# the mark-up is now applied by the declarant/registry on the total-emissions
# cell, which is exactly what this engine does via MARKUP_BY_YEAR — once,
# never twice.
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

# Source: Directive 2003/87/EC Article 10a(1a) (as amended by 2023/959) —
# the "CBAM factor": the share of the EU ETS benchmark that EU producers
# STILL receive as free allocation in year y. Regulation (EU) 2023/956
# Art. 31(1) + IR (EU) 2025/2620 (free allocation adjustment act) mirror it
# on imports: the declarant deducts CBAM_factor × CSCF × benchmark from the
# embedded emissions, and surrenders certificates for the remainder.
#
#   certificates/t = max(0, SEE − CBAM_factor_y × CSCF_y × BM)
#
# It is NOT a multiplier on the whole liability — (SEE − BM) × 2.5% would
# understate the 2026 obligation for Chinese BF-BOF steel by ~40×. See
# Commission Guidance No. 4 (Aug 2026) §2.2.1.1 Eq. 1–2 and Table 2-1.
CBAM_FACTOR_FREE_ALLOCATION_BY_YEAR = {
    2026: 0.975,
    2027: 0.95,
    2028: 0.90,
    2029: 0.775,
    2030: 0.515,
    2031: 0.39,
    2032: 0.265,
    2033: 0.14,
}
CBAM_FACTOR_ZERO_FROM_YEAR = 2034  # no free allocation for CBAM goods from 2034

# Cross-sectoral correction factor (Directive 2003/87/EC Art. 10a(5)). The
# Commission has not yet published 2026–2030 values; Guidance No. 4 Table 2-1
# lists 1.0 as preliminary. Replace when published — do not leave stale.
CSCF_BY_YEAR: dict[int, float] = {}
CSCF_PRELIMINARY_DEFAULT = 1.0

# Convenience view kept for callers/tests that reason in "share of the
# benchmark that is no longer free" terms (2.5% in 2026 → 100% in 2034).
# Informational only — never multiply the tariff by this.
CBAM_PHASE_IN_FACTOR_BY_YEAR = {
    y: round(1.0 - f, 3) for y, f in CBAM_FACTOR_FREE_ALLOCATION_BY_YEAR.items()
}
CBAM_PHASE_IN_FACTOR_FULL_FROM_YEAR = CBAM_FACTOR_ZERO_FROM_YEAR


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


def cbam_factor_for_year(year: int) -> float:
    """Share of the benchmark still granted as free allocation in `year`."""
    if year >= CBAM_FACTOR_ZERO_FROM_YEAR:
        return 0.0
    return CBAM_FACTOR_FREE_ALLOCATION_BY_YEAR[year]


def cscf_for_year(year: int) -> float:
    return CSCF_BY_YEAR.get(year, CSCF_PRELIMINARY_DEFAULT)


def phase_in_factor_for_year(year: int) -> float:
    """1 − CBAM factor: the share of the benchmark the importer now pays for.
    Informational; the engine never multiplies the tariff by it."""
    return round(1.0 - cbam_factor_for_year(year), 3)


@dataclass
class CBAMResult:
    intensity_tco2e_per_tonne: float
    # "measured" or "china_default" (= EU Annex I China×CN default path)
    data_source: str
    benchmark_tco2e_per_tonne: float
    # Certificates owed per tonne THIS year = max(0, SEE − free allocation)
    taxable_emissions_tco2e_per_tonne: float
    certificate_price_eur_per_tco2e: float
    markup_applied: float
    # 1 − CBAM factor (2.5% in 2026). Display only — see module notes.
    phase_in_factor: float
    # Net cost this year = taxable × price
    tariff_cost_eur_per_tonne: float
    # 2034 steady state: no free allocation → SEE × price
    gross_tariff_cost_eur_per_tonne: float
    annual_exposure_eur: float
    # Pre-mark-up Annex I cell when on default path; None if measured
    annex_i_base_see_tco2e_per_tonne: float | None = None
    # Free-allocation deduction actually applied (IR 2025/2620 Eq. 2)
    cbam_factor: float = 0.0
    cscf: float = CSCF_PRELIMINARY_DEFAULT
    free_allocation_tco2e_per_tonne: float = 0.0


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

    # Step 2 — free allocation adjustment (IR 2025/2620 Annex pt. 2, Eq. 2):
    # SFA = CBAM_factor_y × CSCF_y × BM for the declared route. This is the
    # only place the phase-in enters — as a shrinking deduction, not a
    # multiplier on the liability. Everyone, measured or default.
    benchmark = EU_BENCHMARK_TCO2E_PER_TONNE[inp.route]
    cbam_factor = cbam_factor_for_year(inp.year)
    cscf = cscf_for_year(inp.year)
    free_allocation = cbam_factor * cscf * benchmark
    taxable = max(0.0, intensity - free_allocation)

    # Step 3 — certificate cost this year (mark-up already in intensity when
    # default; do NOT multiply by (1+markup) again)
    tariff_cost = taxable * certificate_price_eur_per_tco2e
    annual_exposure = tariff_cost * inp.annual_export_tonnes

    # Step 4 — 2034 steady state for planning: CBAM factor = 0, so the whole
    # SEE is priced.
    gross_tariff_cost = intensity * certificate_price_eur_per_tco2e

    return CBAMResult(
        intensity_tco2e_per_tonne=intensity,
        data_source=source,
        benchmark_tco2e_per_tonne=benchmark,
        taxable_emissions_tco2e_per_tonne=taxable,
        certificate_price_eur_per_tco2e=certificate_price_eur_per_tco2e,
        markup_applied=markup,
        phase_in_factor=phase_in_factor_for_year(inp.year),
        tariff_cost_eur_per_tonne=tariff_cost,
        gross_tariff_cost_eur_per_tonne=gross_tariff_cost,
        annual_exposure_eur=annual_exposure,
        annex_i_base_see_tco2e_per_tonne=annex_base,
        cbam_factor=cbam_factor,
        cscf=cscf,
        free_allocation_tco2e_per_tonne=free_allocation,
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
    # intensity = 3.187 × 1.10 = 3.5057 (≈ 3.506 with 2026 mark-up)
    # free allocation 2026 = 0.975 × 1.0 × 1.370 = 1.33575
    # taxable = 3.5057 − 1.33575 = 2.16995 tCO2e/t → × 75.36 ≈ €163.53/t
    # 2034 steady state = 3.5057 × 75.36 ≈ €264.19/t
