"""Path cost ranker (PRD §8.9) — code, not an LLM call. Ranks improvement
paths by estimated cost per tCO2e of gap closed, using the three-path
framework from the original research: heavy retrofit / market
diversification / lightweight digital tools."""

from dataclasses import dataclass

# Rough cost figures from the project's research (PRD §8.9) — CNY.
DIGITAL_PLATFORM_COST_CNY_RANGE = (1_000, 10_000)
RETROFIT_COST_CNY_MIN = 100_000


@dataclass(frozen=True)
class RankedPath:
    path_name: str
    path_name_cn: str
    estimated_cost_cny_low: float
    estimated_cost_cny_high: float | None
    cost_per_tco2e_closed_note: str
    closes_full_gap: bool


def rank_paths(gap_to_next_tier_tco2e: float | None) -> list[RankedPath]:
    """Cheapest-first ordering. If the gap is 0/None (already at top tier),
    returns the maintain+verify path only (PRD §8.10 zero-gap case)."""
    if not gap_to_next_tier_tco2e or gap_to_next_tier_tco2e <= 0:
        return [
            RankedPath(
                path_name="Maintain + verify",
                path_name_cn="维持现状并核实数据",
                estimated_cost_cny_low=0,
                estimated_cost_cny_high=DIGITAL_PLATFORM_COST_CNY_RANGE[1],
                cost_per_tco2e_closed_note="No gap to close — get measured data verified so the existing advantage is provable.",
                closes_full_gap=True,
            )
        ]

    paths = [
        RankedPath(
            path_name="Lightweight digital tools",
            path_name_cn="轻量化数字化工具",
            estimated_cost_cny_low=DIGITAL_PLATFORM_COST_CNY_RANGE[0],
            estimated_cost_cny_high=DIGITAL_PLATFORM_COST_CNY_RANGE[1],
            cost_per_tco2e_closed_note="Cheapest path — typically closes measurement/reporting gaps and small process efficiency gains, not large intensity gaps.",
            closes_full_gap=gap_to_next_tier_tco2e < 0.2,
        ),
        RankedPath(
            path_name="Market diversification",
            path_name_cn="市场多元化",
            estimated_cost_cny_low=0,
            estimated_cost_cny_high=None,
            cost_per_tco2e_closed_note="Does not reduce emissions intensity — reduces EU-market exposure by shifting export mix. Complementary to, not a substitute for, an intensity-reduction path.",
            closes_full_gap=False,
        ),
        RankedPath(
            path_name="Heavy retrofit",
            path_name_cn="重大工艺改造",
            estimated_cost_cny_low=RETROFIT_COST_CNY_MIN,
            estimated_cost_cny_high=None,
            cost_per_tco2e_closed_note="Required once the gap is too large for digital/process tools alone to close.",
            closes_full_gap=True,
        ),
    ]
    return paths
