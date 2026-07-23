"""CN code classifier agent (PRD §8.3) — qwen3.6-flash first pass, single
escalation retry to qwen3.7-plus on low confidence. The only model-escalation
path in the whole system (PRD §4.1)."""

from dataclasses import dataclass

from app.config import get_settings
from app.data.cn_codes import SUPPORTED_CN_CODES
from app.services.llm_client import call_structured

settings = get_settings()

_CODE_TABLE_TEXT = "\n".join(
    f"- {entry.code}: {entry.description_en} ({entry.description_cn})" for entry in SUPPORTED_CN_CODES.values()
)

CLASSIFIER_SYSTEM_PROMPT = f"""You are a CN code classifier for a CBAM carbon passport platform.
You may ONLY choose one of these 8 codes, or "out_of_scope" if the product is not clearly one of them
(e.g. aluminum products, CN 7204 ferrous scrap, non-steel hardware). NEVER force a fit to the nearest
steel code — using out_of_scope for anything ambiguous is the correct, safe answer.

Supported codes:
{_CODE_TABLE_TEXT}

Respond with JSON: {{"cn_code": "<one of the 8 codes above, or 'out_of_scope'>", "confidence": <0-1 float>}}"""


@dataclass
class ClassificationResult:
    cn_code: str  # one of the 8 codes, or "out_of_scope"
    confidence: float
    model_used: str
    escalated: bool
    requires_manual_confirmation: bool
    reason: str | None = None


def classify_product(product_description: str, cn_code_hint: str | None = None) -> ClassificationResult:
    mock = {"cn_code": "7208 10 00", "confidence": 0.55}
    first_pass = call_structured(
        model=settings.model_classifier,
        system_prompt=CLASSIFIER_SYSTEM_PROMPT,
        user_prompt=f"Product description: {product_description}",
        mock_response=mock,
        role="classifier",
    )
    cn_code = first_pass.get("cn_code", "out_of_scope")
    confidence = float(first_pass.get("confidence", 0.0))
    escalated = False
    model_used = settings.model_classifier

    needs_escalation = confidence < settings.classifier_confidence_threshold or cn_code == "out_of_scope"
    if needs_escalation:
        escalated = True
        model_used = settings.model_classifier_escalation
        second_pass = call_structured(
            model=settings.model_classifier_escalation,
            system_prompt=CLASSIFIER_SYSTEM_PROMPT,
            user_prompt=f"Product description: {product_description}\n\n(Escalated retry — the first-pass "
            f"classifier returned '{cn_code}' at confidence {confidence:.2f}, below threshold.)",
            mock_response={"cn_code": "7208 10 00", "confidence": 0.82},
            role="classifier_escalation",
        )
        cn_code = second_pass.get("cn_code", cn_code)
        confidence = float(second_pass.get("confidence", confidence))

    requires_manual = confidence < settings.classifier_confidence_threshold or cn_code == "out_of_scope"
    reason = None
    if cn_code == "out_of_scope":
        reason = "Product does not clearly match any of the 8 supported CN codes."
    elif requires_manual:
        reason = f"Confidence {confidence:.2f} remained below threshold after escalation."
    elif cn_code_hint and cn_code_hint != cn_code:
        # PRD §8.3: intake hint vs classifier disagreement -> manual
        # confirmation, never a silent override in either direction.
        requires_manual = True
        reason = f"Intake-extracted cn_code_hint ('{cn_code_hint}') disagrees with classifier result ('{cn_code}')."

    return ClassificationResult(
        cn_code=cn_code,
        confidence=confidence,
        model_used=model_used,
        escalated=escalated,
        requires_manual_confirmation=requires_manual,
        reason=reason,
    )
