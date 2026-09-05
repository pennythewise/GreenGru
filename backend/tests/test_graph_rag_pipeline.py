"""Pipeline cycle + advisory context formatting."""

from app.services.graph_rag.pipeline import (
    format_advisory_graph_context,
    get_graph_rag_langgraph,
    run_graph_rag,
)


def test_demo_query_returns_governance_and_math():
    out = run_graph_rag(
        "宝武热轧板加工紧固件，切割焊接排放怎么算？",
        locale="zh",
        see_precursor_tco2e=2.2,
        fabrication_ae_tco2e=0.08,
    )
    assert out["governance"]
    cut = next(g for g in out["governance"] if g["process_id"] == "proc_cnc_cutting")
    assert cut["direct_status"] == "EXCLUDED"
    assert out["math"] is not None
    assert abs(out["math"]["precursor_burden_tco2e"] - 2.5872) < 1e-4
    assert out["paths"]
    assert out["answer_zh"]
    assert out["trace"]
    steps = [t["step"] for t in out["trace"]]
    assert "plan" in steps and "generate" in steps


def test_advisory_context_contains_deterministic_numbers_not_invented():
    out = run_graph_rag("cutting welding CBAM Baowu plate", locale="en")
    ctx = format_advisory_graph_context(out)
    assert "Graph RAG context" in ctx
    assert "2.5872" in ctx or "precursor" in ctx.lower()
    assert "do not invent" in ctx.lower() or "Deterministic" in ctx or "deterministic" in ctx


def test_graph_rag_orchestrated_by_langgraph():
    """Cycle must run via compiled LangGraph StateGraph (not a plain for-loop)."""
    graph = get_graph_rag_langgraph()
    assert graph is not None
    out = run_graph_rag(
        "宝武热轧板加工紧固件，切割焊接排放怎么算？",
        locale="zh",
    )
    assert out.get("engine") == "langgraph"
    steps = [t["step"] for t in out["trace"]]
    assert steps[0] == "plan"
    assert "generate" in steps
    # Evaluate appears before generate; math tool still deterministic
    assert "evaluate" in steps
    assert out["math"]["precursor_burden_tco2e"] == 2.5872
