# Frontend → backend wiring report

Audit date: 2026-07-15. Purpose: the entire frontend (`frontend/src`) currently
renders from hardcoded/mock data with zero live API calls. This report
catalogs every mock data point, maps it to what already exists in
`backend/app`, and flags what's missing or needs a decision before wiring.
Written for whoever picks up the backend integration work — read section 1
first, it's not optional.

**tl;dr:** the backend is much further along than the mock frontend
assumes — 10 routers, a real calculation engine, responsible provisional-data
flagging already in place. The gaps are mostly: no auth anywhere, one real
security hole (Baowu RLS role exists in SQL but the app never assumes it),
no backend concept at all for the "Copilot" chat UI, and a handful of data
shapes the frontend invented that don't have a backend counterpart yet.

---

## 1. Critical — resolve before wiring anything real

**1.1 Baowu data segregation is not actually enforced.**
`supabase/migrations/0001_init.sql` creates a `baowu_dashboard_role` with
RLS + column-level grants restricting it to `scores(cisa_grade,
cbam_risk_tier, created_at)` and `calculations(annual_exposure_eur,
calculated_at)` — this is the mechanism the PRD calls a "hard security
rule enforced at the DB role level" (PRD §10). But `backend/app/db.py` has
no concept of switching DB role per request: `GET /api/baowu/dashboard`
(`backend/app/routers/baowu.py`) runs under the exact same connection/role
as every other endpoint. **The segregation currently exists only on paper.**
Before this dashboard is wired to real data, the backend needs an actual
mechanism (a second connection pool authenticated as `baowu_dashboard_role`,
or equivalent) that the `/api/baowu/dashboard` route uses instead of the
default session. Don't treat the SQL migration as "done" — it's necessary
but not sufficient.

**1.2 There is no auth anywhere.** `frontend/src/routes/signin.tsx` is a
static form (`onSubmit` just does `window.location.href = "/"`, no request
sent). Backend has no `UserOut`/session schema, no JWT/cookie handling, no
`Depends(get_current_user)` pattern in any router. This blocks: per-user
submission lists, real role-gating on `/upstream`, and knowing who uploaded
what. Needs to be built from scratch (Supabase Auth is the natural choice
given the stack already chosen in PRD §4). Treat this as a prerequisite for
1.1's fix, not a parallel task — role-based DB access needs a real
authenticated identity to key off of.

**1.3 Don't regress the deterministic-only rule.** Per project convention:
deterministic code computes every regulated number (tCO2e, tariff, CISA
grade, subsidy amount); LLM agents only read and write prose around them.
The backend already respects this — keep it that way when replacing mocks.

**1.4 Two backend values are placeholders, and the backend already flags
them correctly — don't lose that when wiring the frontend:**
- DRI-EAF (1.47) / scrap-EAF (0.69) China intensity factors in
  `calculation_engine.py` are worldsteel *global* averages used as an
  interim floor, not real China-specific figures (only BF-BOF's 3.506 is a
  confirmed China source).
- CISA tier boundaries (E–A) in `data/cisa_tiers.py` are from CISA's
  2024-07-29 *public-comment draft*, not the finalized standard.
- Because of this, every `ScoreOut` the backend returns already carries
  `cisa_grade_is_provisional: true`. **The frontend currently never reads or
  displays this field anywhere.** When you wire real scores in, the UI must
  show a "provisional" indicator wherever a CISA grade renders (dashboard
  grade cards, upstream supplier table) — don't silently drop the flag.

**1.5 Beijing-region pinning.** `dashscope_base_url` in `config.py` already
defaults correctly. When flipping `llm_mock_mode` off for real deployment,
just confirm nothing overrides it to the international/Singapore endpoint.

---

## 2. Mock → backend mapping, file by file

### `frontend/src/lib/dashboard-data.ts`
All exports are hardcoded demo data (module docstring literally says so).

| Export | Maps to | Status |
|---|---|---|
| `company` | `POST /api/companies` (`CompanyOut`) | **Partial** — only a create endpoint exists, no `GET /api/companies/{id}` to fetch one back. |
| `routeGrades` (loan/grant/cbam, 3 separate grades) | `POST /api/score` → `ScoreOut` | **Gap, see §3.1** — `ScoreOut` only has one `cisa_grade` + `cbam_risk_tier`, no distinct loan-tier/grant-tier fields. |
| `ratioSliders` (scrap %, green-electricity %, metering %) | — | **Unclear** — no schema field found for these. Confirm with backend whether they're derived from intake data or need a new field. |
| `tierGauge` (distance to next tier) | `ScoreOut.gap_to_next_tier_tco2e` | **Ready** — real field exists, clean mapping. |
| `processMatrix` (5-stage energy/intensity/metering/audit heatmap) | — | **Likely decorative** — the calculation engine works off route-level intensity, not per-process-stage auditing. Confirm this is illustrative before building a schema for it. |
| `emissionsBreakdown` (direct/process/indirect/upstream % donut) | — | **Likely decorative**, same reasoning as above — `CalculationOut` has no source-split field. |
| `factoryFloor`, `factoryEquipment`, `factorySync` | `POST /api/iot/ingest` + `iot_readings` table | **Partial** — ingest exists, nothing to read it back. Needs a `GET /api/iot/readings?company_id=` (doesn't exist). **Guardrail:** per PRD, IoT data feeds only the financing report's electricity-intensity score — never the CBAM calculation. Don't let it leak into `/api/calculate`. |
| `submissions` (dashboard table) | — | **Gap** — no "list submissions for a company" endpoint exists, only `GET /api/submissions/{id}` (single). |
| `pipelineStages`, `routeStrip()` | `/api/intake` + `/api/submissions/{id}/process` | **Granularity mismatch, see §3.4.** |
| `docChecklists` | intake validator (`validator_status`/`validator_notes`) | **Unclear mapping** — no explicit "required documents" schema; likely needs to be derived from validator output rather than a static checklist. |
| `routePages` (scoreValue/scoreGrade/gauge per route) | same as `routeGrades` | Same gap as §3.1. |
| `advisoryCards`, `gaps` | `POST /api/advisory` → `AdvisoryOut.ranked_actions` | **Ready**, but shape differs (`RankedAction` has `path_name`/cost range/`closes_full_gap`, not `title`/`impact`/`why`/`status`) — frontend-side transform needed, not a backend gap. |
| `kpis` (intensity, cbam2026/2034, tariffs, cert price) | `CalculationOut` fields | **Mostly ready** — `intensity_tco2e_per_tonne`, `tariff_cost_eur_per_tonne`, `gross_tariff_cost_eur_per_tonne`, `annual_exposure_eur`, `certificate_price_eur_per_tco2e` all exist. `submissionsYtd`/`tonnesCovered` need the missing list-submissions endpoint plus aggregation. |
| `routerOutput` (Copilot's pre-scored route confidence) | — | **Missing entirely.** Not a regulated number (not tCO2e/tariff/grade/subsidy), so an LLM classifier producing this is fine per the deterministic-only rule — just doesn't exist as an endpoint yet. |

### `frontend/src/lib/upstream-data.ts`
| Export | Maps to | Status |
|---|---|---|
| `suppliers`, `portfolioSummary`, `gradeDistribution`, `watchlist` | `GET /api/baowu/dashboard` → `BaowuDashboardRow` | **Gap, see §3.5** — the real endpoint returns per-submission rows (needs `GROUP BY` for per-supplier aggregation) and `BaowuDashboardRow` has no company identifier at all (not even an ID), let alone a name. Also blocked by §1.1. |

### Inline hardcoded values (not in `lib/`)
- `Dashboard.tsx:206` "32 pts to unlock Tier B" — literal string, not derived from any score.
- `Dashboard.tsx:350` "of 47" — bare literal, ties to the missing submissions-count endpoint.
- `AppShell.tsx` — `qc-ops@hengfeng.cn`, `account-mgr@baowu-partners.cn` hardcoded emails; "API Connected" badge is a static string, not a real health check. Low priority — fix once auth exists.
- `routes/new.tsx:117-128` — fake MQTT sensor readout (topic, last reading, uptime). Same gap as `factoryFloor`/IoT GET endpoint above.
- `routes/entry.tsx:59-76` — **the entire "GreenGru Copilot" chat transcript is scripted JSX, not state.** No chat logic exists at all. See §3.3 — this is a product decision, not just a wiring task.
- `routes/signin.tsx:44-54,87,92,99` — fake stat tiles, fake submit handler, hardcoded credential defaults.
- `components/ExtractedInvoiceCard.tsx:34-75` — `EXTRACTED`/`CLASSIFICATION` module consts render identically regardless of the uploaded file.

### Simulated async behavior
- `PipelineTracker.tsx:17-56` — recursive `setTimeout` chain fakes 6 sequential pipeline stages. See §3.4.
- `FactoryScene.tsx`/`FactoryInteriors.tsx` — no simulation here beyond decorative particle/beacon animation; the actual V/I/P/carbon numbers shown on hover are static reads from `factoryFloor`/`factoryEquipment`, so this is really the same gap as the IoT data above, not a separate issue.

### Already backend-ready, just needs frontend wiring
- **`ExtractedInvoiceCard.tsx` → `POST /api/intake`.** Backend already handles multipart file upload + vision/CSV extraction + validation (`IntakeRecordOut`). This is a clean win — no backend work needed, just replace the hardcoded consts with the real response.
- **Document download → `POST /api/documents/passport`, `POST /api/documents/financing`, `GET /api/documents/{id}/download`.** Fully built.
- **Advisory cards → `POST /api/advisory`.** Fully built, needs a shape transform on the frontend only.

---

## 3. Structural decisions needed (not pure wiring)

**3.1 Loan/grant/CBAM — one score or three?** The frontend was designed
assuming three independently-graded routes (loan, grant, CBAM passport),
each with its own grade letter and gauge value. The backend's `ScoreOut`
schema only exposes one `cisa_grade` + `cbam_risk_tier`. Per PRD, the CBAM
passport and financing report are separate parallel agents off the same
threshold-scoring output — but that doesn't obviously mean three separately
graded routes. **Needs a decision**: either extend `ScoreOut` with distinct
loan-tier/grant-tier fields, or redesign the frontend's three-grade-card
layout to match what actually gets scored.

**3.2 `processMatrix` / `emissionsBreakdown`.** Both look like they were
designed as illustrative dashboard filler rather than backed by real
per-stage data (the calculation engine works at route level, not
per-process-stage). Confirm this before spending backend effort building
schemas for them — they may be intentionally decorative.

**3.3 The Copilot chat (`entry.tsx`) has no backend concept at all.** Every
other "agent" in this system (intake, classify, advisory, passport,
financing) is a single-shot document-in/structured-output-out call, not a
conversational endpoint. Wiring `entry.tsx` for real means either (a)
building an actual conversational backend (new scope, not in the current
router set) or (b) redesigning the entry flow as a structured wizard over
the existing single-shot endpoints. This is a product call as much as a
backend one — flag it rather than silently building either direction.

**3.4 Pipeline stage granularity mismatch.** `PipelineTracker` fakes 6
discrete stages (Intake → Validate → Classify → Calculate → Update
dashboard → Authorize) with individual timers. The real backend exposes
this as two async calls: `POST /api/intake` (covers stages 1-2), then
`POST /api/submissions/{id}/process` (runs classify → calculate → score →
passport doc → financing doc → advisory as one synchronous call — stages
3-5 collapse into a single request/response with no intermediate
progress signal). Decide: simplify the UI to reflect real request
boundaries (e.g. two-phase "uploading" / "processing" instead of 6 fake
steps), or add server-sent events / streaming progress to `/process` if the
granular UI is a hard requirement.

**3.5 Baowu dashboard aggregation + identity.** `GET /api/baowu/dashboard`
returns per-submission rows, not per-supplier aggregates — needs a
`GROUP BY` company query. `BaowuDashboardRow` has no company identifier at
all. Per an earlier decision on this project, the account-manager view
should show real company names — that requires extending the
`baowu_dashboard_role` grant (currently limited to `scores`/`calculations`
columns only) to include a company display-name column, which is a
deliberate, reviewed change to a locked-down security grant, not a
default-on addition. Do this only after §1.1 is actually fixed — extending
a grant that nothing enforces yet doesn't help.

---

## 4. Frontend-side prerequisites (small, needed regardless of backend work)

- **No API client exists at all.** Grep across `frontend/src` for
  `fetch(|axios|useQuery|useMutation|API_URL|API_BASE` turns up nothing
  except the SSR request handler and an idle `QueryClientProvider`. Needs a
  base fetch wrapper + env var for the API origin (matching backend's
  `frontend_origin` CORS setting).
- **Good news:** TanStack Query is already installed and wired into the
  router (`QueryClientProvider` in `__root.tsx`) — zero `useQuery`/
  `useMutation` calls exist anywhere yet, but the infra is there. No new
  frontend dependency needed, just write the hooks.

---

## 5. Suggested sequencing

1. Fix §1.1 (Baowu role enforcement) and §1.2 (real auth) — foundational,
   everything else depends on one or both.
2. Wire the already-ready wins (§2 "Already backend-ready" list) — proves
   the API client works end-to-end with zero backend changes needed.
3. Resolve the structural decisions in §3 (especially §3.1 loan/grant/CBAM
   scoring shape) before building UI against them, to avoid wiring twice.
4. Add the missing list/GET endpoints (submissions list, IoT readings,
   company fetch, Baowu per-supplier aggregation).
5. Decide and build the Copilot chat direction (§3.3) — largest scope item,
   sequence last.
