"""Copilot chat must inject Graph RAG citations without inventing numbers."""

from app.services.copilot_chat import run_copilot_chat, should_attach_graph_rag


def test_should_attach_graph_rag_for_passport_and_cbam_keywords():
    assert should_attach_graph_rag(page="passport", message="hello", include_graph_rag=None) is True
    assert should_attach_graph_rag(page="loan", message="hello", include_graph_rag=None) is False
    assert should_attach_graph_rag(
        page="entry",
        message="宝武热轧板切割焊接 CBAM 负债在哪",
        include_graph_rag=None,
    ) is True
    assert should_attach_graph_rag(page="loan", message="x", include_graph_rag=True) is True
    assert should_attach_graph_rag(page="passport", message="x", include_graph_rag=False) is False


def test_copilot_mock_chat_returns_graph_rag_payload_for_cbam():
    reply, is_mock, graph, kb = run_copilot_chat(
        page="passport",
        message="数控切割和焊接需要核算哪些排放？最大的 CBAM 负债在哪里？",
        prompt_id=None,
        history=[],
        include_graph_rag=True,
        include_kb_rag=False,
    )
    assert is_mock is True
    assert reply
    assert graph is not None
    assert graph.get("engine") == "langgraph"
    assert graph.get("math") is not None
    assert abs(graph["math"]["precursor_burden_tco2e"] - 2.5872) < 1e-4
    assert "2.5872" in reply or "EXCLUDED" in reply or "排除" in reply
    assert kb is None


def test_copilot_skips_graph_rag_when_disabled():
    reply, is_mock, graph, kb = run_copilot_chat(
        page="loan",
        message="绿色贷款材料缺什么",
        prompt_id="loan-blockers",
        history=[],
        include_graph_rag=False,
        include_kb_rag=False,
    )
    assert is_mock is True
    assert reply
    assert graph is None
    assert kb is None
