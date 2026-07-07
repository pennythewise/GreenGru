"""
Deterministic CBAM carbon passport calculation engine.

No LLM anywhere in this file. Every number this module produces must be
traceable to a cited regulatory value — see carbon_passport_build_spec.md
section 2 for the formula derivation and worked example.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Optional


class ProductionRoute(Enum):
    BF_BOF = "BF-BOF"        # 高炉-转炉 (blast furnace - basic oxygen furnace)
    DRI_EAF = "DRI-EAF"      # 直接还原铁-电弧炉
    SCRAP_EAF = "scrap-EAF"  # 废钢-电弧炉


# --- Official reference data -------------------------------------------
# Update these values only when the source regulation/database updates,
# and keep the source citation attached to each constant.

# Source: Commission Implementing Regulation (EU) 2025/2621 — the free
# allocation benchmark, i.e. the threshold above which CBAM certificates
# are owed (tCO2e per tonne of crude steel).
EU_BENCHMARK_TCO2E_PER_TONNE = {
    ProductionRoute.BF_BOF: 1.370,
    ProductionRoute.DRI_EAF: 0.481,
    ProductionRoute.SCRAP_EAF: 0.072,
}

# Source: China National GHG Emission Factor Database v2
# (data.ncsc.org.cn/factories). Default embedded-emissions intensity for
# crude steel by production route, used only when the SME has no verified
# installation-level measurement of their own.
CHINA_DEFAULT_INTENSITY_TCO2E_PER_TONNE = {
    ProductionRoute.BF_BOF: 3.506,
    ProductionRoute.DRI_EAF: 1.9,    # placeholder — pull exact value from factor DB before launch
    ProductionRoute.SCRAP_EAF: 0.6,  # placeholder — pull exact value from factor DB before launch
}

# Source: EU IR 2025/2621, Annex IV point 4.1 — mark-up applied to default
# (non-verified) values only, to incentivize obtaining real supplier data.
# Measured/verified data is never marked up. This is DISTINCT from
# CBAM_PHASE_IN_FACTOR_BY_YEAR below — the two mechanisms are additive, not
# alternatives; both apply simultaneously to a default-value calculation.
MARKUP_BY_YEAR = {2026: 0.10, 2027: 0.20, 2028: 0.30}

# Source: Regulation (EU) 2023/956 Article 31(3) (CBAM certificate reduction
# mirroring the EU ETS free-allocation phase-out) + Directive 2003/87/EC
# Article 10a(1a), as inserted by Directive (EU) 2023/959 — the "CBAM factor"
# schedule. Only this fraction of embedded emissions above the benchmark
# requires a certificate in a given year; the rest still benefits from the
# EU ETS free-allocation mechanism during the phase-in window. 2034 onward
# (not in this table) is 1.0 — full obligation, no free allocation remains.
# VERIFICATION STATUS: sourced from secondary reporting (European Parliament
# EPRS briefing PDF, emissions-euets.com, climat.be) that all agree on these
# figures, but NOT yet cross-checked against the delegated act's own formula
# text (the free-allocation-equivalent calculation methodology). Flagged in
# primary-sources/INVENTORY.md as needing primary-source verification before
# launch — treat the same as any other unconfirmed constant in this file.
#
# IMPORTANT: this factor was missing from earlier versions of this engine,
# which caused tariff costs to be overstated by roughly 10-40x for
# 2026-2033 (the full un-phased-in taxable emissions were charged at the
# full certificate price). Do not remove this factor to "simplify" the
# formula — omitting it is the single most consequential error this engine
# can make in the current phase-in window.
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
CBAM_PHASE_IN_FACTOR_FULL_FROM_YEAR = 2034  # 100% obligation, no free allocation left


@dataclass
class CBAMInput:
    cn_code: str
    route: ProductionRoute
    annual_export_tonnes: float
    year: int
    # If the SME has verified installation-level data, pass it here.
    # It always overrides the China default value.
    measured_intensity_tco2e_per_tonne: Optional[float] = None


def phase_in_factor_for_year(year: int) -> float:
    """CBAM factor (Article 31(3)/10a(1a)) — see CBAM_PHASE_IN_FACTOR_BY_YEAR
    docstring above. 2034+ is full (1.0) obligation."""
    if year >= CBAM_PHASE_IN_FACTOR_FULL_FROM_YEAR:
        return 1.0
    return CBAM_PHASE_IN_FACTOR_BY_YEAR[year]


@dataclass
class CBAMResult:
    intensity_tco2e_per_tonne: float
    data_source: str  # "measured" or "china_default" — always disclosed on the passport
    benchmark_tco2e_per_tonne: float
    taxable_emissions_tco2e_per_tonne: float
    certificate_price_eur_per_tco2e: float
    markup_applied: float
    phase_in_factor: float  # fraction of taxable emissions actually charged this year
    tariff_cost_eur_per_tonne: float  # net of phase-in — what the SME actually owes this year
    gross_tariff_cost_eur_per_tonne: float  # phase_in_factor = 1.0 case — the 2034 steady-state cost, for advisory framing
    annual_exposure_eur: float


def calculate_cbam_exposure(
    inp: CBAMInput,
    certificate_price_eur_per_tco2e: float,
) -> CBAMResult:
    """Pure function. Same input always produces the same output —
    that reproducibility is the entire trust argument for this module."""

    # Input guards (PRD §8.4) — raise, don't guess.
    # Pre-2026 would otherwise silently take the 2028+ markup via the
    # .get() fallback below; 2029+ correctly takes the 30% plateau.
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

    # Step 1 — verified data always wins over the default value
    if inp.measured_intensity_tco2e_per_tonne is not None:
        intensity = inp.measured_intensity_tco2e_per_tonne
        source = "measured"
    else:
        intensity = CHINA_DEFAULT_INTENSITY_TCO2E_PER_TONNE[inp.route]
        source = "china_default"

    # Step 2 — subtract the EU free-allocation benchmark for this route
    benchmark = EU_BENCHMARK_TCO2E_PER_TONNE[inp.route]
    taxable = max(0.0, intensity - benchmark)

    # Step 3 — phase-in markup applies only to default (non-verified) values
    markup = MARKUP_BY_YEAR.get(inp.year, 0.30) if source == "china_default" else 0.0

    # Step 4 — gross cost per tonne (as if the CBAM obligation were already
    # fully phased in — this is the honest 2034 steady-state number, useful
    # for advisory framing so an SME doesn't mistake a small 2026 number for
    # their long-run exposure)
    gross_tariff_cost = taxable * certificate_price_eur_per_tco2e * (1 + markup)

    # Step 5 — apply the CBAM phase-in factor to get what's actually owed
    # this year (Article 31(3) — see CBAM_PHASE_IN_FACTOR_BY_YEAR above)
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
    )


if __name__ == "__main__":
    # Worked example from the build spec: CN 7208 10 00 hot-rolled coil, BF-BOF route
    example = CBAMInput(
        cn_code="72081000",
        route=ProductionRoute.BF_BOF,
        annual_export_tonnes=5000,
        year=2026,
    )
    result = calculate_cbam_exposure(example, certificate_price_eur_per_tco2e=75.36)
    print(result)
    # gross_tariff_cost_eur_per_tonne ≈ 177.07  (matches the original build spec
    #   worked example — but that example predates the phase-in factor fix and
    #   was implicitly a 2034-steady-state / un-phased-in number)
    # tariff_cost_eur_per_tonne ≈ 4.43  (the correct 2026 net figure: gross x 2.5%
    #   phase-in factor — this is what actually appears on a 2026 passport)
