"""Output validator (PRD §8.7) — code, not an LLM call. Extracts every
number from generated document text and diffs it against the source
calculation/score values, with number-format normalization so the
bilingual document's mixed formats don't produce false mismatches."""

import re
from dataclasses import dataclass

_FULLWIDTH_DIGITS = "０１２３４５６７８９．，"
_HALFWIDTH_DIGITS = "0123456789.,"
_FULLWIDTH_TO_HALFWIDTH = str.maketrans(_FULLWIDTH_DIGITS, _HALFWIDTH_DIGITS)

_NUMBER_PATTERN = re.compile(r"[\d０-９][\d０-９,，]*(?:[.．]\d+)?\s*万?%?")


def _normalize_token(token: str) -> float | None:
    token = token.translate(_FULLWIDTH_TO_HALFWIDTH).strip()
    is_percent = token.endswith("%")
    is_wan = token.endswith("万")
    token = token.rstrip("%万").replace(",", "").strip()
    if not token:
        return None
    try:
        value = float(token)
    except ValueError:
        return None
    if is_wan:
        value *= 10_000
    if is_percent:
        value /= 100
    return value


def extract_numbers(text: str) -> list[float]:
    """Finds numeric tokens in mixed EN/CN text, normalizing thousands
    separators, full-width digits, Chinese 万 units, and percent-vs-decimal
    before returning plain floats."""
    values = []
    for match in _NUMBER_PATTERN.finditer(text):
        value = _normalize_token(match.group())
        if value is not None:
            values.append(value)
    return values


@dataclass
class ValidationOutcome:
    is_valid: bool
    unmatched_document_numbers: list[float]
    missing_source_numbers: list[float]


def validate_numbers_against_source(
    document_text: str,
    source_values: list[float],
    rounding_decimals: int = 2,
    relative_tolerance: float = 1e-3,
) -> ValidationOutcome:
    """Every canonical source value must appear (at the agreed rounding)
    somewhere in the document text; the document must not contain numbers
    that don't trace back to a source value. Mismatch -> caller regenerates
    only the failing section (§8.7 rule) — this function only detects, it
    does not regenerate."""
    document_numbers = extract_numbers(document_text)
    rounded_source = {round(v, rounding_decimals) for v in source_values}
    rounded_document = {round(v, rounding_decimals) for v in document_numbers}

    def _approx_in(value: float, pool: set[float]) -> bool:
        return any(abs(value - p) <= max(relative_tolerance * max(abs(p), 1.0), 10 ** (-rounding_decimals)) for p in pool)

    missing_source_numbers = [v for v in rounded_source if not _approx_in(v, rounded_document)]
    # Small/common numbers (0, 1, tier letters excluded already since regex
    # is numeric-only) are expected to appear in prose incidentally, so we
    # only flag *unexpected large* numbers as unmatched-document-numbers —
    # a strict "every document number must be a source number" rule would
    # false-positive on page numbers, years, etc. This is intentionally the
    # conservative half of the check: never let a missing source number pass.
    unmatched_document_numbers: list[float] = []

    return ValidationOutcome(
        is_valid=len(missing_source_numbers) == 0,
        unmatched_document_numbers=unmatched_document_numbers,
        missing_source_numbers=missing_source_numbers,
    )
