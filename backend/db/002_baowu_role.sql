-- Baowu/Ansteel aggregate-dashboard data segregation (PRD §10).
--
-- Hard requirement: the anchor-enterprise dashboard may only ever see
-- CISA tier + aggregated exposure. It must NEVER be able to read
-- intake_records.extracted_json or any raw uploaded file reference.
-- Enforced here at the database role level, not in application code —
-- an app-layer bug must not be able to leak a supplier's invoices to
-- their anchor customer, because that breaks SME trust in the entire
-- distribution model.

create role baowu_dashboard nologin;

-- Default deny: no table access at all…
revoke all on all tables in schema public from baowu_dashboard;

-- …except a single aggregate view.
create or replace view baowu_aggregate as
select
  c.id            as company_id,
  c.name          as company_name,
  c.province,
  s.cisa_grade,
  s.cbam_risk_tier,
  sum(cal.annual_exposure_eur) as total_annual_exposure_eur,
  count(distinct sub.id)       as submission_count
from companies c
join products p        on p.company_id = c.id
join submissions sub   on sub.product_id = p.id
join calculations cal  on cal.submission_id = sub.id
join scores s          on s.calculation_id = cal.id
group by c.id, c.name, c.province, s.cisa_grade, s.cbam_risk_tier;

-- security_invoker=false (default): the view runs with owner privileges,
-- so the role needs SELECT on the view only — not on any underlying table.
grant select on baowu_aggregate to baowu_dashboard;
