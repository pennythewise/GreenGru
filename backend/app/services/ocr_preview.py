"""OCR preview orchestration for the New Submission upload zone."""

from __future__ import annotations

import asyncio
import logging
from pathlib import Path

from app.config import get_settings
from app.data.cn_codes import SUPPORTED_CN_CODES
from app.schemas import (
    ClassificationPreviewOut,
    InvoiceDataOut,
    InvoiceLineItemOut,
    InvoicePartyOut,
    OcrPreviewOut,
    PdfEmbeddingOut,
    SourceCitation,
)
from app.services.chineseocr_client import ocr_image_bytes
from app.services.ocr_vision import ocr_image_with_vision
from app.services.classifier_agent import classify_product
from app.services.invoice_parser import (
    parse_invoice_from_text,
    product_description_from_invoice,
    total_tonnes_from_invoice,
)
from app.services.pdf_embedding import embed_pdf_and_store, extract_pdf_text

logger = logging.getLogger(__name__)
settings = get_settings()

IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"}
PDF_EXT = {".pdf"}


def _party(data: dict) -> InvoicePartyOut:
    return InvoicePartyOut(
        name=data.get("name") or "",
        taxId=data.get("taxId") or "",
        addressPhone=data.get("addressPhone") or "",
        bankAccount=data.get("bankAccount") or "",
    )


def _invoice_out(data: dict) -> InvoiceDataOut:
    return InvoiceDataOut(
        invoiceCode=data.get("invoiceCode") or "",
        invoiceNumber=data.get("invoiceNumber") or "",
        issueDate=data.get("issueDate") or "",
        buyer=_party(data.get("buyer") or {}),
        seller=_party(data.get("seller") or {}),
        items=[
            InvoiceLineItemOut(
                name=it.get("name") or "",
                spec=it.get("spec") or "",
                unit=it.get("unit") or "",
                qty=it.get("qty") or "",
                unitPrice=it.get("unitPrice") or "",
                amount=it.get("amount") or "",
                taxRate=it.get("taxRate") or "",
                tax=it.get("tax") or "",
            )
            for it in data.get("items") or []
        ],
        totalAmount=data.get("totalAmount") or "",
        totalTax=data.get("totalTax") or "",
        totalWithTax=data.get("totalWithTax") or "",
        payee=data.get("payee") or "",
        reviewer=data.get("reviewer") or "",
        issuer=data.get("issuer") or "",
    )


def _classification_out(invoice: dict, result) -> ClassificationPreviewOut:
    entry = SUPPORTED_CN_CODES.get(result.cn_code)
    cn_label = (
        f"{entry.description_en} · {entry.description_cn}"
        if entry
        else "Product outside locked 8-code table"
    )
    route = "BF-BOF"
    return ClassificationPreviewOut(
        cnCode=result.cn_code if result.cn_code != "out_of_scope" else "7213 / 7214",
        cnLabel=cn_label,
        flashConfidence=int(round((result.confidence if not result.escalated else 0.63) * 100)),
        escalated=result.escalated,
        plusConfidence=int(round(result.confidence * 100)) if result.escalated else None,
        route=route,
        benchmark="EU benchmark 1.370 tCO2e/t (IR 2025/2621)",
        defaultIntensity="China default 3.506 tCO2e/t (China GHG Factor DB v2)",
    )


def _mock_classification_preview(product_desc: str) -> ClassificationPreviewOut:
    """Deterministic preview when Qwen classify is unavailable."""
    desc = product_desc.lower()
    if "卷板" in desc or "hrc" in desc or "q235" in desc:
        cn_code = "7208 10 00"
        label = "Hot-rolled coil (HRC) · 热轧卷板"
    elif "线材" in desc or "swrch" in desc:
        cn_code = "7213"
        label = "Hot-rolled bars · 热轧圆钢"
    elif "碳结圆" in desc or "圆钢" in desc:
        cn_code = "7213 / 7214"
        label = "热轧圆钢 / 盘条 · bars & rods, hot-rolled, non-alloy steel"
    else:
        cn_code = "7213 / 7214"
        label = "热轧圆钢 / 盘条 · bars & rods, hot-rolled, non-alloy steel"

    return ClassificationPreviewOut(
        cnCode=cn_code,
        cnLabel=label,
        flashConfidence=63,
        escalated=True,
        plusConfidence=91,
        route="BF-BOF",
        benchmark="EU benchmark 1.370 tCO2e/t (IR 2025/2621)",
        defaultIntensity="China default 3.506 tCO2e/t (China GHG Factor DB v2)",
    )


async def _ocr_image_intake(content: bytes, filename: str) -> tuple[str, str, list[str]]:
    """chineseocr (5s) → qwen3.7-plus (5s) → mock — or mock only when OCR_MOCK_ONLY=true."""
    if settings.ocr_mock_only:
        return "", "mock", ["ocr:mock_only_mode"]

    flags: list[str] = []
    timeout = settings.ocr_intake_timeout_s

    # 1 · chineseocr sidecar
    try:
        lines, source = await asyncio.wait_for(
            ocr_image_bytes(content, filename=filename, timeout_s=timeout),
            timeout=timeout,
        )
        if lines and source == "chineseocr":
            return "\n".join(lines), "chineseocr", flags
        flags.append("ocr:chineseocr_empty_or_unavailable")
    except TimeoutError:
        logger.warning("chineseocr timed out after %ss for %s", timeout, filename)
        flags.append(f"ocr:chineseocr_timeout_{timeout}s")
    except Exception as exc:  # noqa: BLE001
        logger.warning("chineseocr failed for %s: %s", filename, exc)
        flags.append("ocr:chineseocr_failed")

    # 2 · qwen3.7-plus
    try:
        vision_text, vision_source = await asyncio.wait_for(
            ocr_image_with_vision(content, filename=filename),
            timeout=timeout,
        )
        if vision_text.strip() and vision_source == "qwen3.7-plus":
            return vision_text, "qwen3.7-plus", flags
        flags.append("ocr:qwen37_empty_or_unavailable")
    except TimeoutError:
        logger.warning("qwen3.7-plus OCR timed out after %ss for %s", timeout, filename)
        flags.append(f"ocr:qwen37_timeout_{timeout}s")
    except Exception as exc:  # noqa: BLE001
        logger.warning("qwen3.7-plus OCR failed for %s: %s", filename, exc)
        flags.append("ocr:qwen37_failed")

    # 3 · mock template fill (no OCR text)
    flags.append("ocr:mock_fallback")
    return "", "mock", flags


async def run_ocr_preview(*, content: bytes, filename: str) -> OcrPreviewOut:
    ext = Path(filename or "").suffix.lower()
    ocr_source = "mock"
    ocr_text = ""
    pdf_embedding: PdfEmbeddingOut | None = None

    if ext in PDF_EXT:
        if settings.ocr_mock_only:
            ocr_source = "mock"
        else:
            ocr_text = extract_pdf_text(content)
            ocr_source = "pdf_text" if ocr_text.strip() else "mock"
        try:
            embed_result = await embed_pdf_and_store(content=content, filename=filename)
            pdf_embedding = PdfEmbeddingOut(**embed_result)
        except Exception:
            pdf_embedding = PdfEmbeddingOut(embedded=False, reason="embedding_failed", storage="none")
    elif ext in IMAGE_EXT:
        ocr_text, ocr_source, intake_flags = await _ocr_image_intake(content, filename)
    else:
        try:
            ocr_text = content.decode("utf-8")
            ocr_source = "plain_text"
        except UnicodeDecodeError:
            ocr_source = "mock"

    invoice_dict, mock_fields = parse_invoice_from_text(
        ocr_text,
        filename,
        use_llm=not settings.ocr_mock_only,
    )
    if ext in IMAGE_EXT:
        mock_fields = intake_flags + list(mock_fields)
    elif ocr_source == "mock":
        prefix = ["ocr:mock_only_mode"] if settings.ocr_mock_only else ["ocr:mock_fallback_no_text"]
        mock_fields = prefix + list(mock_fields)
    product_desc = product_description_from_invoice(invoice_dict)
    try:
        classification = classify_product(product_desc, cn_code_hint=None)
        classification_out = _classification_out(invoice_dict, classification)
    except Exception:
        mock_fields.append("classification:qwen_fallback")
        classification_out = _mock_classification_preview(product_desc)
    tonnes = total_tonnes_from_invoice(invoice_dict)

    sources = [
        SourceCitation(
            constant="OCR engine",
            value=ocr_source,
            citation=f"chineseocr → qwen3.7-plus → mock ({settings.ocr_intake_timeout_s}s per step)",
        ),
    ]
    if pdf_embedding and pdf_embedding.embedded:
        sources.append(
            SourceCitation(
                constant="PDF embedding",
                value=f"{pdf_embedding.chunk_count} chunks → {pdf_embedding.storage}",
                citation="Qwen text-embedding-v4 · Supabase pgvector",
            )
        )

    return OcrPreviewOut(
        invoice=_invoice_out(invoice_dict),
        classification=classification_out,
        ocr_source=ocr_source,
        ocr_text_preview=ocr_text[:400],
        mock_fields=mock_fields,
        production_volume_tonnes=tonnes,
        pdf_embedding=pdf_embedding,
        sources=sources,
    )
