"""Copilot must NOT run Graph RAG — that belongs on the CBAM advisory agent."""

from app.services.copilot_chat import run_copilot_chat


def test_copilot_never_attaches_graph_rag_even_on_passport_cbam():
    reply, is_mock, kb = run_copilot_chat(
        page="passport",
        message="数控切割和焊接需要核算哪些排放？最大的 CBAM 负债在哪里？",
        prompt_id=None,
        history=[],
        include_kb_rag=False,
    )
    assert is_mock is True
    assert reply
    assert "[Graph RAG" not in reply
    assert "langgraph" not in reply.lower()
    assert kb is None


def test_copilot_loan_chat_is_plain_llm_mock_without_graph():
    reply, is_mock, kb = run_copilot_chat(
        page="loan",
        message="绿色贷款材料缺什么",
        prompt_id="loan-blockers",
        history=[],
        include_kb_rag=False,
    )
    assert is_mock is True
    assert reply
    assert kb is None
