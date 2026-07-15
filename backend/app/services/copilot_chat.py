"""GreenGru Copilot — conversational assistant for sidebar + /entry chat.

Uses a dedicated API key and qwen3.7-plus. Does NOT compute regulated numbers;
only explains routes, documents, and process around deterministic pipeline output.
"""

from openai import OpenAI

from app.config import get_settings

settings = get_settings()

_copilot_client: OpenAI | None = None

PAGE_LABELS: dict[str, str] = {
    "passport": "EU license · CBAM",
    "loan": "Green loan",
    "grant": "Green factory grant",
    "new": "New submission",
    "entry": "GreenGru Copilot routing",
    "dashboard": "Dashboard",
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
}


def _copilot_api_key() -> str | None:
    return settings.dashscope_copilot_api_key or settings.dashscope_api_key


def is_copilot_mock_mode() -> bool:
    return settings.llm_mock_mode or not _copilot_api_key()


def get_copilot_client() -> OpenAI:
    global _copilot_client
    if _copilot_client is None:
        _copilot_client = OpenAI(
            api_key=_copilot_api_key() or "mock-key-unused-in-mock-mode",
            base_url=settings.dashscope_base_url,
        )
    return _copilot_client


def _system_prompt(page: str) -> str:
    label = PAGE_LABELS.get(page, "GreenGru")
    return f"""You are GreenGru Copilot, a bilingual (English + 中文) assistant for Chinese steel-downstream SMEs.

Current context: {label}

You help operators with:
- CBAM export passport (EU license) — Reg (EU) 2023/956, IR (EU) 2025/2621
- PBOC green loan readiness — tier scoring, document checklists
- Zero-carbon factory grant — GB/T 36132, 工信部联节〔2026〕13号

CRITICAL RULES:
- NEVER invent or compute regulated numbers (tCO2e, tariff €, CISA grade, subsidy amounts). Those are computed deterministically by the pipeline.
- Explain process, documents, routing, and what moves a score — cite regulations by name when relevant.
- Keep answers concise (2–4 short paragraphs max). Use 中文 terms inline where natural.
- If unsure, say what document or checklist item the operator should upload next."""


def _mock_reply(page: str, prompt_id: str | None, message: str) -> str:
    if prompt_id and prompt_id in MOCK_REPLIES:
        return MOCK_REPLIES[prompt_id]
    lower = message.lower()
    for _id, text in MOCK_REPLIES.items():
        if any(w in lower for w in _id.split("-") if len(w) > 3):
            return text
    return PAGE_FALLBACKS.get(page, PAGE_FALLBACKS["entry"])


def run_copilot_chat(
    *,
    page: str,
    message: str,
    prompt_id: str | None = None,
    history: list[dict[str, str]],
) -> tuple[str, bool]:
    """Returns (reply_text, is_mock)."""
    if is_copilot_mock_mode():
        return _mock_reply(page, prompt_id, message), True

    messages: list[dict[str, str]] = [{"role": "system", "content": _system_prompt(page)}]
    for h in history[-8:]:
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": message})

    client = get_copilot_client()
    response = client.chat.completions.create(
        model=settings.model_copilot,
        temperature=0.4,
        messages=messages,
    )
    reply = response.choices[0].message.content or PAGE_FALLBACKS.get(page, "")
    return reply.strip(), False
