"""Deterministic cross-check for OCR / vision invoice extraction.

LLM/OCR only *propose* field strings. This module verifies numeric
consistency with pure arithmetic and optional OCR-text presence —
never invents regulated CBAM/loan/grant numbers.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any, Literal

Status = Literal["pass", "warn", "fail"]

# Relative or absolute tolerance for Chinese VAT invoice rounding.
_REL_TOL = 0.012  # 1.2%
_ABS_TOL = 0.06  # ¥0.06


@dataclass
class ExtractionCheck:
    id: str
    status: Status
    field: str
    message_en: str
    message_zh: str
    expected: str | None = None
    actual: str | None = None


@dataclass
class ExtractionVerification:
    status: Status
    score_pct: int
    checks: list[ExtractionCheck] = field(default_factory=list)
    summary_en: str = ""
    summary_zh: str = ""


def parse_number(raw: str | None) -> float | None:
    """Parse invoice amount strings (commas, full-width digits, ¥/￥)."""
    if raw is None:
        return None
    text = str(raw).strip()
    if not text:
        return None
    # Full-width → ASCII
    trans = str.maketrans("０１２３４５６７８９．，￥¥", "0123456789..  ")
    text = text.translate(trans)
    text = text.replace(",", "").replace(" ", "")
    text = re.sub(r"[^\d.\-]", "", text)
    if not text or text in {".", "-", "-."}:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def _close(a: float, b: float) -> bool:
    if a == b:
        return True
    scale = max(abs(a), abs(b), 1.0)
    return abs(a - b) <= max(_ABS_TOL, _REL_TOL * scale)


def _digit_token(n: float) -> str:
    """Normalize for OCR-text presence (strip trailing .0 noise)."""
    if abs(n - round(n)) < 1e-9:
        return str(int(round(n)))
    s = f"{n:.4f}".rstrip("0").rstrip(".")
    return s.replace(".", "")


def _number_in_ocr(n: float, ocr_digits: str) -> bool:
    token = _digit_token(n)
    if len(token) < 2:
        return True  # too short to judge
    return token in ocr_digits


def _ocr_digit_blob(ocr_text: str) -> str:
    # Keep digits only so "4,736.00" / "4736" / "４７３６" all match.
    trans = str.maketrans("０１２３４５６７８９", "0123456789")
    return re.sub(r"\D", "", (ocr_text or "").translate(trans))


def verify_invoice_extraction(
    invoice: dict[str, Any],
    *,
    ocr_text: str = "",
    mock_fields: list[str] | None = None,
    ocr_source: str = "",
) -> ExtractionVerification:
    """Run arithmetic + OCR presence checks on extracted invoice fields."""
    checks: list[ExtractionCheck] = []
    mock_fields = mock_fields or []
    items = invoice.get("items") or []
    ocr_digits = _ocr_digit_blob(ocr_text)
    skip_ocr_presence = (
        not ocr_text.strip()
        or ocr_source in {"mock", ""}
        or any(f.startswith("ocr:mock") for f in mock_fields)
    )

    line_amounts: list[float] = []
    for i, item in enumerate(items):
        qty = parse_number(item.get("qty"))
        price = parse_number(item.get("unitPrice"))
        amount = parse_number(item.get("amount"))
        label = f"items[{i}]"
        name = (item.get("name") or f"line {i + 1}").strip()

        if qty is None or price is None or amount is None:
            checks.append(
                ExtractionCheck(
                    id=f"line_parse_{i}",
                    status="warn",
                    field=label,
                    message_en=f"Line “{name}”: qty / unitPrice / amount incomplete — cannot verify arithmetic.",
                    message_zh=f"明细「{name}」：数量/单价/金额不完整，无法验算。",
                    actual=f"qty={item.get('qty')!s} · unitPrice={item.get('unitPrice')!s} · amount={item.get('amount')!s}",
                )
            )
            continue

        line_amounts.append(amount)
        expected = qty * price
        if _close(expected, amount):
            checks.append(
                ExtractionCheck(
                    id=f"line_mul_{i}",
                    status="pass",
                    field=label,
                    message_en=f"Line “{name}”: qty × unitPrice matches amount.",
                    message_zh=f"明细「{name}」：数量 × 单价 = 金额。",
                    expected=f"{expected:.2f}",
                    actual=f"{amount:.2f}",
                )
            )
        else:
            checks.append(
                ExtractionCheck(
                    id=f"line_mul_{i}",
                    status="fail",
                    field=label,
                    message_en=f"Line “{name}”: qty × unitPrice ≠ amount (OCR/vision likely misread a number).",
                    message_zh=f"明细「{name}」：数量 × 单价 ≠ 金额（OCR/视觉可能误读数字）。",
                    expected=f"{expected:.2f}",
                    actual=f"{amount:.2f}",
                )
            )

        if not skip_ocr_presence:
            missing = [
                label
                for label, val in (("qty", qty), ("unitPrice", price), ("amount", amount))
                if not _number_in_ocr(val, ocr_digits)
            ]
            if missing:
                checks.append(
                    ExtractionCheck(
                        id=f"line_ocr_{i}",
                        status="warn",
                        field=label,
                        message_en=f"Line “{name}”: extracted {', '.join(missing)} digit sequence not found in OCR text.",
                        message_zh=f"明细「{name}」：提取的 {', '.join(missing)} 数字串未在 OCR 原文中找到。",
                    )
                )

    total_amount = parse_number(invoice.get("totalAmount"))
    total_tax = parse_number(invoice.get("totalTax"))
    total_with_tax = parse_number(invoice.get("totalWithTax"))

    if line_amounts and total_amount is not None:
        summed = sum(line_amounts)
        if _close(summed, total_amount):
            checks.append(
                ExtractionCheck(
                    id="sum_lines",
                    status="pass",
                    field="totalAmount",
                    message_en="Sum of line amounts matches totalAmount.",
                    message_zh="明细金额合计 = 合计金额。",
                    expected=f"{summed:.2f}",
                    actual=f"{total_amount:.2f}",
                )
            )
        else:
            checks.append(
                ExtractionCheck(
                    id="sum_lines",
                    status="fail",
                    field="totalAmount",
                    message_en="Sum of line amounts ≠ totalAmount.",
                    message_zh="明细金额合计 ≠ 合计金额。",
                    expected=f"{summed:.2f}",
                    actual=f"{total_amount:.2f}",
                )
            )
    elif not line_amounts:
        checks.append(
            ExtractionCheck(
                id="sum_lines",
                status="warn",
                field="items",
                message_en="No numeric line items to sum-check.",
                message_zh="无线上可验算的明细金额。",
            )
        )

    if total_amount is not None and total_tax is not None and total_with_tax is not None:
        expected_twt = total_amount + total_tax
        if _close(expected_twt, total_with_tax):
            checks.append(
                ExtractionCheck(
                    id="total_plus_tax",
                    status="pass",
                    field="totalWithTax",
                    message_en="totalAmount + totalTax matches totalWithTax.",
                    message_zh="合计金额 + 税额 = 价税合计。",
                    expected=f"{expected_twt:.2f}",
                    actual=f"{total_with_tax:.2f}",
                )
            )
        else:
            checks.append(
                ExtractionCheck(
                    id="total_plus_tax",
                    status="fail",
                    field="totalWithTax",
                    message_en="totalAmount + totalTax ≠ totalWithTax.",
                    message_zh="合计金额 + 税额 ≠ 价税合计。",
                    expected=f"{expected_twt:.2f}",
                    actual=f"{total_with_tax:.2f}",
                )
            )
    else:
        checks.append(
            ExtractionCheck(
                id="total_plus_tax",
                status="warn",
                field="totals",
                message_en="Totals incomplete — skipped amount+tax check.",
                message_zh="合计字段不完整，跳过价税验算。",
            )
        )

    if not skip_ocr_presence:
        for field_key, val in (
            ("totalAmount", total_amount),
            ("totalTax", total_tax),
            ("totalWithTax", total_with_tax),
            ("invoiceNumber", parse_number(invoice.get("invoiceNumber"))),
        ):
            if val is None:
                continue
            if field_key == "invoiceNumber":
                # invoice numbers are digit strings; use raw
                raw = re.sub(r"\D", "", str(invoice.get("invoiceNumber") or ""))
                ok = len(raw) >= 6 and raw in ocr_digits
            else:
                ok = _number_in_ocr(val, ocr_digits)
            if not ok:
                checks.append(
                    ExtractionCheck(
                        id=f"ocr_{field_key}",
                        status="warn",
                        field=field_key,
                        message_en=f"{field_key} digits not found in OCR text — possible hallucination or crop miss.",
                        message_zh=f"{field_key} 数字未在 OCR 原文中出现 — 可能是幻觉或裁切漏读。",
                        actual=str(invoice.get(field_key) or ""),
                    )
                )

    numeric_mock = [
        f
        for f in mock_fields
        if any(
            k in f
            for k in (
                "items",
                "totalAmount",
                "totalTax",
                "totalWithTax",
                "qty",
                "unitPrice",
                "amount",
            )
        )
    ]
    if numeric_mock:
        checks.append(
            ExtractionCheck(
                id="mock_numeric",
                status="warn",
                field="mock_fields",
                message_en=f"Numeric fields filled from mock template: {', '.join(numeric_mock[:6])}.",
                message_zh=f"数字字段来自模拟模板：{', '.join(numeric_mock[:6])}。",
            )
        )

    fails = sum(1 for c in checks if c.status == "fail")
    warns = sum(1 for c in checks if c.status == "warn")
    passes = sum(1 for c in checks if c.status == "pass")
    total = max(len(checks), 1)
    # Score: pass=1, warn=0.5, fail=0
    score = int(round(100 * (passes + 0.5 * warns) / total))

    if fails:
        status: Status = "fail"
        summary_en = f"{fails} arithmetic mismatch(es) — edit numbers or re-upload before trusting the extract."
        summary_zh = f"{fails} 处算术不一致 — 请改数或重新上传后再信此提取结果。"
    elif warns:
        status = "warn"
        summary_en = f"{warns} warning(s) — review highlighted fields; arithmetic OK or incomplete."
        summary_zh = f"{warns} 条告警 — 请复核标出字段；算术通过或不完整。"
    else:
        status = "pass"
        summary_en = "All extraction cross-checks passed."
        summary_zh = "全部提取交叉校验通过。"

    return ExtractionVerification(
        status=status,
        score_pct=score,
        checks=checks,
        summary_en=summary_en,
        summary_zh=summary_zh,
    )


def verification_to_out(v: ExtractionVerification) -> "ExtractionVerificationOut":
    """Map dataclass → Pydantic response (single place for OCR + re-verify)."""
    from app.schemas import ExtractionCheckOut, ExtractionVerificationOut

    return ExtractionVerificationOut(
        status=v.status,
        score_pct=v.score_pct,
        summary_en=v.summary_en,
        summary_zh=v.summary_zh,
        checks=[
            ExtractionCheckOut(
                id=c.id,
                status=c.status,
                field=c.field,
                message_en=c.message_en,
                message_zh=c.message_zh,
                expected=c.expected,
                actual=c.actual,
            )
            for c in v.checks
        ],
    )


def verification_to_dict(v: ExtractionVerification) -> dict[str, Any]:
    """Dict form of :func:`verification_to_out` (tests / local JSON)."""
    return verification_to_out(v).model_dump()
