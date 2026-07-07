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

# Source: EU IR 2025/2621 — phase-in markup applied to default (non-verified)
# values only. Measured/verified data is never marked up.
MARKUP_BY_YEAR = {2026: 0.10, 2027: 0.20, 2028: 0.30}


@dataclass
class CBAMInput:
    cn_code: str
    route: ProductionRoute
    annual_export_tonnes: float
    year: int
    # If the SME has verified installation-level data, pass it here.
    # It always overrides the China default value.
    measured_intensity_tco2e_per_tonne: Optional[float] = None


@dataclass
class CBAMResult:
    intensity_tco2e_per_tonne: float
    data_source: str  # "measured" or "china_default" — always disclosed on the passport
    benchmark_tco2e_per_tonne: float
    taxable_emissions_tco2e_per_tonne: float
    certificate_price_eur_per_tco2e: float
    markup_applied: float
    tariff_cost_eur_per_tonne: float
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

    # Step 4 — cost per tonne, then total annual exposure
    tariff_cost = taxable * certificate_price_eur_per_tco2e * (1 + markup)
    annual_exposure = tariff_cost * inp.annual_export_tonnes

    return CBAMResult(
        intensity_tco2e_per_tonne=intensity,
        data_source=source,
        benchmark_tco2e_per_tonne=benchmark,
        taxable_emissions_tco2e_per_tonne=taxable,
        certificate_price_eur_per_tco2e=certificate_price_eur_per_tco2e,
        markup_applied=markup,
        tariff_cost_eur_per_tonne=tariff_cost,
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
    # tariff_cost_eur_per_tonne ≈ 177.0  (matches the build spec worked example)
