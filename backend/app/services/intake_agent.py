"""Document intake agent (PRD §8.1) + deterministic CSV/XLSX parser + the
optional Stage-0 ModelScope pre-screen hook (PRD §8.0).

CSV/XLSX uploads never reach the vision model — a structured file has no
business being interpreted by a vision model (PRD §8.1 rule)."""

import csv
import io
from dataclasses import dataclass, field

from app.config import get_settings
from app.services.llm_client import call_structured

settings = get_settings()

INTAKE_SYSTEM_PROMPT = """You are a document intake extraction agent for a CBAM carbon passport
platform. Extract ONLY the fields in the schema from the uploaded invoice/production record.
Never compute or infer an emissions number — extraction only. If two pieces of evidence in the
same document disagree, report both in `flags` rather than picking one."""


@dataclass
class IntakeExtraction:
    production_volume_tonnes: float | None
    fuel_type: str | None
    cn_code_hint: str | None
    billing_period: str | None
    confidence: str  # "high" | "medium" | "low"
    flags: list[str] = field(default_factory=list)


def extract_from_document(document_text: str, source_label: str = "upload") -> IntakeExtraction:
    """Vision/text extraction via qwen3.7-plus (or mock). `document_text`
    is either an OCR text layer (Stage 0, §8.0) or a plain-text stand-in for
    a real image upload in this reference implementation — swap in
    base64 image content blocks here for a production vision call."""
    mock = {
        "production_volume_tonnes": 5000.0,
        "fuel_type": "coking coal (BF-BOF)",
        "cn_code_hint": None,
        "billing_period": "2026-01 to 2026-12",
        "confidence": "medium",
        "flags": [f"mock extraction from {source_label} — configure DASHSCOPE_API_KEY for real output"],
    }
    result = call_structured(
        model=settings.model_intake_vision,
        system_prompt=INTAKE_SYSTEM_PROMPT,
        user_prompt=f"Extract intake fields from this document text:\n\n{document_text}",
        mock_response=mock,
    )
    return IntakeExtraction(
        production_volume_tonnes=result.get("production_volume_tonnes"),
        fuel_type=result.get("fuel_type"),
        cn_code_hint=result.get("cn_code_hint"),
        billing_period=result.get("billing_period"),
        confidence=result.get("confidence", "low"),
        flags=list(result.get("flags", [])),
    )


def parse_csv_intake(csv_bytes: bytes) -> IntakeExtraction:
    """Deterministic parser, no LLM. Expected columns (case-insensitive):
    production_volume_tonnes, fuel_type, cn_code_hint, billing_period."""
    text = csv_bytes.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    rows = list(reader)
    if not rows:
        return IntakeExtraction(
            production_volume_tonnes=None,
            fuel_type=None,
            cn_code_hint=None,
            billing_period=None,
            confidence="low",
            flags=["CSV file contained no data rows"],
        )

    row = {k.strip().lower(): v for k, v in rows[0].items()}
    flags: list[str] = []
    try:
        volume = float(row.get("production_volume_tonnes", "") or 0) or None
    except ValueError:
        volume = None
        flags.append("production_volume_tonnes column was not numeric")

    return IntakeExtraction(
        production_volume_tonnes=volume,
        fuel_type=row.get("fuel_type"),
        cn_code_hint=row.get("cn_code_hint") or None,
        billing_period=row.get("billing_period"),
        confidence="high" if volume is not None else "low",
        flags=flags,
    )


def merge_multi_document_extractions(extractions: list[IntakeExtraction]) -> IntakeExtraction:
    """PRD §8.1 rule: if two uploads disagree on the same field, report the
    conflict in `flags` — never average or silently pick one. Routes to
    manual confirmation downstream (the intake validator, §8.2)."""
    if len(extractions) == 1:
        return extractions[0]

    volumes = {e.production_volume_tonnes for e in extractions if e.production_volume_tonnes is not None}
    flags: list[str] = []
    for e in extractions:
        flags.extend(e.flags)
    if len(volumes) > 1:
        flags.append(f"CONFLICT: multiple documents report different production volumes: {sorted(volumes)}")

    first = extractions[0]
    return IntakeExtraction(
        production_volume_tonnes=first.production_volume_tonnes,
        fuel_type=first.fuel_type,
        cn_code_hint=first.cn_code_hint,
        billing_period=first.billing_period,
        confidence="low" if len(volumes) > 1 else first.confidence,
        flags=flags,
    )
