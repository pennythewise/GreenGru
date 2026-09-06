"""Advisory agent (PRD §8.10) — Qwen. Reads ranked paths + CBAM risk
tier + financing tier, writes a plain-language 1-3 item prioritized action
plan. Never given write access back to calculations/scores (PRD §10 —
"no self-harm to gap tracking").

Owns Graph RAG for the EU CBAM path (LangGraph cycle): metallurgical /
regulatory citations and already-computed precursor math. Copilot does not
run Graph RAG. Stage-1 vector RAG remains on the pre-screener; this agent
never invents tCO2e / tariff / subsidy numbers.
"""

from dataclasses import dataclass

from app.config import get_settings
from app.services.graph_rag import format_advisory_graph_context, run_graph_rag
from app.services.llm_client import call_prose
from app.services.path_ranker import RankedPath

settings = get_settings()

ADVISORY_SYSTEM_PROMPT = """You are writing a plain-language, 1-3 item prioritized action plan for a
Chinese steel SME facing CBAM exposure. Favor the cheapest path that closes the gap unless the gap is
large enough that only a heavier fix works. You may only reason about the paths and figures given to you
— never invent a new cost figure or a different emissions gap. If the gap is already closed, recommend
maintaining performance and getting measured data verified, not a fabricated improvement task.

When Graph RAG context is provided, cite the regulatory boundaries and precursor path it lists
(e.g. §3.16.2 cutting/welding exclusions, scrap yield m_i) — but do NOT invent or override any
numeric tariff, intensity, precursor burden, or cost figures. Those come only from the ranked paths,
notes, and Graph RAG math block above."""


@dataclass
class AdvisoryPlan:
    text: str
    ranked_actions: list[dict]
    graph_rag: dict | None = None


def generate_advisory_plan(
    *,
    company_name: str,
    ranked_paths: list[RankedPath],
    cbam_risk_tier: str,
    gross_vs_net_note: str,
    include_graph_rag: bool = True,
    see_precursor_tco2e: float | None = None,
) -> AdvisoryPlan:
    paths_text = "\n".join(
        f"- {p.path_name} ({p.path_name_cn}): CNY {p.estimated_cost_cny_low:,.0f}"
        f"{f'-{p.estimated_cost_cny_high:,.0f}' if p.estimated_cost_cny_high else '+'} — {p.cost_per_tco2e_closed_note}"
        for p in ranked_paths
    )
    graph_payload = None
    graph_block = ""
    if include_graph_rag:
        kwargs = {"locale": "zh"}
        if see_precursor_tco2e is not None:
            kwargs["see_precursor_tco2e"] = see_precursor_tco2e
        graph_payload = run_graph_rag(
            "宝武热轧板加工紧固件，数控切割与焊接的 CBAM 边界与前体负债",
            **kwargs,
        )
        graph_block = "\n\n" + format_advisory_graph_context(graph_payload)
    user_prompt = (
        f"Company: {company_name}\nCBAM risk tier: {cbam_risk_tier}\n"
        f"Note on cost escalation: {gross_vs_net_note}\n\nRanked paths:\n{paths_text}"
        f"{graph_block}\n"
    )

    mock_text = (
        f"[MOCK ADVISORY PLAN — configure LLM_API_KEY for real output]\n\n"
        f"Prioritized action plan for {company_name}:\n"
        + "\n".join(f"{i + 1}. {p.path_name} — {p.cost_per_tco2e_closed_note}" for i, p in enumerate(ranked_paths[:3]))
        + f"\n\nNote: {gross_vs_net_note}"
    )
    if graph_payload and graph_payload.get("math"):
        math = graph_payload["math"]
        mock_text += (
            f"\n\n[Graph RAG · LangGraph] precursor burden "
            f"{math.get('precursor_burden_tco2e')} tCO₂e/t "
            f"(m={math.get('yield_factor_m')} × SEE={math.get('see_precursor_tco2e')}; math_bridge only)."
        )

    text = call_prose(
        model=settings.model_writing,
        system_prompt=ADVISORY_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        mock_response=mock_text,
    )
    ranked_actions = [
        {
            "path_name": p.path_name,
            "path_name_cn": p.path_name_cn,
            "estimated_cost_cny_low": p.estimated_cost_cny_low,
            "estimated_cost_cny_high": p.estimated_cost_cny_high,
            "closes_full_gap": p.closes_full_gap,
        }
        for p in ranked_paths
    ]
    return AdvisoryPlan(text=text, ranked_actions=ranked_actions, graph_rag=graph_payload)
