"""PDF generation (PRD §9) — Jinja2 templating + WeasyPrint rendering, with
SHA-256 hash + HMAC signature for document integrity (PRD §9.3 — explicitly
no blockchain, hash+signature is sufficient tamper-evidence).

WeasyPrint on Windows requires native GTK/Pango/cairo libraries that are not
guaranteed present in every dev environment. Rather than hard-crash the
whole pipeline when those aren't installed, this module degrades to writing
the rendered HTML directly (clearly labeled, never silently) so the rest of
the pipeline (hash/signature/DB row/API response) can still be exercised
end-to-end in a constrained dev environment. Real PDF output requires
WeasyPrint's native dependencies — see README for platform-specific setup.
"""

import hashlib
import hmac
import os
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

from app.config import get_settings

settings = get_settings()

_TEMPLATE_DIR = Path(__file__).parent.parent / "templates"
_FONT_PATH = Path(__file__).parent.parent / "static" / "fonts" / "NotoSansSC-Regular.ttf"
_env = Environment(loader=FileSystemLoader(str(_TEMPLATE_DIR)))

DISCLAIMER_EN = (
    "Generated using published default values and public regulatory benchmarks. "
    "Not a substitute for a licensed customs broker, tax advisor, or financial advisor."
)
DISCLAIMER_CN = "本报告基于已公开的默认值和公共监管基准生成，不能替代持牌海关经纪人、税务顾问或财务顾问的专业意见。"


@dataclass
class GeneratedDocument:
    content_hash: str
    signature: str
    storage_path: str
    used_pdf_fallback_html: bool


def _sign(content_hash: str) -> str:
    return hmac.new(
        settings.document_signing_secret.encode("utf-8"),
        content_hash.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def render_and_store_document(
    *,
    submission_id: str,
    doc_type: str,  # "passport" | "financing_report"
    title: str,
    lang: str,
    meta_rows: list[tuple[str, str]],
    body_heading: str,
    body_text: str,
    disclaimer: str,
) -> GeneratedDocument:
    generated_at = datetime.now(timezone.utc).isoformat()

    # Hash the actual content that matters for tamper-evidence — the body
    # text and the meta rows, not template markup around them (so a CSS
    # tweak doesn't invalidate every previously-issued document's hash).
    hashable_content = "\n".join([title, body_text, disclaimer] + [f"{k}:{v}" for k, v in meta_rows])
    content_hash = hashlib.sha256(hashable_content.encode("utf-8")).hexdigest()
    signature = _sign(content_hash)

    template = _env.get_template("document_base.html")
    font_path_uri = _FONT_PATH.as_uri() if _FONT_PATH.exists() else ""
    html_content = template.render(
        title=title,
        lang=lang,
        meta_rows=meta_rows,
        body_heading=body_heading,
        body_text=body_text,
        disclaimer=disclaimer,
        content_hash=content_hash,
        signature=signature,
        generated_at=generated_at,
        font_path=font_path_uri,
    )

    storage_dir = Path(settings.local_storage_dir) / "documents"
    storage_dir.mkdir(parents=True, exist_ok=True)
    base_name = f"{submission_id}_{doc_type}"

    used_fallback = False
    pdf_path = storage_dir / f"{base_name}.pdf"
    try:
        from weasyprint import HTML  # imported lazily — heavy native dependency

        HTML(string=html_content, base_url=str(_TEMPLATE_DIR)).write_pdf(str(pdf_path))
        storage_path = str(pdf_path)
    except Exception as exc:  # noqa: BLE001 — deliberately broad: any native-lib
        # failure here (missing GTK/Pango/cairo on Windows dev boxes is the
        # common case) should degrade, not crash the whole submission.
        used_fallback = True
        html_path = storage_dir / f"{base_name}.fallback.html"
        html_path.write_text(
            f"<!-- WeasyPrint PDF rendering failed: {exc!r}. "
            f"Falling back to raw HTML — see README for native dependency setup. -->\n" + html_content,
            encoding="utf-8",
        )
        storage_path = str(html_path)

    return GeneratedDocument(
        content_hash=content_hash,
        signature=signature,
        storage_path=storage_path,
        used_pdf_fallback_html=used_fallback,
    )


def render_route_preview_pdf(*, payload: dict, route: str) -> GeneratedDocument:
    """Themed route preview PDF for Section A/B/C — Jinja2 + WeasyPrint."""
    generated_at = datetime.now(timezone.utc).isoformat()
    checklist = payload.get("checklist", [])
    checklist_done = sum(1 for i in checklist if i.get("done"))
    checklist_total = len(checklist)

    hashable = "\n".join(
        [
            payload.get("title", ""),
            payload.get("company_name", ""),
            str(checklist_done),
            str(checklist_total),
        ]
        + [f"{s.get('n')}:{s.get('status')}" for s in payload.get("pipeline_stages", [])]
    )
    content_hash = hashlib.sha256(hashable.encode("utf-8")).hexdigest()
    signature = _sign(content_hash)

    template = _env.get_template("route_preview.html")
    font_path_uri = _FONT_PATH.as_uri() if _FONT_PATH.exists() else ""
    lang = payload.get("lang", "en")
    disclaimer = DISCLAIMER_EN if lang == "en" else f"{DISCLAIMER_EN}\n\n{DISCLAIMER_CN}"

    html_content = template.render(
        lang=lang,
        title=payload.get("title", "Route Preview"),
        title_zh=payload.get("title_zh"),
        subtitle=payload.get("subtitle", ""),
        subtitle_zh=payload.get("subtitle_zh"),
        status_label=payload.get("status_label", "Submit-ready"),
        company_name=payload.get("company_name", ""),
        company_id=payload.get("company_id", ""),
        production_route=payload.get("production_route", ""),
        kb=payload.get("kb", ""),
        score_label=payload.get("score_label", ""),
        score_value=payload.get("score_value", ""),
        score_grade=payload.get("score_grade", ""),
        gauge=payload.get("gauge", 0),
        checklist=checklist,
        checklist_done=checklist_done,
        checklist_total=checklist_total,
        pipeline_stages=payload.get("pipeline_stages", []),
        gaps=payload.get("gaps", []),
        advisory=payload.get("advisory", []),
        kpis=payload.get("kpis", []),
        citations=payload.get("citations", ""),
        disclaimer=disclaimer,
        content_hash=content_hash,
        signature=signature,
        generated_at=generated_at,
        font_path=font_path_uri,
    )

    storage_dir = Path(settings.local_storage_dir) / "documents"
    storage_dir.mkdir(parents=True, exist_ok=True)
    base_name = f"route_preview_{route}_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"

    used_fallback = False
    pdf_path = storage_dir / f"{base_name}.pdf"
    try:
        from weasyprint import HTML

        HTML(string=html_content, base_url=str(_TEMPLATE_DIR)).write_pdf(str(pdf_path))
        storage_path = str(pdf_path)
        filename = f"GreenGru-{route}-preview.pdf"
    except Exception as exc:  # noqa: BLE001
        used_fallback = True
        html_path = storage_dir / f"{base_name}.fallback.html"
        html_path.write_text(
            f"<!-- WeasyPrint PDF rendering failed: {exc!r} -->\n" + html_content,
            encoding="utf-8",
        )
        storage_path = str(html_path)
        filename = f"GreenGru-{route}-preview.html"

    return GeneratedDocument(
        content_hash=content_hash,
        signature=signature,
        storage_path=storage_path,
        used_pdf_fallback_html=used_fallback,
    )


def render_filled_application_form_pdf(
    *,
    route: str,
    application_form: dict,
    score_summary: str | None = None,
) -> GeneratedDocument:
    """Fill Grant / Loan official-style application form PDF from edited form data.

    Templates mirror GreenGru_Green_Factory_Grant_Application_Form.pdf and
    GreenGru_Green_Loan_Intake_Form.pdf structure and field layout.
    """
    if route not in ("grant", "loan"):
        raise ValueError(f"Filled application form PDF only supports grant|loan, got {route!r}")

    generated_at = datetime.now(timezone.utc).isoformat()
    import json

    hashable = json.dumps(application_form, sort_keys=True, ensure_ascii=False, default=str)
    content_hash = hashlib.sha256(hashable.encode("utf-8")).hexdigest()
    signature = _sign(content_hash)

    template_name = "grant_application_form.html" if route == "grant" else "loan_intake_form.html"
    template = _env.get_template(template_name)
    font_path_uri = _FONT_PATH.as_uri() if _FONT_PATH.exists() else ""

    html_content = template.render(
        form=application_form,
        score_summary=score_summary or "",
        content_hash=content_hash,
        signature=signature,
        generated_at=generated_at,
        font_path=font_path_uri,
    )

    storage_dir = Path(settings.local_storage_dir) / "documents"
    storage_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    base_name = f"application_form_{route}_{stamp}"

    used_fallback = False
    pdf_path = storage_dir / f"{base_name}.pdf"
    try:
        from weasyprint import HTML

        HTML(string=html_content, base_url=str(_TEMPLATE_DIR)).write_pdf(str(pdf_path))
        storage_path = str(pdf_path)
    except Exception as exc:  # noqa: BLE001
        used_fallback = True
        html_path = storage_dir / f"{base_name}.fallback.html"
        html_path.write_text(
            f"<!-- WeasyPrint PDF rendering failed: {exc!r} -->\n" + html_content,
            encoding="utf-8",
        )
        storage_path = str(html_path)

    return GeneratedDocument(
        content_hash=content_hash,
        signature=signature,
        storage_path=storage_path,
        used_pdf_fallback_html=used_fallback,
    )
