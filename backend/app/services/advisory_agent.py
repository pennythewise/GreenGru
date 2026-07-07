"""Advisory agent (PRD §8.10) — Qwen-Plus. Reads ranked paths + CBAM risk
tier + financing tier, writes a plain-language 1-3 item prioritized action
plan. Never given write access back to calculations/scores (PRD §10 —
"no self-harm to gap tracking")."""

from dataclasses import dataclass

from app.config import get_settings
from app.services.llm_client import call_prose
from app.services.path_ranker import RankedPath

settings = get_settings()

ADVISORY_SYSTEM_PROMPT = """You are writing a plain-language, 1-3 item prioritized action plan for a
Chinese steel SME facing CBAM exposure. Favor the cheapest path that closes the gap unless the gap is
large enough that only a heavier fix works. You may only reason about the paths and figures given to you
— never invent a new cost figure or a different emissions gap. If the gap is already closed, recommend
maintaining performance and getting measured data verified, not a fabricated improvement task."""


@dataclass
class AdvisoryPlan:
    text: str
    ranked_actions: list[dict]


def generate_advisory_plan(
    *,
    company_name: str,
    ranked_paths: list[RankedPath],
    cbam_risk_tier: str,
    gross_vs_net_note: str,
) -> AdvisoryPlan:
    paths_text = "\n".join(
        f"- {p.path_name} ({p.path_name_cn}): CNY {p.estimated_cost_cny_low:,.0f}"
        f"{f'-{p.estimated_cost_cny_high:,.0f}' if p.estimated_cost_cny_high else '+'} — {p.cost_per_tco2e_closed_note}"
        for p in ranked_paths
    )
    user_prompt = (
        f"Company: {company_name}\nCBAM risk tier: {cbam_risk_tier}\n"
        f"Note on cost escalation: {gross_vs_net_note}\n\nRanked paths:\n{paths_text}\n"
    )

    mock_text = (
        f"[MOCK ADVISORY PLAN — configure DASHSCOPE_API_KEY for real output]\n\n"
        f"Prioritized action plan for {company_name}:\n"
        + "\n".join(f"{i + 1}. {p.path_name} — {p.cost_per_tco2e_closed_note}" for i, p in enumerate(ranked_paths[:3]))
        + f"\n\nNote: {gross_vs_net_note}"
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
    return AdvisoryPlan(text=text, ranked_actions=ranked_actions)
