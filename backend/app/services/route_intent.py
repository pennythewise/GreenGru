"""Infer Loan / Grant / CBAM intent from copilot chat — advisory only (PRD §5)."""

from app.config import get_settings
from app.services.llm_client import call_structured, is_mock_mode

settings = get_settings()

CONFIDENCE_FLOOR = 0.70

ROUTE_LABELS = {
    "loan": "Loan 贷款",
    "grant": "Grant 补贴",
    "passport": "EU license CBAM",
}

DEFAULT_REASONS = {
    "loan": "Cash-flow signals and green-project intent detected.",
    "grant": "Factory registration + metering coverage clear the entry gate.",
    "passport": "No EU-bound tonnes declared this period.",
}


def _keyword_scores(text: str) -> dict[str, float]:
    lower = text.lower()
    scores = {"loan": 0.12, "grant": 0.12, "passport": 0.10}

    loan_kw = ("loan", "credit", "pboc", "refinanc", "metering upgrade", "贷款", "信贷", "绿色贷款")
    grant_kw = ("grant", "subsidy", "factory", "gb/t", "scrap", "补贴", "零碳", "深绿", "工信部")
    passport_kw = ("cbam", "eu ", "export", "passport", "license", "tonnage", "碳护照", "欧盟", "出口")

    for w in loan_kw:
        if w in lower:
            scores["loan"] += 0.22
    for w in grant_kw:
        if w in lower:
            scores["grant"] += 0.22
    for w in passport_kw:
        if w in lower:
            scores["passport"] += 0.24

    for key in scores:
        scores[key] = min(0.97, scores[key])
    return scores


def _mock_intent(history: list[dict[str, str]]) -> dict:
    combined = " ".join(m["content"] for m in history if m["role"] == "user")
    scores = _keyword_scores(combined)
    reasons = {
        "loan": "Green credit or metering-upgrade language in your messages."
        if scores["loan"] >= CONFIDENCE_FLOOR
        else "No strong loan signals yet — mention green credit or use-of-proceeds.",
        "grant": "Factory subsidy / GB/T 36132 language detected."
        if scores["grant"] >= CONFIDENCE_FLOOR
        else "Grant signals weak — mention 零碳工厂 or scrap-ratio targets.",
        "passport": "EU export or CBAM language detected."
        if scores["passport"] >= CONFIDENCE_FLOOR
        else "No EU-bound tonnage declared in chat — CBAM stays below floor.",
    }
    return {
        "loan": round(scores["loan"], 2),
        "grant": round(scores["grant"], 2),
        "passport": round(scores["passport"], 2),
        "reasons": reasons,
        "mock": True,
    }


def run_route_intent(*, history: list[dict[str, str]]) -> dict:
    if not history:
        return {
            "loan": 0.12,
            "grant": 0.12,
            "passport": 0.10,
            "reasons": DEFAULT_REASONS,
            "mock": is_mock_mode(),
        }

    if is_mock_mode():
        return _mock_intent(history)

    transcript = "\n".join(
        f"{m['role'].upper()}: {m['content']}" for m in history[-12:]
    )
    result = call_structured(
        model=settings.model_copilot,
        system_prompt="""You classify SME operator intent into three independent routes for GreenGru.
Return JSON only with keys: loan, grant, passport (each 0.0-1.0 confidence), and reasons (object with loan, grant, passport short strings).
Rules:
- loan: PBOC green credit, refinancing, metering upgrade, use-of-proceeds
- grant: 零碳工厂 subsidy, GB/T 36132, scrap ratio, MIIT 工信部联节
- passport: CBAM, EU export tonnage, EU license
- Confidences are independent (do NOT need to sum to 1).
- passport stays below 0.50 if user says domestic-only / no EU export.""",
        user_prompt=f"Chat transcript:\n{transcript}",
        mock_response=_mock_intent(history),
        temperature=0.0,
    )
    reasons = result.get("reasons") or DEFAULT_REASONS
    return {
        "loan": float(result.get("loan", 0.12)),
        "grant": float(result.get("grant", 0.12)),
        "passport": float(result.get("passport", 0.10)),
        "reasons": {
            "loan": reasons.get("loan", DEFAULT_REASONS["loan"]),
            "grant": reasons.get("grant", DEFAULT_REASONS["grant"]),
            "passport": reasons.get("passport", DEFAULT_REASONS["passport"]),
        },
        "mock": bool(result.get("_mock")),
    }
