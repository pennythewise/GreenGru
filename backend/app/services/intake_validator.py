"""Intake validator (PRD §8.2) — code, not an LLM call. Plausibility checks
that flag anything outside plausible bounds for manual review rather than
silently proceeding."""

from dataclasses import dataclass, field

from app.services.intake_agent import IntakeExtraction

KG_TONNE_CONFUSION_RATIO = 900  # heuristic: values ~1000x plausible range


@dataclass
class ValidationResult:
    status: str  # "passed" | "flagged" | "rejected"
    notes: list[str] = field(default_factory=list)


def validate_intake(
    extraction: IntakeExtraction,
    historical_scale_tonnes: float | None = None,
    measured_intensity_tco2e_per_tonne: float | None = None,
    china_default_intensity_tco2e_per_tonne: float | None = None,
) -> ValidationResult:
    notes: list[str] = list(extraction.flags)
    status = "passed"

    volume = extraction.production_volume_tonnes
    if volume is None or volume <= 0:
        notes.append("production_volume_tonnes missing or not > 0")
        return ValidationResult(status="rejected", notes=notes)

    # kg/tonne confusion heuristic (PRD §8.2, §8.11 edge case #2)
    if historical_scale_tonnes and historical_scale_tonnes > 0:
        ratio = volume / historical_scale_tonnes
        if ratio >= KG_TONNE_CONFUSION_RATIO or ratio <= 1 / KG_TONNE_CONFUSION_RATIO:
            notes.append(
                f"production_volume_tonnes ({volume}) is ~{ratio:.0f}x the company's historical scale "
                f"({historical_scale_tonnes}) — likely a kg/tonne unit confusion, not a generic implausible value"
            )
            status = "flagged"
        elif ratio >= 10 or ratio <= 0.1:
            notes.append(
                f"production_volume_tonnes ({volume}) is outside 10x of historical scale ({historical_scale_tonnes})"
            )
            status = "flagged"

    if extraction.billing_period:
        notes_bp = _check_billing_period(extraction.billing_period)
        if notes_bp:
            notes.append(notes_bp)
            status = "flagged"

    if measured_intensity_tco2e_per_tonne is not None:
        if measured_intensity_tco2e_per_tonne <= 0:
            notes.append("measured_intensity_tco2e_per_tonne must be > 0")
            return ValidationResult(status="rejected", notes=notes)
        if (
            china_default_intensity_tco2e_per_tonne is not None
            and measured_intensity_tco2e_per_tonne > china_default_intensity_tco2e_per_tonne
        ):
            notes.append(
                "measured intensity is WORSE than the China default for this route — flagged for human "
                "review before it drives a passport, per PRD §8.2 (rare but possible)"
            )
            status = "flagged"

    any_conflict = any(n.upper().startswith("CONFLICT") for n in notes)
    if any_conflict:
        status = "flagged"

    return ValidationResult(status=status, notes=notes)


def _check_billing_period(billing_period: str) -> str | None:
    # Lightweight sanity check — a full implementation would parse real
    # dates; this keeps the reference implementation dependency-free.
    if not billing_period or len(billing_period) < 4:
        return "billing_period is missing or unparseable"
    return None
