"""EU CBAM certificate price by quarter — published quarterly, must be
refreshed each quarter, never hardcoded as a single permanent constant
(PRD §6.2). This module is the one place that changes each quarter.

Source: EU ETS allowance auction price, quarterly average for 2026 (per
Regulation (EU) 2023/956 — quarterly average in 2026, weekly average from
2027 onwards per the phase-in). Add a new row here each quarter rather than
overwriting the previous one, so historical submissions keep the price that
was actually in effect when they were calculated.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class CertificatePriceEntry:
    quarter: str
    price_eur_per_tco2e: float
    source_note: str


CERTIFICATE_PRICE_HISTORY: dict[str, CertificatePriceEntry] = {
    "Q1-2026": CertificatePriceEntry(
        quarter="Q1-2026",
        price_eur_per_tco2e=75.36,
        source_note="EU ETS allowance auction price, Q1 2026 quarterly average",
    ),
}


class NoCertificatePriceForQuarter(Exception):
    """Raised when the pipeline is asked to calculate against a quarter with
    no price row on file. Per PRD §8.4, this must be a hard stop with an
    operator-facing error — never silently reuse a stale quarter."""


def get_certificate_price(quarter: str) -> CertificatePriceEntry:
    entry = CERTIFICATE_PRICE_HISTORY.get(quarter)
    if entry is None:
        raise NoCertificatePriceForQuarter(
            f"No certificate price on file for {quarter}. Add a row to "
            f"CERTIFICATE_PRICE_HISTORY in app/data/cert_price.py before "
            f"calculating against this quarter — do not reuse a stale price."
        )
    return entry


def latest_quarter() -> str:
    """Returns the most recently added quarter. In production this should
    be driven by the current date, not just 'last dict entry' — flagged
    here rather than silently assumed correct."""
    return next(reversed(CERTIFICATE_PRICE_HISTORY))
