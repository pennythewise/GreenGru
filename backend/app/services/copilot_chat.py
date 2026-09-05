"""GreenGru Copilot — conversational assistant for sidebar + /entry chat.

Uses a dedicated API key and qwen3.7-plus. Does NOT compute regulated numbers;
only explains routes, documents, and process around deterministic pipeline output.

Knowledge attachment:
- CBAM / metallurgy → Graph RAG (LangGraph) + optional channel=cbam vector KB
- Loan / Grant → channel-scoped vector KB (绿色金融目录 / GB/T 36132 / 工信部联节)
"""

from __future__ import annotations

import logging
from typing import Any, Literal

from openai import OpenAI

from app.config import get_settings
from app.services.graph_rag import format_advisory_graph_context, run_graph_rag
from app.services.rag.retrieve import format_chunks_for_prompt, retrieve_kb

logger = logging.getLogger(__name__)
settings = get_settings()

_copilot_client: OpenAI | None = None

KbChannel = Literal["cbam", "loan", "grant"]

PAGE_LABELS: dict[str, str] = {
    "passport": "EU license · CBAM",
    "loan": "Green loan",
    "grant": "Green factory grant",
    "new": "New submission",
    "entry": "GreenGru Copilot routing",
    "dashboard": "Dashboard",
    "graph-rag": "CBAM Graph RAG",
}

MOCK_REPLIES: dict[str, str] = {
    "loan-tier": "You're at Grade B (78/100). To reach A: lift metering coverage from 78% → 95% (+8 pts), add auditor attestation (+5), and document green-project use-of-proceeds.",
    "loan-blockers": "Two items still block Section B: 'Green-project use-of-proceeds' and optional 'Auditor attestation'. The use-of-proceeds doc is mandatory — upload it in Section A.",
    "loan-ppa": "A green-electricity PPA strengthens your emissions ledger evidence and supports CERF refinancing. Pair it with metering data so the auditor can verify renewable share.",
    "grant-scrap": "GB/T 36132 §5.2 sets a 30% scrap-steel ratio floor for Tier 2 (深绿). Raising toward 40% would add grant points per the deterministic rubric.",
    "grant-metering": "Melting-stage metering is the main gap — without stage-level data the auditor caps you at Tier 2.",
    "grant-policy": "工信部联节〔2026〕13号 is the MIIT zero-carbon factory subsidy notice. It requires renewable-energy share evidence.",
    "passport-docs": "Section A needs six items: CN-code product list, route-of-production statement, embedded emissions, verifier accreditation, CBAM certificates ledger, and installation-level data.",
    "passport-gap": "Your gauge reads exposed because embedded intensity sits above the Reg (EU) 2023/956 default benchmark for your CN code.",
    "passport-verifier": "Verifier accreditation is required before final CBAM declaration, but you can preview the passport while it's pending.",
    "entry-router": "The router classifies intent into Loan, Grant, and/or CBAM with a confidence score. Routes above 0.70 pre-select; you always confirm before anything runs.",
    "entry-floor": "CBAM is below 0.70 when no EU-bound tonnage is declared this period — you can re-enable it anytime before confirming.",
    "entry-combine": "Yes — tick multiple routes on the confirm panel. Each confirmed route opens its own page after New submission.",
}

PAGE_FALLBACKS: dict[str, str] = {
    "passport": "For CBAM questions, check Section A's document checklist and the benchmark gap in Section C.",
    "loan": "For loan questions, focus on Section A missing docs and the PBOC tier gauge.",
    "grant": "For grant questions, GB/T 36132 and the scrap-ratio gap are usually the blockers.",
    "new": "For intake questions, describe the file you're uploading or the field you're filling in.",
    "entry": "Describe what you need (loan, grant, EU export) and I'll explain how the router would classify it.",
    "dashboard": "Tell me whether you're focused on export compliance, green credit, or factory subsidies.",
    "graph-rag": "Ask about cutting/welding boundaries, Baowu precursor liability, or CN 7318 alignment.",
}

_GRAPH_RAG_KEYWORDS = (
    "cbam",
    "cutting",
    "welding",
    "baowu",
    "precursor",
    "§3.16",
    "3.16.2",
    "cn 7318",
    "cn 7208",
    "fastener",
    "hot-rolled",
    "hot rolled",
    "切割",
    "焊接",
    "宝武",
    "前体",
    "紧固件",
    "热轧",
    "碳边境",
    "负债",
    "排放",
    "镀锌",
    "碳护照",
    "欧盟",
)

_LOAN_KEYWORDS = (
    "loan",
    "credit",
    "pboc",
    "cerf",
    "use-of-proceeds",
    "refinanc",
    "贷款",
    "信贷",
    "绿贷",
    "绿色金融",
    "人行",
    "项目目录",
    "用途说明",
)

_GRANT_KEYWORDS = (
    "grant",
    "subsidy",
    "gb/t",
    "gbt",
    "36132",
    "scrap",
    "zero-carbon",
    "补贴",
    "零碳",
    "深绿",
    "工信部",
    "废钢",
    "绿色工厂",
)

# Offline / empty-index stubs — prose only, no invented ¥ / grade / subsidy amounts
_KB_FALLBACK_SNIPPETS: dict[KbChannel, list[dict[str, str]]] = {
    "loan": [
        {
            "source_file": "绿色金融支持项目目录-2025年版.pdf",
            "heading_path": "目录适用范围",
            "chunk_text": (
                "绿色贷款用途须对照《绿色金融支持项目目录（2025年版）》列示的支持领域。"
                "钢铁下游节能改造、计量升级、绿电采购等可纳入目录相关条目；"
                "放款材料通常包括绿色项目用途说明（use-of-proceeds）与可核验的计量证据。"
                "具体可贷额度与利率由银行审贷决定 — Copilot 不得编造金额。"
            ),
        },
        {
            "source_file": "GB-T-36132-2025-绿色工厂评价通则.pdf",
            "heading_path": "评价与贷前交叉引用",
            "chunk_text": (
                "绿色工厂评价通则可为绿贷尽调提供工厂级证据框架（能耗、排放、管理体系），"
                "但不替代人行绿色金融目录对项目用途的归类要求。"
            ),
        },
    ],
    "grant": [
        {
            "source_file": "GB-T-36132-2025-绿色工厂评价通则.pdf",
            "heading_path": "§5.2 资源与能源",
            "chunk_text": (
                "GB/T 36132 绿色工厂评价对废钢比、计量覆盖、可再生能源利用等提出分级要求。"
                "废钢比例与分阶段计量是常见短板；达标档位由确定性评分引擎计算，"
                "Copilot 只解释条款与材料清单，不编造补贴金额或最终档位。"
            ),
        },
        {
            "source_file": "工信部联节〔2026〕13号.pdf",
            "heading_path": "零碳工厂补贴要点",
            "chunk_text": (
                "工信部联节〔2026〕13号强调零碳/近零碳工厂建设与可再生能源占比证据。"
                "申报材料需与工厂评价数据一致；具体补贴比例与上限以主管部门文件为准。"
            ),
        },
    ],
    "cbam": [
        {
            "source_file": "EU-CBAM-guidance.pdf",
            "heading_path": "Iron and steel monitoring",
            "chunk_text": (
                "CBAM for iron/steel prices direct emissions (Annex II). "
                "Fabrication monitoring boundaries (e.g. §3.16.2) distinguish included vs excluded processes. "
                "Embedded emissions and tariffs are computed by the deterministic pipeline — not by Copilot."
            ),
        },
    ],
}


def should_attach_graph_rag(
    *,
    page: str,
    message: str,
    include_graph_rag: bool | None,
) -> bool:
    """Passport / Graph RAG pages default on; other pages need CBAM keywords or explicit flag."""
    if include_graph_rag is False:
        return False
    if include_graph_rag is True:
        return True
    if page in ("passport", "graph-rag"):
        return True
    blob = message.lower()
    return any(k in blob for k in _GRAPH_RAG_KEYWORDS)


def resolve_kb_channels(
    *,
    page: str,
    message: str,
    include_kb_rag: bool | None,
) -> list[KbChannel]:
    """Which vector-KB channels to retrieve for this Copilot turn."""
    if include_kb_rag is False:
        return []
    if include_kb_rag is True:
        # Force: page-primary channels, else all three for entry/dashboard
        if page == "loan":
            return ["loan"]
        if page == "grant":
            return ["grant"]
        if page in ("passport", "graph-rag"):
            return ["cbam"]
        return ["loan", "grant", "cbam"]

    channels: list[KbChannel] = []
    if page == "loan":
        channels.append("loan")
    elif page == "grant":
        channels.append("grant")
    elif page in ("passport", "graph-rag"):
        channels.append("cbam")

    blob = message.lower()
    if any(k in blob for k in _LOAN_KEYWORDS) and "loan" not in channels:
        channels.append("loan")
    if any(k in blob for k in _GRANT_KEYWORDS) and "grant" not in channels:
        channels.append("grant")
    if any(k in blob for k in _GRAPH_RAG_KEYWORDS) and "cbam" not in channels:
        channels.append("cbam")
    return channels


def _copilot_api_key() -> str | None:
    return settings.llm_copilot_api_key or settings.llm_api_key


def is_copilot_mock_mode() -> bool:
    return settings.llm_mock_mode or not _copilot_api_key()


def get_copilot_client() -> OpenAI:
    global _copilot_client
    if _copilot_client is None:
        _copilot_client = OpenAI(
            api_key=_copilot_api_key() or "mock-key-unused-in-mock-mode",
            base_url=settings.llm_base_url,
        )
    return _copilot_client


def _system_prompt(
    page: str,
    *,
    with_graph_rag: bool,
    with_kb_rag: bool,
) -> str:
    label = PAGE_LABELS.get(page, "GreenGru")
    extra = ""
    if with_graph_rag:
        extra += """
GRAPH RAG (when context is attached below the user message):
- Cite §3.16.2 boundaries, precursor paths, and scrap yield m_i from that block.
- NEVER invent or override precursor burden, SEE, tariff, or intensity numbers — use only values in the Graph RAG math block.
"""
    if with_kb_rag:
        extra += """
CHANNEL KNOWLEDGE BASE (loan / grant / cbam vector RAG when attached):
- Cite only the retrieved excerpts (绿色金融支持项目目录, GB/T 36132, 工信部联节〔2026〕13号, EU CBAM guidance).
- NEVER invent loan amounts, interest rates, subsidy ¥, or CISA/grant tiers — those come from deterministic scorers.
- Prefer telling the operator which checklist document to upload next.
"""
    return f"""You are GreenGru Copilot, a bilingual (English + 中文) assistant for Chinese steel-downstream SMEs.

Current context: {label}

You help operators with:
- CBAM export passport (EU license) — Reg (EU) 2023/956, IR (EU) 2025/2621
- PBOC green loan readiness — 绿色金融支持项目目录, tier scoring, document checklists
- Zero-carbon factory grant — GB/T 36132, 工信部联节〔2026〕13号

CRITICAL RULES:
- NEVER invent or compute regulated numbers (tCO2e, tariff €, CISA grade, subsidy amounts, loan principal). Those are computed deterministically by the pipeline / scorers / math_bridge.
- Explain process, documents, routing, and what moves a score — cite regulations by name when relevant.
- Keep answers concise (2–4 short paragraphs max). Use 中文 terms inline where natural.
- If unsure, say what document or checklist item the operator should upload next.
{extra}"""


def _mock_reply(page: str, prompt_id: str | None, message: str) -> str:
    if prompt_id and prompt_id in MOCK_REPLIES:
        return MOCK_REPLIES[prompt_id]
    lower = message.lower()
    for _id, text in MOCK_REPLIES.items():
        if any(w in lower for w in _id.split("-") if len(w) > 3):
            return text
    return PAGE_FALLBACKS.get(page, PAGE_FALLBACKS["entry"])


def _mock_reply_with_graph(page: str, prompt_id: str | None, message: str, graph: dict[str, Any]) -> str:
    """Deterministic mock that surfaces Graph RAG facts (no invented numbers)."""
    base = _mock_reply(page, prompt_id, message)
    math = graph.get("math") or {}
    gov = graph.get("governance") or []
    path = (graph.get("paths") or [{}])[0]
    cut = next((g for g in gov if g.get("process_id") == "proc_cnc_cutting"), None)
    weld = next((g for g in gov if g.get("process_id") == "proc_co2_welding"), None)
    burden = math.get("precursor_burden_tco2e")
    lines = [
        base,
        "",
        "[Graph RAG · LangGraph]",
    ]
    if cut:
        lines.append(
            f"• CNC cutting: direct {cut.get('direct_status')} "
            f"(cite: {cut.get('cite') or '§3.16.2'})."
        )
    if weld:
        lines.append(f"• CO₂ welding: direct {weld.get('direct_status')}.")
    if burden is not None:
        lines.append(
            f"• Deterministic precursor burden: m={math.get('yield_factor_m')} × "
            f"SEE={math.get('see_precursor_tco2e')} = {burden} tCO₂e/t "
            f"(math_bridge only — not invented)."
        )
    if path.get("path_en"):
        lines.append(f"• Evidence path: {path['path_en']}")
    lines.append("Annex II steel: Scope 2 electricity is not CBAM-priced.")
    return "\n".join(lines)


def _mock_reply_with_kb(page: str, prompt_id: str | None, message: str, kb: dict[str, Any]) -> str:
    base = _mock_reply(page, prompt_id, message)
    lines = [base, "", "[Channel KB · vector RAG]"]
    for ch in kb.get("channels") or []:
        lines.append(f"• Channel: {ch}")
    block = (kb.get("prompt_block") or "").strip()
    if block:
        # Keep short for chat UX
        excerpt = block if len(block) <= 900 else block[:900] + "…"
        lines.append(excerpt)
    lines.append("提醒：额度/利率/补贴金额与评分档位由确定性引擎或银行/主管部门决定，Copilot 不编造数字。")
    return "\n".join(lines)


def format_kb_rag_context(kb: dict[str, Any]) -> str:
    channels = ", ".join(kb.get("channels") or [])
    block = (kb.get("prompt_block") or "").strip()
    if not block:
        return (
            f"=== Channel KB context ({channels or 'none'}) ===\n"
            "(no chunks retrieved — ask operator to ingest loan/grant PDFs)\n"
            "=== end Channel KB context ==="
        )
    return (
        f"=== Channel KB context ({channels}) — cite only; do not invent ¥/tiers ===\n"
        f"{block}\n"
        "=== end Channel KB context ==="
    )


def _fallback_kb_channel(channel: KbChannel) -> dict[str, Any]:
    snippets = _KB_FALLBACK_SNIPPETS.get(channel, [])
    parts = []
    sources = []
    for i, s in enumerate(snippets, start=1):
        parts.append(
            f"[{i}] ({s['source_file']} · {s['heading_path']} · sim=fallback · kb)\n{s['chunk_text']}"
        )
        sources.append(
            {
                "channel": channel,
                "source_file": s["source_file"],
                "heading_path": s["heading_path"],
                "similarity": None,
                "corpus": "kb_fallback",
            }
        )
    return {
        "channel": channel,
        "hit_count": len(snippets),
        "prompt_block": "\n\n---\n\n".join(parts),
        "sources": sources,
        "fallback": True,
    }


def _retrieve_kb_channel(channel: KbChannel, query: str) -> dict[str, Any]:
    lang = "zh" if channel in ("loan", "grant") else "en"
    try:
        chunks = retrieve_kb(channel=channel, query=query, k=4, language=lang)
    except Exception as exc:  # noqa: BLE001 — offline / missing embed key
        logger.warning("Copilot KB retrieve failed channel=%s: %s", channel, exc)
        return _fallback_kb_channel(channel)

    if not chunks:
        return _fallback_kb_channel(channel)

    return {
        "channel": channel,
        "hit_count": len(chunks),
        "prompt_block": format_chunks_for_prompt(chunks, max_chars=4000),
        "sources": [
            {
                "channel": c.channel,
                "source_file": c.source_file,
                "heading_path": c.heading_path,
                "similarity": c.similarity,
                "corpus": c.corpus,
            }
            for c in chunks
        ],
        "fallback": False,
    }


def _run_kb_rag_for_message(message: str, channels: list[KbChannel]) -> dict[str, Any] | None:
    if not channels:
        return None
    q = message.strip() or "绿色合规材料与评价要求"
    per_channel = []
    blocks: list[str] = []
    sources: list[dict[str, Any]] = []
    for ch in channels:
        payload = _retrieve_kb_channel(ch, q)
        per_channel.append(payload)
        if payload.get("prompt_block"):
            blocks.append(f"## channel={ch}\n{payload['prompt_block']}")
        sources.extend(payload.get("sources") or [])
    return {
        "channels": list(channels),
        "query": q,
        "prompt_block": "\n\n".join(blocks),
        "sources": sources,
        "by_channel": per_channel,
    }


def _run_graph_rag_for_message(message: str, locale: str = "zh") -> dict[str, Any]:
    q = message.strip() or (
        "宝武热轧板加工紧固件，数控切割与焊接的 CBAM 边界与前体负债"
    )
    return run_graph_rag(q, locale=locale)


def run_copilot_chat(
    *,
    page: str,
    message: str,
    prompt_id: str | None = None,
    history: list[dict[str, str]],
    include_graph_rag: bool | None = None,
    include_kb_rag: bool | None = None,
) -> tuple[str, bool, dict[str, Any] | None, dict[str, Any] | None]:
    """Returns (reply_text, is_mock, graph_rag, kb_rag)."""
    attach_graph = should_attach_graph_rag(
        page=page,
        message=message,
        include_graph_rag=include_graph_rag,
    )
    kb_channels = resolve_kb_channels(
        page=page,
        message=message,
        include_kb_rag=include_kb_rag,
    )

    graph: dict[str, Any] | None = None
    if attach_graph:
        graph = _run_graph_rag_for_message(message, locale="zh")

    kb: dict[str, Any] | None = _run_kb_rag_for_message(message, kb_channels)

    if is_copilot_mock_mode():
        base = _mock_reply(page, prompt_id, message)
        parts = [base]
        if graph is not None:
            g_full = _mock_reply_with_graph(page, prompt_id, message, graph)
            parts.append(g_full[len(base) :].lstrip() or g_full)
        if kb is not None:
            k_full = _mock_reply_with_kb(page, prompt_id, message, kb)
            parts.append(k_full[len(base) :].lstrip() or k_full)
        # Deduplicate if only base
        reply = parts[0] if len(parts) == 1 else "\n\n".join(parts)
        return reply, True, graph, kb

    messages: list[dict[str, str]] = [
        {
            "role": "system",
            "content": _system_prompt(
                page,
                with_graph_rag=graph is not None,
                with_kb_rag=kb is not None,
            ),
        }
    ]
    for h in history[-8:]:
        messages.append({"role": h["role"], "content": h["content"]})

    user_content = message
    extras: list[str] = []
    if graph is not None:
        extras.append(format_advisory_graph_context(graph))
    if kb is not None:
        extras.append(format_kb_rag_context(kb))
    if extras:
        user_content = message + "\n\n" + "\n\n".join(extras)
    messages.append({"role": "user", "content": user_content})

    client = get_copilot_client()
    response = client.chat.completions.create(
        model=settings.model_copilot,
        temperature=0.4,
        messages=messages,
    )
    reply = response.choices[0].message.content or PAGE_FALLBACKS.get(page, "")
    return reply.strip(), False, graph, kb
