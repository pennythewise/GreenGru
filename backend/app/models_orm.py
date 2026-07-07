"""SQLAlchemy ORM models — must stay in sync with
supabase/migrations/0001_init.sql (that SQL file is the schema's source of
truth; if you change one, change the other in the same commit).

UUIDs are stored as plain strings (uuid4 hex with dashes) rather than a
Postgres-native UUID column type, so the identical model definitions work
unchanged against both the SQLite dev database and a real Supabase/Postgres
database — see config.py's note on why that trade-off is acceptable here.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(255))
    province: Mapped[str | None] = mapped_column(String(100), nullable=True)
    contact_info: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=_now)

    products: Mapped[list["Product"]] = relationship(back_populates="company")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"))
    cn_code: Mapped[str] = mapped_column(String(20))
    production_route: Mapped[str] = mapped_column(String(20))
    annual_export_tonnes: Mapped[float]
    created_at: Mapped[datetime] = mapped_column(default=_now)

    company: Mapped["Company"] = relationship(back_populates="products")
    submissions: Mapped[list["Submission"]] = relationship(back_populates="product")


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"))
    source_type: Mapped[str] = mapped_column(String(20))
    raw_input_ref: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="intake_pending")
    submitted_at: Mapped[datetime] = mapped_column(default=_now)

    product: Mapped["Product"] = relationship(back_populates="submissions")
    intake_records: Mapped[list["IntakeRecord"]] = relationship(back_populates="submission")
    calculations: Mapped[list["Calculation"]] = relationship(back_populates="submission")
    documents: Mapped[list["Document"]] = relationship(back_populates="submission")


class IntakeRecord(Base):
    __tablename__ = "intake_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    submission_id: Mapped[str] = mapped_column(ForeignKey("submissions.id"))
    extracted_json: Mapped[dict] = mapped_column(JSON)
    validator_status: Mapped[str] = mapped_column(String(20), default="pending")
    validator_notes: Mapped[list | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=_now)

    submission: Mapped["Submission"] = relationship(back_populates="intake_records")


class Calculation(Base):
    __tablename__ = "calculations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    submission_id: Mapped[str] = mapped_column(ForeignKey("submissions.id"))
    intensity_tco2e_per_tonne: Mapped[float]
    data_source: Mapped[str] = mapped_column(String(20))
    benchmark_tco2e_per_tonne: Mapped[float]
    taxable_emissions_tco2e_per_tonne: Mapped[float]
    certificate_price_eur_per_tco2e: Mapped[float]
    certificate_price_quarter: Mapped[str] = mapped_column(String(20))
    markup_applied: Mapped[float]
    phase_in_factor: Mapped[float]
    tariff_cost_eur_per_tonne: Mapped[float]
    gross_tariff_cost_eur_per_tonne: Mapped[float]
    annual_exposure_eur: Mapped[float]
    calculated_at: Mapped[datetime] = mapped_column(default=_now)

    submission: Mapped["Submission"] = relationship(back_populates="calculations")
    scores: Mapped[list["Score"]] = relationship(back_populates="calculation")


class Score(Base):
    __tablename__ = "scores"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    calculation_id: Mapped[str] = mapped_column(ForeignKey("calculations.id"))
    cisa_grade: Mapped[str] = mapped_column(String(2))
    cisa_grade_is_provisional: Mapped[bool] = mapped_column(default=True)
    cbam_risk_tier: Mapped[str] = mapped_column(String(20))
    gap_to_next_tier_tco2e: Mapped[float | None] = mapped_column(nullable=True)
    de_minimis_possible: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=_now)

    calculation: Mapped["Calculation"] = relationship(back_populates="scores")
    subsidy_matches: Mapped[list["SubsidyMatch"]] = relationship(back_populates="score")
    advisory_plans: Mapped[list["AdvisoryPlan"]] = relationship(back_populates="score")


class SubsidyMatch(Base):
    __tablename__ = "subsidy_matches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    score_id: Mapped[str] = mapped_column(ForeignKey("scores.id"))
    program_name: Mapped[str] = mapped_column(String(255))
    program_name_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    amount_estimate_cny: Mapped[float | None] = mapped_column(nullable=True)
    is_green_specific: Mapped[bool] = mapped_column(default=True)
    source_citation: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=_now)

    score: Mapped["Score"] = relationship(back_populates="subsidy_matches")


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    submission_id: Mapped[str] = mapped_column(ForeignKey("submissions.id"))
    doc_type: Mapped[str] = mapped_column(String(30))
    language: Mapped[str] = mapped_column(String(10))
    content_hash: Mapped[str] = mapped_column(String(64))
    signature: Mapped[str] = mapped_column(Text)
    generated_at: Mapped[datetime] = mapped_column(default=_now)
    pdf_storage_path: Mapped[str] = mapped_column(Text)

    submission: Mapped["Submission"] = relationship(back_populates="documents")


class AdvisoryPlan(Base):
    __tablename__ = "advisory_plans"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    score_id: Mapped[str] = mapped_column(ForeignKey("scores.id"))
    ranked_actions_json: Mapped[dict] = mapped_column(JSON)
    generated_at: Mapped[datetime] = mapped_column(default=_now)

    score: Mapped["Score"] = relationship(back_populates="advisory_plans")


class IotReading(Base):
    """Optional module — decoupled, never on the critical path (PRD §12)."""

    __tablename__ = "iot_readings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"))
    reading_timestamp: Mapped[datetime]
    voltage: Mapped[float | None] = mapped_column(nullable=True)
    current: Mapped[float | None] = mapped_column(nullable=True)
    kwh: Mapped[float]
    ingested_at: Mapped[datetime] = mapped_column(default=_now)
