"""CISA (中国钢铁工业协会) 低碳排放钢 five-tier grading — E (baseline) through
A (near-zero).

STATUS (see primary-sources/INVENTORY.md item 10): CISA's own draft standard
was obtained — 钢协科〔2024〕32号, the public-comment draft of T/CISA 452
《低碳排放钢评价方法》(chinaisa.org.cn, comment draft dated 2024-07-29,
comment period closed 2024-08-30). This is a real upgrade over the earlier
IEA/EU-benchmark-anchored interpolation this module used to carry, but it is
still a COMMENT DRAFT, not the finalized text — CISA subsequently published
the finalized T/CISA 452-2024 on 2024-10-17, and the boundary numbers below
have NOT been individually cross-checked against that finalized version.
Every score produced from this table therefore still carries
`is_provisional=True`; the threshold-scoring agent and the passport/
financing report templates must surface that provisional flag, not hide it.

Do not silently harden these into "final" boundaries — that would violate
the project's explicit rule against hardcoding placeholders as if final.

Grading formula (draft standard §7.2.1, eq. 15):
    y_n = a_n - b_n * scrap_ratio + alpha_n
`a_n`/`b_n` (Table 1) define a crude-steel-stage boundary that is linear in
scrap ratio — NOT a flat cutoff, by design, so a mill can't just add scrap
to jump grades without the boundary itself also moving. `alpha_n` (Table 2)
is a hot-rolled-product-specific add-on for the finishing stage; the draft
gives four product categories (热轧卷/coil, 厚板/plate, 线棒材/bar-wire-rod,
无缝管/seamless tube). This project's 8 CN codes (bolts, screws, structural
angles, rail material, wire rod) are downstream of the 线棒材 (bar/wire rod)
category, so that column is used here. If the product mix ever includes flat
or tube products, this mapping needs revisiting.
"""

from dataclasses import dataclass

# Source: 钢协科〔2024〕32号 T/CISA 452《低碳排放钢评价方法》(征求意见稿),
# chinaisa.org.cn, Table 1 — crude-steel boundary (tCO2/t-crude-steel) as a
# function of scrap ratio: a = 0%-scrap value, b = slope.
_TABLE1_A_TCO2E_PER_TONNE_CRUDE_STEEL = {"E": 2.19, "D": 1.64, "C": 1.02, "B": 0.43, "A": 0.15}
_TABLE1_B_SLOPE = {"E": 1.78, "D": 1.29, "C": 0.78, "B": 0.27, "A": 0.04}

# Table 2, 线棒材 (bar/wire rod) column only — see module docstring for why.
# Two sub-columns in the draft: 全铁矿石冶炼 (all-ore-based) vs 全废钢冶炼
# (all-scrap-based). Interpolating a route with partial scrap between these
# two columns isn't specified by the draft, so this module picks whichever
# column matches which side of 50% scrap the route's nominal ratio falls on.
_TABLE2_ALPHA_BAR_WIRE_ORE_BASED = {"E": 0.045, "D": 0.035, "C": 0.020, "B": 0.010, "A": 0.0}
_TABLE2_ALPHA_BAR_WIRE_SCRAP_BASED = {"E": 0.110, "D": 0.085, "C": 0.055, "B": 0.030, "A": 0.0}

# Nominal scrap ratio used to place a production route on the a - b*x curve
# when the SME hasn't supplied a measured furnace-charge scrap ratio.
# BF-BOF: integrated mills run ~0% scrap in the converter charge.
# scrap-EAF: ~100% scrap by definition of the route.
# DRI-EAF: typically charges some scrap alongside DRI; 15% is a commonly
# cited nominal figure for DRI-EAF furnaces, NOT a China-measured average —
# treat as a placeholder within a placeholder until real furnace-charge data
# is collected.
_NOMINAL_SCRAP_RATIO_BY_ROUTE = {
    "BF-BOF": 0.0,
    "DRI-EAF": 0.15,
    "scrap-EAF": 1.0,
}


@dataclass(frozen=True)
class CisaGradeResult:
    grade: str
    is_provisional: bool
    gap_to_next_grade_tco2e: float | None
    next_grade: str | None


_ORDERED_GRADES = ["A", "B", "C", "D", "E"]


def _boundary_tco2e_per_tonne(grade: str, scrap_ratio: float) -> float:
    alpha_table = _TABLE2_ALPHA_BAR_WIRE_SCRAP_BASED if scrap_ratio >= 0.5 else _TABLE2_ALPHA_BAR_WIRE_ORE_BASED
    return _TABLE1_A_TCO2E_PER_TONNE_CRUDE_STEEL[grade] - _TABLE1_B_SLOPE[grade] * scrap_ratio + alpha_table[grade]


def grade_for_intensity(intensity_tco2e_per_tonne: float, route: str = "BF-BOF") -> CisaGradeResult:
    """Pure comparison logic, no LLM (PRD §8.5). intensity <= a boundary
    earns that grade; anything above the E boundary is baseline Grade E.

    `route` (a ProductionRoute value, e.g. "BF-BOF") selects the nominal
    scrap ratio used to place the SME on the draft standard's scrap-ratio-
    dependent boundary curve — see _NOMINAL_SCRAP_RATIO_BY_ROUTE. Swap in an
    actual measured furnace-charge scrap ratio once the pipeline collects
    one; this parameter exists so that plumbing is a one-line change here,
    not a rewrite."""
    scrap_ratio = _NOMINAL_SCRAP_RATIO_BY_ROUTE.get(route, 0.0)
    boundaries = {grade: _boundary_tco2e_per_tonne(grade, scrap_ratio) for grade in _TABLE1_A_TCO2E_PER_TONNE_CRUDE_STEEL}

    for i, grade in enumerate(_ORDERED_GRADES[:-1]):  # A, B, C, D
        boundary = boundaries[grade]
        if intensity_tco2e_per_tonne <= boundary:
            next_grade = _ORDERED_GRADES[i - 1] if i > 0 else None
            gap = None
            if next_grade is not None:
                gap = max(0.0, intensity_tco2e_per_tonne - boundaries[next_grade])
            return CisaGradeResult(grade=grade, is_provisional=True, gap_to_next_grade_tco2e=gap, next_grade=next_grade)

    # Grade E (baseline) — gap to the next tier up (D)
    gap_to_d = max(0.0, intensity_tco2e_per_tonne - boundaries["D"])
    return CisaGradeResult(grade="E", is_provisional=True, gap_to_next_grade_tco2e=gap_to_d, next_grade="D")
