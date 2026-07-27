"""Unit tests for deterministic OCR extraction cross-check."""

from app.data.mock_invoices import MOCK_INVOICE_A_WHATSAPP
from app.services.extraction_verify import parse_number, verify_invoice_extraction


def test_parse_number_handles_commas_and_currency():
    assert parse_number("¥18,741.61") == 18741.61
    assert parse_number("4.736") == 4.736
    assert parse_number("") is None


def test_mock_invoice_arithmetic_passes():
    result = verify_invoice_extraction(
        MOCK_INVOICE_A_WHATSAPP,
        ocr_text="",
        mock_fields=[],
        ocr_source="mock",
    )
    assert result.status in {"pass", "warn"}
    assert not any(c.status == "fail" for c in result.checks)
    assert result.score_pct >= 50


def test_detects_qty_price_mismatch():
    bad = {
        **MOCK_INVOICE_A_WHATSAPP,
        "items": [
            {
                **MOCK_INVOICE_A_WHATSAPP["items"][0],
                "qty": "4.736",
                "unitPrice": "3957.26",
                "amount": "99999.00",  # wrong
            }
        ],
        "totalAmount": "99999.00",
        "totalTax": "0",
        "totalWithTax": "99999.00",
    }
    result = verify_invoice_extraction(bad, ocr_source="paddleocr", ocr_text="irrelevant")
    assert result.status == "fail"
    assert any(c.id.startswith("line_mul") and c.status == "fail" for c in result.checks)


def test_ocr_presence_warns_when_digits_missing():
    invoice = {
        "invoiceNumber": "05073978",
        "items": [
            {
                "name": "碳结圆",
                "spec": "Φ90",
                "unit": "吨",
                "qty": "4.736",
                "unitPrice": "3957.26",
                "amount": "18741.61",
                "taxRate": "17%",
                "tax": "3186.07",
            }
        ],
        "totalAmount": "18741.61",
        "totalTax": "3186.07",
        "totalWithTax": "21927.68",
    }
    result = verify_invoice_extraction(
        invoice,
        ocr_text="发票号码 05073978 完全没有金额数字",
        ocr_source="paddleocr",
    )
    assert any(c.status == "warn" and "ocr" in c.id for c in result.checks)


def test_verify_extract_api():
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as client:
        resp = client.post(
            "/api/intake/verify-extract",
            json={
                "invoice": MOCK_INVOICE_A_WHATSAPP,
                "ocr_text_preview": "",
                "mock_fields": [],
                "ocr_source": "mock",
            },
        )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in {"pass", "warn", "fail"}
    assert "checks" in data
    assert isinstance(data["score_pct"], int)
