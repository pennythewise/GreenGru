"""Section C Graph RAG conversational advisor.

Reads only the injected Graph RAG payload (paths, governance, deterministic
math). Never invents tCO2e / tariff / SEE figures — those stay in math_bridge
and Stage-3 scoring.
"""

from __future__ import annotations

from typing import Any

from app.config import get_settings
from app.services.graph_rag.pipeline import format_advisory_graph_context
from app.services.llm_client import call_prose, is_mock_mode

settings = get_settings()

GRAPH_RAG_CHAT_SYSTEM_PROMPT = """You are GreenGru's Graph RAG advisor for Chinese steel SMEs
on the EU CBAM passport path. You answer follow-up questions about the metallurgical /
regulatory evidence graph already computed for this session.

Rules (non-negotiable):
- You may ONLY restate and explain numbers, paths, governance statuses, and citations
  present in the Graph RAG context block. Never invent tCO2e, tariff €/t, SEE, yield
  factor m, precursor burden, CISA grades, or subsidy amounts.
- If the user asks for a new regulated number not in the context, say it must come from
  deterministic Stage-3 scoring / math_bridge — do not estimate.
- Cite Graph RAG governance (e.g. §3.16.2 EXCLUDED / MONITORING_ONLY for cutting/welding)
  when relevant.
- Reply in the user's language (zh or en). Keep answers concise (2–6 short paragraphs).
- Do not claim to re-run Graph RAG or Neo4j; you are explaining the injected snapshot.
"""


def build_graph_chat_context(payload: dict[str, Any]) -> str:
    """Assemble read-only context from the on-screen Graph RAG result (live or mock)."""
    base = format_advisory_graph_context(payload)
    extra: list[str] = []
    if payload.get("query"):
        extra.append(f"Original query: {payload['query']}")
    if payload.get("answer_zh"):
        extra.append(f"Answer (zh):\n{payload['answer_zh']}")
    nodes = payload.get("nodes")
    edges = payload.get("edges")
    if isinstance(nodes, list) and nodes:
        extra.append(f"Visible nodes: {len(nodes)}")
    if isinstance(edges, list) and edges:
        extra.append(f"Visible edges: {len(edges)}")
    subgraph = payload.get("subgraph")
    if isinstance(subgraph, dict) and subgraph.get("endpoint_ids"):
        extra.append(f"Endpoints: {', '.join(str(x) for x in subgraph['endpoint_ids'])}")
    if not extra:
        return base
    return base + "\n\n" + "\n".join(extra)


def _format_history(messages: list[dict[str, str]]) -> str:
    lines: list[str] = []
    for m in messages:
        role = (m.get("role") or "user").strip().lower()
        content = (m.get("content") or "").strip()
        if not content:
            continue
        label = "User" if role == "user" else "Assistant"
        lines.append(f"{label}: {content}")
    return "\n".join(lines)


def _mock_reply(graph_context: dict[str, Any], locale: str, last_user: str) -> str:
    math = graph_context.get("math") or {}
    burden = math.get("precursor_burden_tco2e", "—")
    m = math.get("yield_factor_m", "—")
    see = math.get("see_precursor_tco2e", "—")
    gov = graph_context.get("governance") or []
    gov_line = ""
    if gov:
        g0 = gov[0]
        gov_line = (
            f"{g0.get('process_en') or g0.get('process_id')}: "
            f"direct={g0.get('direct_status')} cite={g0.get('cite')}"
        )
    path = ""
    if graph_context.get("paths"):
        path = graph_context["paths"][0].get("path_en") or graph_context["paths"][0].get("path_zh") or ""

    if locale == "zh":
        return (
            "[MOCK Graph RAG 对话 — 配置 LLM_API_KEY 获取 Qwen 实答]\n\n"
            f"针对「{last_user}」：\n"
            f"- 确定性前体负担 = {burden} tCO₂e/t（m={m} × SEE={see}，仅 math_bridge）。\n"
            f"- 治理边界：{gov_line or '见 Graph RAG governance'}。\n"
            f"- 证据路径：{path or '见 paths'}。\n"
            "我不会编造关税或新的排放数值；如需新数字请走 Stage-3 确定性评分。"
        )
    return (
        "[MOCK Graph RAG chat — set LLM_API_KEY for live Qwen]\n\n"
        f"Re: “{last_user}”:\n"
        f"- Deterministic precursor burden = {burden} tCO₂e/t "
        f"(m={m} × SEE={see}; math_bridge only).\n"
        f"- Governance: {gov_line or 'see Graph RAG governance'}.\n"
        f"- Evidence path: {path or 'see paths'}.\n"
        "I will not invent tariffs or new emissions figures; "
        "ask Stage-3 deterministic scoring for new regulated numbers."
    )


def chat_graph_rag(
    *,
    messages: list[dict[str, str]],
    graph_context: dict[str, Any],
    locale: str = "zh",
) -> dict[str, Any]:
    """Answer a Section C follow-up using only injected Graph RAG facts."""
    cleaned = [
        {"role": (m.get("role") or "user").strip().lower(), "content": (m.get("content") or "").strip()}
        for m in messages
        if (m.get("content") or "").strip()
    ]
    if not cleaned:
        raise ValueError("messages must include at least one non-empty content")

    last_user = next(
        (m["content"] for m in reversed(cleaned) if m["role"] == "user"),
        cleaned[-1]["content"],
    )
    context_block = build_graph_chat_context(graph_context)
    history = _format_history(cleaned)
    user_prompt = (
        f"Locale: {locale}\n\n{context_block}\n\n=== Conversation ===\n{history}\n\n"
        "Respond to the latest user message using only the Graph RAG context above."
    )

    mock = is_mock_mode(role="writing")
    mock_text = _mock_reply(graph_context, locale, last_user)
    reply = call_prose(
        model=settings.model_writing,
        system_prompt=GRAPH_RAG_CHAT_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        mock_response=mock_text,
        role="writing",
    )
    return {
        "reply": reply,
        "model": settings.model_writing,
        "mock": mock,
    }
