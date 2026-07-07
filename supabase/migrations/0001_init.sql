-- Carbon Passport for Steel SMEs — initial schema
-- Mirrors PRD.md §6.3 exactly. Run against a Supabase (managed Postgres)
-- project, or any Postgres 14+ instance, via the Supabase CLI:
--   supabase db push
-- or plain psql:
--   psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
--
-- This file is the source of truth for the schema. The backend's SQLAlchemy
-- models (backend/app/models_orm.py) are hand-kept in sync with this file —
-- if you change one, change the other in the same commit.

create extension if not exists "pgcrypto";

create table if not exists companies (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    province text,
    contact_info jsonb,
    created_at timestamptz not null default now()
);

create table if not exists products (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    cn_code text not null check (
        cn_code in ('7207', '7208 10 00', '7213', '7214', '7301', '7302', '7318 15 42', '7318 15 88', '7326')
    ),
    production_route text not null check (production_route in ('BF-BOF', 'DRI-EAF', 'scrap-EAF')),
    annual_export_tonnes numeric(14, 3) not null check (annual_export_tonnes >= 0),
    created_at timestamptz not null default now()
);

create table if not exists submissions (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references products(id) on delete cascade,
    source_type text not null check (source_type in ('doc', 'iot', 'manual')),
    raw_input_ref text,
    status text not null default 'intake_pending' check (
        status in (
            'intake_pending', 'intake_done', 'classified', 'calculated',
            'scored', 'documents_generated', 'advisory_generated',
            'manual_review', 'failed'
        )
    ),
    submitted_at timestamptz not null default now()
);

create table if not exists intake_records (
    id uuid primary key default gen_random_uuid(),
    submission_id uuid not null references submissions(id) on delete cascade,
    extracted_json jsonb not null,
    validator_status text not null default 'pending' check (
        validator_status in ('pending', 'passed', 'flagged', 'rejected')
    ),
    validator_notes text[],
    created_at timestamptz not null default now()
);

create table if not exists calculations (
    id uuid primary key default gen_random_uuid(),
    submission_id uuid not null references submissions(id) on delete cascade,
    intensity_tco2e_per_tonne numeric(10, 4) not null,
    data_source text not null check (data_source in ('measured', 'china_default')),
    benchmark_tco2e_per_tonne numeric(10, 4) not null,
    taxable_emissions_tco2e_per_tonne numeric(10, 4) not null,
    certificate_price_eur_per_tco2e numeric(10, 4) not null,
    certificate_price_quarter text not null,
    markup_applied numeric(5, 4) not null default 0,
    phase_in_factor numeric(5, 4) not null,
    tariff_cost_eur_per_tonne numeric(12, 4) not null,
    gross_tariff_cost_eur_per_tonne numeric(12, 4) not null,
    annual_exposure_eur numeric(16, 2) not null,
    calculated_at timestamptz not null default now()
);

create table if not exists scores (
    id uuid primary key default gen_random_uuid(),
    calculation_id uuid not null references calculations(id) on delete cascade,
    cisa_grade text not null check (cisa_grade in ('E', 'D', 'C', 'B', 'A')),
    cisa_grade_is_provisional boolean not null default true,
    cbam_risk_tier text not null check (cbam_risk_tier in ('exempt', 'exposed', 'high_exposure')),
    gap_to_next_tier_tco2e numeric(10, 4),
    -- "possible", not "exempt" — the CBAM de minimis exemption is assessed
    -- per EU importer per year, not per exporter. See PRD §8.5.
    de_minimis_possible boolean not null default false,
    created_at timestamptz not null default now()
);

create table if not exists subsidy_matches (
    id uuid primary key default gen_random_uuid(),
    score_id uuid not null references scores(id) on delete cascade,
    program_name text not null,
    program_name_en text,
    amount_estimate_cny numeric(14, 2),
    is_green_specific boolean not null default true,
    source_citation text not null,
    created_at timestamptz not null default now()
);

create table if not exists documents (
    id uuid primary key default gen_random_uuid(),
    submission_id uuid not null references submissions(id) on delete cascade,
    doc_type text not null check (doc_type in ('passport', 'financing_report')),
    language text not null check (language in ('en_cn', 'cn')),
    content_hash text not null,
    signature text not null,
    generated_at timestamptz not null default now(),
    pdf_storage_path text not null
);

create table if not exists advisory_plans (
    id uuid primary key default gen_random_uuid(),
    score_id uuid not null references scores(id) on delete cascade,
    ranked_actions_json jsonb not null,
    generated_at timestamptz not null default now()
);

-- Optional module — decoupled, never on the critical path (PRD §12).
create table if not exists iot_readings (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    reading_timestamp timestamptz not null,
    voltage numeric(8, 3),
    current numeric(8, 3),
    kwh numeric(12, 4) not null check (kwh >= 0),
    ingested_at timestamptz not null default now(),
    unique (company_id, reading_timestamp)
);

create index if not exists idx_products_company on products(company_id);
create index if not exists idx_submissions_product on submissions(product_id);
create index if not exists idx_intake_records_submission on intake_records(submission_id);
create index if not exists idx_calculations_submission on calculations(submission_id);
create index if not exists idx_scores_calculation on scores(calculation_id);
create index if not exists idx_subsidy_matches_score on subsidy_matches(score_id);
create index if not exists idx_documents_submission on documents(submission_id);
create index if not exists idx_advisory_plans_score on advisory_plans(score_id);
create index if not exists idx_iot_readings_company on iot_readings(company_id);

-- ---------------------------------------------------------------------------
-- Data segregation for the Baowu/Ansteel aggregate dashboard (PRD §10,
-- stretch feature). This role may only ever read cisa_grade and
-- annual_exposure_eur (aggregated) — never intake_records.extracted_json or
-- any raw uploaded file. Enforced here at the database role level, not just
-- in application code, per the non-negotiable rule in PRD §10.
-- ---------------------------------------------------------------------------
do $$
begin
    if not exists (select 1 from pg_roles where rolname = 'baowu_dashboard_role') then
        create role baowu_dashboard_role nologin;
    end if;
end
$$;

revoke all on intake_records from baowu_dashboard_role;
revoke all on documents from baowu_dashboard_role;

grant select (cisa_grade, cbam_risk_tier, created_at) on scores to baowu_dashboard_role;
grant select (annual_exposure_eur, calculated_at) on calculations to baowu_dashboard_role;

alter table scores enable row level security;
alter table calculations enable row level security;

create policy baowu_dashboard_scores_read on scores
    for select
    to baowu_dashboard_role
    using (true);

create policy baowu_dashboard_calculations_read on calculations
    for select
    to baowu_dashboard_role
    using (true);
