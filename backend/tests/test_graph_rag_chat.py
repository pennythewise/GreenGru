"""Section C Graph RAG chat — LLM explains injected context only."""

from fastapi.testclient import TestClient

from app.services.graph_rag.chat import build_graph_chat_context, chat_graph_rag


SAMPLE_CONTEXT = {
    "query": "宝武热轧板加工紧固件，切割焊接排放怎么算？",
    "answer_en": "CNC cutting and welding are monitoring-only for steel CBAM.",
    "answer_zh": "数控切割与焊接对钢铁 CBAM 仅为监测项。",
    "governance": [
        {
            "process_id": "proc_cnc_cutting",
            "process_en": "CNC cutting",
            "direct_status": "EXCLUDED",
            "indirect_status": "MONITORING_ONLY_NOT_CBAM_PRICED",
            "cite": "§3.16.2",
        }
    ],
    "math": {
        "yield_factor_m": 1.176,
        "see_precursor_tco2e": 2.2,
        "precursor_burden_tco2e": 2.5872,
        "formula_en": "SEE_fastener ~= ae + (m * SEE_plate)",
    },
    "paths": [
        {
            "path_en": "Blast Furnace -[FEEDS]-> BOF -[PRODUCES]-> plate -[PRECURSOR_OF]-> fastener",
            "node_ids": ["proc_blast_furnace", "proc_bof", "mat_hot_rolled_plate", "mat_fastener_bolt"],
        }
    ],
}


def test_build_graph_chat_context_includes_deterministic_math():
    ctx = build_graph_chat_context(SAMPLE_CONTEXT)
    assert "do not invent" in ctx.lower() or "Graph RAG context" in ctx
    assert "2.5872" in ctx
    assert "§3.16.2" in ctx or "EXCLUDED" in ctx


def test_chat_graph_rag_mock_quotes_precursor_burden():
    out = chat_graph_rag(
        messages=[{"role": "user", "content": "Explain the precursor burden"}],
        graph_context=SAMPLE_CONTEXT,
        locale="en",
    )
    assert "2.5872" in out["reply"]
    assert out["model"]
    assert out.get("mock") is True


def test_chat_graph_rag_rejects_empty_messages():
    import pytest

    with pytest.raises(ValueError):
        chat_graph_rag(messages=[], graph_context=SAMPLE_CONTEXT, locale="zh")


def test_api_graph_rag_chat_endpoint():
    from app.main import app

    with TestClient(app) as client:
        resp = client.post(
            "/api/graph-rag/chat",
            json={
                "messages": [{"role": "user", "content": "Why is CNC excluded?"}],
                "locale": "en",
                "graph_context": SAMPLE_CONTEXT,
            },
        )
    assert resp.status_code == 200
    body = resp.json()
    assert body["reply"]
    assert "2.5872" in body["reply"] or "EXCLUDED" in body["reply"] or "CNC" in body["reply"]
    assert body["model"]


def test_api_graph_rag_chat_rejects_empty_messages():
    from app.main import app

    with TestClient(app) as client:
        resp = client.post(
            "/api/graph-rag/chat",
            json={"messages": [], "locale": "zh", "graph_context": SAMPLE_CONTEXT},
        )
    assert resp.status_code == 422
