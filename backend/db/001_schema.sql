-- Carbon Passport — core schema (PRD §6.3)
-- Run against Supabase Postgres. Idempotent-ish: guarded with IF NOT EXISTS
-- where Postgres allows it.

create extension if not exists "pgcrypto";

-- Enum-ish check constraints instead of Postgres enums: cheaper to evolve
-- during a 4-week build, and every allowed value is visible in this file.

create table if not exists companies (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  province      text,
  contact_info  jsonb,
  created_at    timestamptz not null default now()
);

create table if not exists products (
  id                    uuid primary key default gen_random_uuid(),
  company_id            uuid not null references companies(id),
  -- Exactly the 8 supported CN codes (PRD §6.1). 7213/7214 stored as the
  -- specific code; the check keeps scope locked at the DB layer too.
  cn_code               text not null check (cn_code in
                          ('7207', '72081000', '7213', '7214',
                           '7301', '7302', '73181542', '73181588', '7326')),
  production_route      text not null check (production_route in
                          ('BF-BOF', 'DRI-EAF', 'scrap-EAF')),
  annual_export_tonnes  numeric not null check (annual_export_tonnes >= 0)
);

create table if not exists submissions (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references products(id),
  source_type    text not null check (source_type in ('doc', 'iot')),
  raw_input_ref  text,                    -- Supabase Storage path
  submitted_at   timestamptz not null default now()
);

create table if not exists intake_records (
  id                uuid primary key default gen_random_uuid(),
  submission_id     uuid not null references submissions(id),
  extracted_json    jsonb not null,
  validator_status  text not null check (validator_status in
                      ('pending', 'passed', 'manual_review', 'rejected')),
  validator_notes   text
);

create table if not exists calculations (
  id                          uuid primary key default gen_random_uuid(),
  submission_id               uuid not null references submissions(id),
  intensity_tco2e_per_tonne   numeric not null,
  data_source                 text not null check (data_source in ('measured', 'china_default')),
  benchmark_tco2e_per_tonne   numeric not null,
  taxable_emissions           numeric not null,
  tariff_cost_eur_per_tonne   numeric not null,
  annual_exposure_eur         numeric not null,
  calculated_at               timestamptz not null default now()
);

create table if not exists scores (
  id                      uuid primary key default gen_random_uuid(),
  calculation_id          uuid not null references calculations(id),
  cisa_grade              text check (cisa_grade in ('E', 'D', 'C', 'B', 'A')),
  cbam_risk_tier          text not null check (cbam_risk_tier in
                            ('exempt', 'exposed', 'high_exposure')),
  gap_to_next_tier_tco2e  numeric,
  de_minimis_exempt       boolean not null default false
);

create table if not exists subsidy_matches (
  id               uuid primary key default gen_random_uuid(),
  score_id         uuid not null references scores(id),
  program_name     text not null,
  amount_estimate  text not null,   -- ranges like "¥500,000–¥1,000,000" are real values here
  source_citation  text not null    -- hard requirement: no citation, no row (PRD §8.8)
);

create table if not exists documents (
  id                uuid primary key default gen_random_uuid(),
  submission_id     uuid not null references submissions(id),
  doc_type          text not null check (doc_type in ('passport', 'financing_report')),
  language          text not null check (language in ('en-cn', 'cn')),
  content_hash      text not null,   -- SHA-256 of final rendered content (PRD §9.3)
  signature         text not null,   -- backend-key signature over content_hash
  generated_at      timestamptz not null default now(),
  pdf_storage_path  text not null
);

create table if not exists advisory_plans (
  id                    uuid primary key default gen_random_uuid(),
  score_id              uuid not null references scores(id),
  ranked_actions_json   jsonb not null,
  generated_at          timestamptz not null default now()
);

-- Optional IoT module — decoupled; feeds only the financing report's
-- electricity-intensity score, never the CBAM passport (PRD §12).
create table if not exists iot_readings (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references companies(id),
  ts           timestamptz not null,
  voltage      numeric,
  current      numeric,
  kwh          numeric not null,
  ingested_at  timestamptz not null default now()
);

create index if not exists idx_products_company on products(company_id);
create index if not exists idx_submissions_product on submissions(product_id);
create index if not exists idx_calculations_submission on calculations(submission_id);
create index if not exists idx_iot_company_ts on iot_readings(company_id, ts);
