"""Parse Chinese VAT invoice fields from OCR / PDF text.

Uses regex heuristics first, then optional LLM structured extraction.
Any missing field is filled from the closest mock invoice template.
"""

from __future__ import annotations

import re
from copy import deepcopy
from typing import Any

from app.data.mock_invoices import pick_mock_invoice
from app.services.llm_client import call_structured

INVOICE_PARSE_SYSTEM = """You extract fields from a Chinese 增值税专用发票 OCR text blob.
Return JSON only:
{
  "invoiceCode": string,
  "invoiceNumber": string,
  "issueDate": "YYYY-MM-DD",
  "buyer": {"name": string, "taxId": string, "addressPhone": string, "bankAccount": string},
  "seller": {"name": string, "taxId": string, "addressPhone": string, "bankAccount": string},
  "items": [{"name": string, "spec": string, "unit": string, "qty": string, "unitPrice": string, "amount": string, "taxRate": string, "tax": string}],
  "totalAmount": string,
  "totalTax": string,
  "totalWithTax": string,
  "payee": string,
  "reviewer": string,
  "issuer": string
}
Use empty strings for fields you cannot find. Do not invent numbers."""


def _first(pattern: str, text: str, flags: int = 0) -> str:
    m = re.search(pattern, text, flags)
    return m.group(1).strip() if m else ""


def _normalize_date(raw: str) -> str:
    if not raw:
        return ""
    m = re.search(r"(\d{4})[年\-/](\d{1,2})[月\-/](\d{1,2})", raw)
    if not m:
        return raw
    y, mo, d = m.groups()
    return f"{y}-{int(mo):02d}-{int(d):02d}"


def _regex_parse(text: str) -> dict[str, Any]:
    invoice_code = _first(r"发票代码[：:\s]*(\d{10,12})", text)
    invoice_number = _first(r"发票号码[：:\s]*(?:No\.?\s*)?(\d{6,12})", text, re.I)
    issue_date = _normalize_date(_first(r"开票日期[：:\s]*([^\n]+)", text))

    buyer_name = _first(r"购买方[\s\S]{0,120}?名\s*称[：:\s]*([^\n]+)", text)
    seller_name = _first(r"销售方[\s\S]{0,120}?名\s*称[：:\s]*([^\n]+)", text)
    buyer_tax = _first(r"购买方[\s\S]{0,200}?纳税人识别号[：:\s]*([A-Z0-9]+)", text, re.I)
    seller_tax = _first(r"销售方[\s\S]{0,200}?纳税人识别号[：:\s]*([A-Z0-9]+)", text, re.I)

    total_amount = _first(r"合\s*计[^\d¥]*¥?\s*([\d,]+\.?\d*)", text)
    total_tax = _first(r"合\s*计[\s\S]{0,80}?税额[^\d¥]*¥?\s*([\d,]+\.?\d*)", text)
    total_with_tax = _first(r"价税合计[^\d¥]*¥?\s*([\d,]+\.?\d*)", text)

    return {
        "invoiceCode": invoice_code,
        "invoiceNumber": invoice_number,
        "issueDate": issue_date,
        "buyer": {
            "name": buyer_name,
            "taxId": buyer_tax,
            "addressPhone": "",
            "bankAccount": "",
        },
        "seller": {
            "name": seller_name,
            "taxId": seller_tax,
            "addressPhone": "",
            "bankAccount": "",
        },
        "items": [],
        "totalAmount": total_amount.replace(",", ""),
        "totalTax": total_tax.replace(",", ""),
        "totalWithTax": total_with_tax.replace(",", ""),
        "payee": _first(r"收款人[：:\s]*([^\s]+)", text),
        "reviewer": _first(r"复核[：:\s]*([^\s]+)", text),
        "issuer": _first(r"开票人[：:\s]*([^\s]+)", text),
    }


def _merge_with_mock(parsed: dict[str, Any], filename: str, ocr_text: str) -> dict[str, Any]:
    mock = pick_mock_invoice(filename, ocr_text)
    mock.pop("_mock_template", None)
    out = deepcopy(mock)

    def fill_party(key: str) -> None:
        for field in ("name", "taxId", "addressPhone", "bankAccount"):
            val = (parsed.get(key) or {}).get(field) or ""
            if val:
                out[key][field] = val

    for scalar in ("invoiceCode", "invoiceNumber", "issueDate", "totalAmount", "totalTax", "totalWithTax", "payee", "reviewer", "issuer"):
        val = parsed.get(scalar) or ""
        if val:
            out[scalar] = val

    fill_party("buyer")
    fill_party("seller")

    if parsed.get("items"):
        out["items"] = parsed["items"]

    return out


def parse_invoice_from_text(text: str, filename: str, *, use_llm: bool = True) -> tuple[dict[str, Any], list[str]]:
    """Return (invoice_dict, field_flags). field_flags lists fields filled from mock."""
    text = (text or "").strip()
    regex_parsed = _regex_parse(text) if text else {}

    llm_parsed: dict[str, Any] = {}
    if use_llm and text and len(text) > 40:
        try:
            llm_parsed = call_structured(
                model="qwen-flash",
                system_prompt=INVOICE_PARSE_SYSTEM,
                user_prompt=f"Filename: {filename}\n\nOCR text:\n{text[:12000]}",
                mock_response=regex_parsed or pick_mock_invoice(filename, text),
            )
            llm_parsed.pop("_mock", None)
        except Exception:
            llm_parsed = {}

    merged_source = llm_parsed if llm_parsed else regex_parsed
    invoice = _merge_with_mock(merged_source, filename, text)

    flags: list[str] = []
    mock = pick_mock_invoice(filename, text)
    for key in ("invoiceCode", "invoiceNumber", "issueDate", "totalAmount", "totalTax", "totalWithTax"):
        if not (merged_source.get(key) or regex_parsed.get(key)):
            flags.append(key)
    for party in ("buyer", "seller"):
        for field in ("name", "taxId"):
            if not ((merged_source.get(party) or {}).get(field) or (regex_parsed.get(party) or {}).get(field)):
                flags.append(f"{party}.{field}")
    if not merged_source.get("items") and not regex_parsed.get("items"):
        flags.append("items")

    if flags:
        flags.insert(0, f"mock_fallback:{mock.get('_mock_template', 'default')}")

    return invoice, flags


def product_description_from_invoice(invoice: dict[str, Any]) -> str:
    items = invoice.get("items") or []
    if not items:
        return "steel product"
    parts = [f"{it.get('name', '')} {it.get('spec', '')}".strip() for it in items]
    return "; ".join(p for p in parts if p) or "steel product"


def total_tonnes_from_invoice(invoice: dict[str, Any]) -> float | None:
    total = 0.0
    found = False
    for it in invoice.get("items") or []:
        unit = (it.get("unit") or "").strip()
        if unit not in ("吨", "t", "T"):
            continue
        try:
            total += float(str(it.get("qty", "0")).replace(",", ""))
            found = True
        except ValueError:
            continue
    return total if found else None
