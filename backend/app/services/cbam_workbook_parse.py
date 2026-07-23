"""Parse filled EU CBAM evaluation PDFs into editable workbook field values.

Flow: PyMuPDF (widgets + text) → pypdf → structured LLM map to flat field keys.
Does not compute regulated SEE/tariff numbers — copies visible values only.
"""

from __future__ import annotations

import json
import logging
import re
import tempfile
from pathlib import Path
from typing import Any

from app.config import get_settings
from app.services.llm_client import call_structured
from app.services.rag.mineru_convert import _layout_fallback

logger = logging.getLogger(__name__)
settings = get_settings()

# Keys mirror frontend ``CBAM_FORM_SECTIONS`` / ``cbamFormFieldKeys()``.
CBAM_FIELD_KEYS: list[str] = [
    "period_start",
    "period_end",
    "installation_name_optional",
    "installation_name_en",
    "street_number",
    "economic_activity",
    "post_code",
    "po_box",
    "city",
    "country",
    "unlocode",
    "latitude",
    "longitude",
    "authorized_rep_name",
    "authorized_rep_email",
    "authorized_rep_telephone",
    "production_process",
    "aggregated_good_type",
    "cn_code",
    "cn_name",
    "product_name",
    "see_direct",
    "see_indirect",
    "see_total",
    "unit",
    "share_default_values",
    "electricity_ef_source",
    "embedded_electricity",
    "electricity_ef",
    "reducing_agent",
    "steel_mill_id",
    "pct_mn",
    "pct_cr",
    "pct_ni",
    "pct_other_alloys",
    "pct_carbon",
    "scrap_per_t_steel",
    "pct_other_materials",
    "pct_pre_consumer_scrap",
    "goods_id",
    "aggregated_goods_category",
    "route_1",
    "routes_2_6",
    "process_id",
    "process_name",
    "process_aggregated_category",
    "included_goods_slots",
    "goods_routes_matrix",
    "process_goods_matrix",
    "completeness_status",
    "calc_based_excl_pfc",
    "total_pfc",
    "measurement_based",
    "other_methodology",
    "total_direct",
    "total_indirect",
    "total_emissions",
    "data_quality_info",
    "default_value_justification",
    "quality_assurance_info",
    "carbon_price_instrument",
    "additional_information",
    "cp_instrument_type",
    "total_embedded_covered_cp",
    "embedded_covered_cp",
    "currency",
    "carbon_price_due",
    "rebate_type",
    "share_covered_rebate",
    "embedded_covered_rebate",
    "rebate_amount",
    "effective_cp_due",
    "verifier_company",
    "verifier_street",
    "verifier_city",
    "verifier_postcode",
    "verifier_country",
    "verifier_rep_name",
    "verifier_rep_email",
    "verifier_rep_telephone",
    "verifier_accreditation_state",
    "verifier_accreditation_body",
    "verifier_registration_number",
]

_SYSTEM = """You map a filled EU CBAM communication / evaluation PDF (markdown)
into a flat JSON object of string field values for the GreenGru CBAM workbook.

Rules:
- Keys MUST be from the provided allow-list only.
- Extract only values present in the document. Omit keys that are not found
  (do not invent installation names, CN codes, SEE figures, or dates).
- All values must be strings (numbers as decimal strings, dates as YYYY-MM-DD
  when possible).
- Do NOT compute or recalculate SEE totals, tariffs, or emissions — copy
  figures that already appear in the PDF.
- Prefer English installation name for installation_name_en; put Chinese name
  in installation_name_optional when both appear.
- Sync reporting period into period_start and period_end (and reporting_period_*
  aliases if needed).
- Return a single JSON object (no markdown fences).
"""

# Common label → key heuristics when widgets / LLM miss a field.
_LABEL_ALIASES: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"reporting\s*period\s*start|period\s*start|报告期.*起", re.I), "period_start"),
    (re.compile(r"reporting\s*period\s*end|period\s*end|报告期.*止", re.I), "period_end"),
    (re.compile(r"installation.*english|english\s*name|装置名称.*英文", re.I), "installation_name_en"),
    (re.compile(r"name of the installation \(optional\)|装置名称（可选）|installation name(?!.*english)", re.I), "installation_name_optional"),
    (re.compile(r"street[, ]*number|街道", re.I), "street_number"),
    (re.compile(r"economic\s*activity|经济活动", re.I), "economic_activity"),
    (re.compile(r"\bpost\s*code\b|邮编", re.I), "post_code"),
    (re.compile(r"p\.?\s*o\.?\s*box|邮政信箱", re.I), "po_box"),
    (re.compile(r"\bcity\b|城市", re.I), "city"),
    (re.compile(r"\bcountry\b|国家(?!.*认可)", re.I), "country"),
    (re.compile(r"unlocode", re.I), "unlocode"),
    (re.compile(r"latitude|纬度", re.I), "latitude"),
    (re.compile(r"longitude|经度", re.I), "longitude"),
    (re.compile(r"authorized\s*representative|授权代表", re.I), "authorized_rep_name"),
    (re.compile(r"\bcn\s*code\b|税则号", re.I), "cn_code"),
    (re.compile(r"product\s*name|产品名称", re.I), "product_name"),
    (re.compile(r"see\s*\(direct\)|特定隐含排放（直接）", re.I), "see_direct"),
    (re.compile(r"see\s*\(indirect\)|特定隐含排放（间接）", re.I), "see_indirect"),
    (re.compile(r"see\s*\(total\)|特定隐含排放（合计）", re.I), "see_total"),
]


def _pdf_to_markdown(content: bytes, *, filename: str) -> tuple[str, str]:
    _ = filename  # kept for call-site parity / future persist naming
    with tempfile.TemporaryDirectory(prefix="cbam_pdf_", ignore_cleanup_errors=True) as tmp:
        path = Path(tmp) / "upload.pdf"
        path.write_bytes(content)
        try:
            markdown, method = _layout_fallback(path)
            if markdown and markdown.strip():
                return markdown, method
        except Exception as exc:  # noqa: BLE001
            logger.warning("CBAM PDF layout extract failed (%s)", exc)
        try:
            import fitz

            doc = fitz.open(stream=content, filetype="pdf")
            parts: list[str] = []
            try:
                for i, page in enumerate(doc, start=1):
                    text = (page.get_text("text") or "").strip()
                    if text:
                        parts.append(f"## Page {i}\n\n{text}")
            finally:
                doc.close()
            if parts:
                return "\n\n".join(parts), "pymupdf_text"
        except Exception as exc:  # noqa: BLE001
            logger.warning("CBAM PyMuPDF text failed (%s)", exc)
    return "", "none"


def _extract_widget_values(content: bytes) -> dict[str, str]:
    """Read AcroForm / widget values when the PDF is fillable."""
    out: dict[str, str] = {}
    try:
        import fitz
    except ImportError:
        return out

    try:
        doc = fitz.open(stream=content, filetype="pdf")
    except Exception:  # noqa: BLE001
        return out

    try:
        for page in doc:
            for w in page.widgets() or []:
                name = (w.field_name or "").strip()
                val = w.field_value
                if val is None:
                    continue
                text = str(val).strip()
                if not name or not text:
                    continue
                # Map widget name loosely onto known keys
                key = _widget_name_to_key(name)
                if key:
                    out[key] = text
    finally:
        doc.close()
    return out


def _widget_name_to_key(name: str) -> str | None:
    n = name.strip().lower().replace(" ", "_").replace("-", "_")
    if n in CBAM_FIELD_KEYS:
        return n
    for key in CBAM_FIELD_KEYS:
        if key in n or n in key:
            return key
    for pat, key in _LABEL_ALIASES:
        if pat.search(name):
            return key
    return None


def _heuristic_label_values(markdown: str) -> dict[str, str]:
    """Pick ``Label: value`` / ``Label\\tvalue`` lines into known keys."""
    out: dict[str, str] = {}
    for raw in markdown.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        m = re.match(r"^(.+?)[:：\t]\s*(.+)$", line)
        if not m:
            continue
        label, value = m.group(1).strip(), m.group(2).strip()
        if not value or len(value) > 500:
            continue
        for pat, key in _LABEL_ALIASES:
            if pat.search(label) and key not in out:
                out[key] = value
                break
    return out


def _normalize_date(value: str) -> str:
    v = (value or "").strip()
    if not v:
        return ""
    # DD/MM/YYYY or DD-MM-YYYY
    m = re.match(r"^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$", v)
    if m:
        d, mo, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if mo <= 12 and d <= 31:
            return f"{y:04d}-{mo:02d}-{d:02d}"
    m = re.match(r"^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$", v)
    if m:
        y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
        return f"{y:04d}-{mo:02d}-{d:02d}"
    return v


def _normalize_fields(raw: dict[str, Any]) -> dict[str, str]:
    allow = set(CBAM_FIELD_KEYS)
    out: dict[str, str] = {}
    for k, v in raw.items():
        if k not in allow:
            continue
        if v is None:
            continue
        s = str(v).strip()
        if not s:
            continue
        if k in (
            "period_start",
            "period_end",
            "reporting_period_start",
            "reporting_period_end",
        ):
            s = _normalize_date(s)
        out[k] = s

    # Keep period aliases in sync
    if out.get("period_start") and not out.get("reporting_period_start"):
        out["reporting_period_start"] = out["period_start"]
    if out.get("period_end") and not out.get("reporting_period_end"):
        out["reporting_period_end"] = out["period_end"]
    if out.get("reporting_period_start") and not out.get("period_start"):
        out["period_start"] = out["reporting_period_start"]
    if out.get("reporting_period_end") and not out.get("period_end"):
        out["period_end"] = out["reporting_period_end"]
    return out


def parse_cbam_workbook_pdf(*, content: bytes, filename: str) -> dict[str, Any]:
    """PyMuPDF → map filled CBAM PDF into flat workbook string fields."""
    if not content:
        raise ValueError("empty_file")

    widgets = _extract_widget_values(content)
    markdown, method = _pdf_to_markdown(content, filename=filename)
    heuristics = _heuristic_label_values(markdown) if markdown.strip() else {}

    seed: dict[str, str] = {}
    seed.update(heuristics)
    seed.update(widgets)

    if not markdown.strip() and not seed:
        raise ValueError("no_extractable_text")

    schema_hint = {k: "" for k in CBAM_FIELD_KEYS}
    schema_hint.update(seed)
    clipped = (markdown or "")[:50_000]
    user = (
        "Allow-list keys and any seed values already extracted (overwrite with PDF "
        "when conflicting):\n"
        f"```json\n{json.dumps(schema_hint, ensure_ascii=False, indent=2)[:14_000]}\n```\n\n"
        f"PDF markdown ({method}):\n```markdown\n{clipped}\n```"
    )

    mock = {k: v for k, v in seed.items()}
    if not mock:
        mock = {
            "installation_name_en": "（mock）Extracted installation",
            "country": "CN",
            "period_start": "2025-01-01",
            "period_end": "2025-12-31",
        }

    extracted = call_structured(
        model=settings.model_writing,
        system_prompt=_SYSTEM,
        user_prompt=user,
        mock_response=mock,
        temperature=0.0,
        role="writing",
        timeout=480.0,
    )
    if isinstance(extracted, dict):
        extracted.pop("_mock", None)
    else:
        extracted = {}

    merged: dict[str, Any] = {}
    merged.update(seed)
    if isinstance(extracted, dict):
        merged.update(extracted)
    fields = _normalize_fields(merged)

    logger.info(
        "CBAM workbook PDF parse · method=%s · widgets=%s · fields=%s · chars=%s",
        method,
        len(widgets),
        len(fields),
        len(markdown),
    )
    return {
        "workbook_values": fields,
        "convert_method": method,
        "char_count": len(markdown),
        "field_count": len(fields),
        "source_file": Path(filename or "cbam.pdf").name,
    }
