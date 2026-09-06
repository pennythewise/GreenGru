"""EU CBAM advisory agent owns Graph RAG (not Copilot)."""

from app.services.advisory_agent import generate_advisory_plan
from app.services.path_ranker import RankedPath


def _sample_paths() -> list[RankedPath]:
    return [
        RankedPath(
            path_name="Measured data + verifier",
            path_name_cn="实测数据+核验",
            estimated_cost_cny_low=80_000,
            estimated_cost_cny_high=150_000,
            closes_full_gap=True,
            cost_per_tco2e_closed_note="Cheapest path that closes residual CBAM gap",
        ),
    ]


def test_advisory_plan_attaches_graph_rag_by_default():
    plan = generate_advisory_plan(
        company_name="Demo Fastener Co",
        ranked_paths=_sample_paths(),
        cbam_risk_tier="elevated",
        gross_vs_net_note="Gross tariff exceeds net after free allocation.",
        include_graph_rag=True,
        see_precursor_tco2e=2.2,
    )
    assert plan.graph_rag is not None
    assert plan.graph_rag.get("engine") == "langgraph"
    assert plan.graph_rag.get("math") is not None
    assert abs(plan.graph_rag["math"]["precursor_burden_tco2e"] - 2.5872) < 1e-4
    assert plan.text
    assert "Graph RAG" in plan.text or "2.5872" in plan.text


def test_advisory_can_skip_graph_rag():
    plan = generate_advisory_plan(
        company_name="Demo Fastener Co",
        ranked_paths=_sample_paths(),
        cbam_risk_tier="elevated",
        gross_vs_net_note="n/a",
        include_graph_rag=False,
    )
    assert plan.graph_rag is None
