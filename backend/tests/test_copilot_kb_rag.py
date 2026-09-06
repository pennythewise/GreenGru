"""Copilot must attach loan/grant channel KB. Graph RAG is advisory-only."""

from app.services.copilot_chat import resolve_kb_channels, run_copilot_chat


def test_resolve_kb_channels_by_page_and_keywords():
    assert resolve_kb_channels(page="loan", message="hello", include_kb_rag=None) == ["loan"]
    assert resolve_kb_channels(page="grant", message="hello", include_kb_rag=None) == ["grant"]
    assert "loan" in resolve_kb_channels(
        page="entry",
        message="绿色贷款材料缺什么 人行目录",
        include_kb_rag=None,
    )
    assert "grant" in resolve_kb_channels(
        page="entry",
        message="零碳工厂补贴 GB/T 36132 废钢比",
        include_kb_rag=None,
    )
    assert resolve_kb_channels(page="loan", message="x", include_kb_rag=False) == []
    assert set(resolve_kb_channels(page="entry", message="x", include_kb_rag=True)) >= {
        "loan",
        "grant",
    }


def test_copilot_loan_page_attaches_kb():
    reply, is_mock, kb = run_copilot_chat(
        page="loan",
        message="绿色贷款需要哪些材料？绿色金融支持项目目录怎么用？",
        prompt_id="loan-blockers",
        history=[],
        include_kb_rag=True,
    )
    assert is_mock is True
    assert kb is not None
    assert "loan" in kb.get("channels", [])
    assert kb.get("prompt_block")
    assert "贷款" in reply or "loan" in reply.lower() or "绿色" in reply
    assert "CNY 1,000,000" not in reply
    assert "[Graph RAG" not in reply


def test_copilot_grant_page_attaches_grant_kb():
    reply, is_mock, kb = run_copilot_chat(
        page="grant",
        message="GB/T 36132 废钢比和计量要求是什么？",
        prompt_id="grant-scrap",
        history=[],
        include_kb_rag=True,
    )
    assert is_mock is True
    assert kb is not None
    assert "grant" in kb["channels"]
    assert "36132" in reply or "废钢" in reply or "计量" in reply
    assert "[Graph RAG" not in reply


def test_passport_gets_cbam_kb_not_graph_rag():
    reply, is_mock, kb = run_copilot_chat(
        page="passport",
        message="数控切割和焊接 CBAM 边界",
        history=[],
        include_kb_rag=True,
    )
    assert is_mock is True
    assert kb is not None
    assert "cbam" in kb.get("channels", [])
    assert "[Graph RAG" not in reply
    assert "langgraph" not in reply.lower()
