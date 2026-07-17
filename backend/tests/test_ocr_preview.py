"""Tests for OCR preview endpoint (PaddleOCR integration + mock fallback)."""

from io import BytesIO

from fastapi.testclient import TestClient

from app.main import app


def test_ocr_preview_image_returns_invoice_and_classification():
    png_bytes = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
        b"\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    )
    with TestClient(app) as client:
        resp = client.post(
            "/api/intake/ocr-preview",
            files={"file": ("sample_A1_special_vat_invoice.png", BytesIO(png_bytes), "image/png")},
        )
    assert resp.status_code == 200
    data = resp.json()
    assert data["invoice"]["invoiceCode"]
    assert data["classification"]["cnCode"]
    assert data["ocr_source"] in {"mock", "paddleocr", "qwen3.7-plus"}
    assert "buyer" in data["invoice"]


def test_ocr_preview_pdf_embedding_metadata():
    pdf = (
        b"%PDF-1.1\n"
        b"1 0 obj<<>>endobj\n"
        b"2 0 obj<</Length 44>>stream\n"
        b"BT /F1 12 Tf 100 700 Td (VAT invoice test) Tj ET\n"
        b"endstream\nendobj\n"
        b"3 0 obj<</Type/Page/Parent 4 0 R/Contents 2 0 R>>endobj\n"
        b"4 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
        b"5 0 obj<</Type/Catalog/Pages 4 0 R>>endobj\n"
        b"xref\n0 6\ntrailer<</Size 6/Root 5 0 R>>\nstartxref\n0\n%%EOF"
    )
    with TestClient(app) as client:
        resp = client.post(
            "/api/intake/ocr-preview",
            files={"file": ("invoice.pdf", BytesIO(pdf), "application/pdf")},
        )
    assert resp.status_code == 200
    data = resp.json()
    assert data["pdf_embedding"] is not None
    assert data["pdf_embedding"]["storage"] in {"local", "supabase", "none"}
