-- IoT window snapshots for New Submission (financing evidence only — never CBAM).
-- Apply after 0001_init.sql on Supabase/Postgres.

create table if not exists iot_window_snapshots (
    id uuid primary key default gen_random_uuid(),
    company_id text not null,
    window_minutes integer not null check (window_minutes in (10, 30, 60)),
    green_trading text not null check (green_trading in ('yes', 'no')),
    emission_factor_t_per_mwh numeric(10, 6) not null,
    window_start timestamptz not null,
    window_end timestamptz not null,
    sample_count integer not null check (sample_count >= 0),
    kwh_start numeric(16, 8) not null,
    kwh_end numeric(16, 8) not null,
    delta_kwh numeric(16, 8) not null,
    avg_power_w numeric(14, 6),
    tco2e numeric(16, 10) not null,
    submission_id uuid,
    created_at timestamptz not null default now()
);

create index if not exists idx_iot_window_snapshots_company
    on iot_window_snapshots(company_id);
create index if not exists idx_iot_window_snapshots_submission
    on iot_window_snapshots(submission_id);

-- Relax numeric precision for live bulb prototypes (optional; safe if already applied)
alter table iot_readings
    alter column voltage type numeric(12, 6),
    alter column current type numeric(12, 6),
    alter column kwh type numeric(16, 8);
