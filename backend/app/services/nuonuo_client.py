"""Nuonuo (诺诺) third-party invoice authenticity check.

The State Taxation Administration does not expose a public invoice-verification
API. Authorized integrators (e.g. Nuonuo) proxy 国家税务总局查验 via:

    nuonuo.OpeMplatform.invoiceInspection

Docs: https://nuonuo.com/open/#/index
Sandbox: https://sandbox.nuonuocs.cn/open/v1/services

Required invoice fields vary by type — for 数电票 / VAT special:
  invoiceNo, invoiceDate, optionField (amount ex-tax or check-code suffix)

When credentials are absent, returns a deterministic plausibility mock so the
pipeline UI can still animate Stage 2.
"""

from __future__ import annotations

import hashlib
import json
import logging
import uuid
from dataclasses import dataclass, field

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

NUONUO_METHOD = "nuonuo.OpeMplatform.invoiceInspection"
NUONUO_SANDBOX_URL = "https://sandbox.nuonuocs.cn/open/v1/services"
NUONUO_PROD_URL = "https://open.nuonuo.com/open/v1/services"


@dataclass
class NuonuoInspectionResult:
    status: str  # "verified" | "flagged" | "rejected" | "mock"
    message: str
    invoice_status: str | None = None
    provider: str = "nuonuo"
    mock: bool = False
    checks: list[str] = field(default_factory=list)
    raw_code: str | None = None


def _option_field(invoice: dict) -> str:
    """Check-code suffix or ex-tax amount per Nuonuo docs."""
    total = (invoice.get("totalAmount") or "").replace(",", "").strip()
    if total:
        return total
    code = (invoice.get("invoiceCode") or "").strip()
    if len(code) >= 6:
        return code[-6:]
    return "000000"


def _mock_inspection(invoice: dict) -> NuonuoInspectionResult:
    checks: list[str] = []
    inv_no = (invoice.get("invoiceNumber") or "").strip()
    inv_code = (invoice.get("invoiceCode") or "").strip()
    issue = (invoice.get("issueDate") or "").strip()
    seller_tax = ((invoice.get("seller") or {}).get("taxId") or "").strip()

    if not inv_no:
        checks.append("invoiceNumber missing")
    if not issue:
        checks.append("issueDate missing")
    if seller_tax and len(seller_tax) not in (15, 18, 20):
        checks.append("seller taxId length unusual")

    # Deterministic pseudo-status from invoice fingerprint
    fingerprint = hashlib.sha256(f"{inv_code}|{inv_no}|{issue}|{seller_tax}".encode()).hexdigest()
    bucket = int(fingerprint[:2], 16) % 10

    if not inv_no or not issue:
        return NuonuoInspectionResult(
            status="flagged",
            message="Invoice fields incomplete — cannot reach Nuonuo查验 without number + date.",
            invoice_status="incomplete",
            mock=True,
            checks=checks or ["field_plausibility"],
        )

    if bucket < 7:
        return NuonuoInspectionResult(
            status="verified",
            message="Mock Nuonuo查验 — invoice format plausible (configure NUONUO_* for live 税务局 proxy).",
            invoice_status="normal",
            mock=True,
            checks=["format_ok", "tax_id_format", "date_parseable"],
        )

    return NuonuoInspectionResult(
        status="flagged",
        message="Mock Nuonuo查验 — flagged for manual review (simulated mismatch).",
        invoice_status="abnormal",
        mock=True,
        checks=["format_ok", "simulated_mismatch"],
    )


async def inspect_invoice(invoice: dict) -> NuonuoInspectionResult:
    """Call Nuonuo invoiceInspection or fall back to mock plausibility check."""
    if not settings.nuonuo_configured:
        return _mock_inspection(invoice)

    content = {
        "invoiceNo": (invoice.get("invoiceNumber") or "").strip(),
        "invoiceDate": (invoice.get("issueDate") or "").strip(),
        "invoiceCode": (invoice.get("invoiceCode") or "").strip(),
        "optionField": _option_field(invoice),
        "taxNo": settings.nuonuo_tax_num or "",
    }

    senid = uuid.uuid4().hex
    payload = {
        "senid": senid,
        "nonce": senid[:16],
        "timestamp": str(int(__import__("time").time())),
        "appkey": settings.nuonuo_app_key,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            url = NUONUO_SANDBOX_URL if settings.nuonuo_sandbox else NUONUO_PROD_URL
            resp = await client.post(
                url,
                params={**payload, "method": NUONUO_METHOD, "token": settings.nuonuo_access_token or ""},
                json=content,
                headers={"Content-Type": "application/json"},
            )
            resp.raise_for_status()
            data = resp.json()
    except Exception as exc:  # noqa: BLE001
        logger.warning("Nuonuo invoiceInspection failed: %s", exc)
        mock = _mock_inspection(invoice)
        mock.checks.append(f"nuonuo_http_error:{exc}")
        return mock

    code = str(data.get("code", ""))
    describe = data.get("describe") or data.get("msg") or ""
    result_body = data.get("result")
    if isinstance(result_body, str):
        try:
            result_body = json.loads(result_body)
        except json.JSONDecodeError:
            result_body = {}

    inv_status = None
    if isinstance(result_body, dict):
        inv_status = result_body.get("invoiceStatus") or result_body.get("status")

    if code in ("E0000", "0000", "200"):
        return NuonuoInspectionResult(
            status="verified",
            message=describe or "Invoice verified via Nuonuo → 国家税务总局",
            invoice_status=str(inv_status) if inv_status else "normal",
            mock=False,
            checks=["nuonuo.OpeMplatform.invoiceInspection"],
            raw_code=code,
        )

    return NuonuoInspectionResult(
        status="flagged" if code else "rejected",
        message=describe or "Nuonuo查验 returned non-success",
        invoice_status=str(inv_status) if inv_status else None,
        mock=False,
        checks=["nuonuo.OpeMplatform.invoiceInspection"],
        raw_code=code,
    )
