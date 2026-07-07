"""CISA (中国钢铁工业协会) 低碳排放钢 five-tier grading — E (baseline) through
A (near-zero).

STATUS (see primary-sources/INVENTORY.md item 10): the exact tier boundaries
have not been obtained from CISA's own standard document, which may sit
behind a membership/purchase paywall. Per the project's own documented
fallback plan, this module uses two *real, citable* anchor points and
interpolates the middle tiers — every boundary below is annotated with
whether it's a confirmed anchor or an interpolated placeholder. Every score
produced from this table carries `is_provisional=True` until CISA's actual
document is obtained; the threshold-scoring agent and the passport/financing
report templates must surface that provisional flag, not hide it.

Do not silently harden these into "final" boundaries — that would violate
the project's explicit rule against hardcoding placeholders as if final.
"""

from dataclasses import dataclass

# Grade A anchor: IEA's near-zero threshold for 100%-ore-based production
# (IEA 2021), as implemented in ResponsibleSteel's International Standard
# V2.0 performance level 4 ("near zero") — the documented substitute source
# per INVENTORY.md item 10 if CISA's own document can't be obtained in time.
GRADE_A_BOUNDARY_TCO2E_PER_TONNE = 0.40  # confirmed anchor (IEA / ResponsibleSteel)

# Grade B anchor: the EU CBAM free-allocation benchmark for BF-BOF (Commission
# Implementing Regulation (EU) 2025/2621) — not a CISA-native number, but a
# real, citable, internationally-recognized "good performance" line that
# gives Grade B a defensible footing rather than a made-up number.
GRADE_B_BOUNDARY_TCO2E_PER_TONNE = 1.370  # confirmed anchor (EU IR 2025/2621), reused as a proxy

# Grades C and D: linearly interpolated between the Grade B anchor and the
# China-default BF-BOF baseline (3.506, itself confirmed — see
# calculation_engine.py) — NOT sourced from CISA, purely a placeholder
# spacing so the 5-tier scale has usable intermediate boundaries. Replace
# these two the moment CISA's document is obtained.
GRADE_C_BOUNDARY_TCO2E_PER_TONNE = 2.10  # interpolated placeholder — NOT CISA-sourced
GRADE_D_BOUNDARY_TCO2E_PER_TONNE = 2.80  # interpolated placeholder — NOT CISA-sourced


@dataclass(frozen=True)
class CisaGradeResult:
    grade: str
    is_provisional: bool
    gap_to_next_grade_tco2e: float | None
    next_grade: str | None


_ORDERED_GRADES = ["A", "B", "C", "D", "E"]
_BOUNDARIES = {
    "A": GRADE_A_BOUNDARY_TCO2E_PER_TONNE,
    "B": GRADE_B_BOUNDARY_TCO2E_PER_TONNE,
    "C": GRADE_C_BOUNDARY_TCO2E_PER_TONNE,
    "D": GRADE_D_BOUNDARY_TCO2E_PER_TONNE,
}


def grade_for_intensity(intensity_tco2e_per_tonne: float) -> CisaGradeResult:
    """Pure comparison logic, no LLM (PRD §8.5). intensity <= a boundary
    earns that grade; anything above the D boundary is baseline Grade E."""
    for i, grade in enumerate(_ORDERED_GRADES[:-1]):  # A, B, C, D
        boundary = _BOUNDARIES[grade]
        if intensity_tco2e_per_tonne <= boundary:
            next_grade = _ORDERED_GRADES[i - 1] if i > 0 else None
            gap = None
            if next_grade is not None:
                gap = max(0.0, intensity_tco2e_per_tonne - _BOUNDARIES[next_grade])
            return CisaGradeResult(grade=grade, is_provisional=True, gap_to_next_grade_tco2e=gap, next_grade=next_grade)

    # Grade E (baseline) — gap to the next tier up (D)
    gap_to_d = max(0.0, intensity_tco2e_per_tonne - GRADE_D_BOUNDARY_TCO2E_PER_TONNE)
    return CisaGradeResult(grade="E", is_provisional=True, gap_to_next_grade_tco2e=gap_to_d, next_grade="D")
