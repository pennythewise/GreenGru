# Steel SME Carbon Passport

CBAM export passport and green financing readiness report for Chinese
steel-downstream SMEs (bolt/fastener/structural-steel manufacturers),
distributed through Baowu/Ansteel as an anchor-enterprise service.

**Before touching any code, prompt, schema, or document template, read
`.claude/skills/carbon-passport-project/SKILL.md`** and
`.claude/skills/carbon-passport-project/references/PRD.md` — they hold the
non-negotiable build rules, locked scope, and the full product requirements.

## What's implemented

A complete, runnable, end-to-end system:

- **Backend** (`backend/`) — FastAPI, the full six-stage pipeline (intake →
  classify → calculate → score → documents → advisory), a deterministic
  CBAM calculation engine, threshold scoring, bilingual PDF generation
  (WeasyPrint), and a mock LLM mode so the whole thing runs with **zero
  external configuration**.
- **Frontend** (`frontend/`) — Vite + React + TypeScript + Tailwind +
  TanStack, with the new dashboard experience and UI components.
- **Database** (`supabase/migrations/0001_init.sql`) — the full schema from
  PRD §6.3, including row-level security for the Baowu/Ansteel aggregate
  dashboard. The backend runs against a zero-config local SQLite file by
  default and the identical models work unchanged against a real Supabase
  (Postgres) database — see `backend/app/config.py`.
- **40 backend tests** covering the calculation engine (including the
  CBAM phase-in factor fix — see below), threshold scoring, the classifier
  escalation path, the edge-case register (PRD §8.11), and a full API
  end-to-end pipeline run.

## A significant fix made during this build: the CBAM phase-in factor

While researching EU CBAM regulations for this build, we found that the
original calculation engine was **missing the CBAM certificate phase-in
factor** (Regulation (EU) 2023/956 Art. 31(3) — only 2.5% of taxable
emissions require a certificate in 2026, rising to 100% by 2034, mirroring
the EU ETS free-allocation phase-out). Without it, every 2026-2033 tariff
number was overstated by roughly 10-40x. This is now fixed in
`calculation_engine.py` (both the skill reference copy and the backend
port), which reports both:

- `tariff_cost_eur_per_tonne` — the correct **net**, current-year figure
- `gross_tariff_cost_eur_per_tonne` — the fully-phased-in **2034
  steady-state** figure (what the original, pre-fix worked example was
  actually showing)

Every document and API response shows both, clearly labeled, so a small
2026 number is never mistaken for the long-run exposure. See
`primary-sources/INVENTORY.md` item 3 and the PRD's §6.2a for the full
citation trail and verification status.

Also folded in from research: China's 2021 steel export VAT rebate
cancellation (relevant context for CN 7302), and two real, current (2026)
Chinese green-financing programs — the PBOC Carbon Emission Reduction
Facility's January 2026 expansion, and the 2026 SME loan interest subsidy
policy — both wired into the financing report's program matcher with
citations.

## Quick start

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
copy .env.example .env          # Windows: copy; macOS/Linux: cp
uvicorn app.main:app --reload --port 8000
```

Runs immediately with **zero configuration**: a local SQLite database is
created automatically, and every LLM agent call returns a deterministic
mock response (clearly labeled `_mock`/`[MOCK ...]` in the output) so the
full pipeline — including real PDF generation — works out of the box.

To use real Qwen models, set `DASHSCOPE_API_KEY` in `.env` and
`LLM_MOCK_MODE=false`. **Verify the base URL is the Beijing region**
(`https://dashscope.aliyuncs.com/compatible-mode/v1` by default in
`.env.example`) — this is load-bearing for data sovereignty (PRD §10), not
a default to leave unset. Never point it at `dashscope-intl.aliyuncs.com`.

**Invoice photo OCR (PaddleOCR):** Stage-1 image intake runs **PaddleOCR
in-process** (`lang=ch` → simplified Chinese + English). Set
`OCR_MOCK_ONLY=false` and `PADDLEOCR_ENABLED=true` in `.env`. First upload
downloads PP-OCRv4 models (~15 MB). On Windows CPU keep
`PADDLEOCR_ENABLE_MKLDNN=false`. See `backend/PADDLEOCR.md` for the full
chain (PaddleOCR → qwen3.7-plus vision → mock templates).

To use a real Supabase project instead of local SQLite: run
`supabase/migrations/0001_init.sql` against your Supabase project (via the
Supabase CLI or the SQL editor), then set `DATABASE_URL` in `.env` to your
Supabase Postgres connection string (`postgresql+asyncpg://...`).

Run tests:

```bash
cd backend
pytest tests/ -v
```

**Windows note on WeasyPrint (PDF rendering):** WeasyPrint needs native
Pango/cairo/GDK-PixBuf libraries. In this build environment they were
already resolvable and PDF generation worked out of the box; if it doesn't
in yours, `pdf_generator.py` degrades gracefully to a `.fallback.html` file
instead of crashing the pipeline (clearly flagged via
`used_pdf_fallback_html` in the API response) — see
[WeasyPrint's install docs](https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#windows)
if you hit this.

**CJK font:** see `backend/app/static/fonts/README.md` — bundle Noto Sans
SC before deploying to a fresh container; local dev falls back to
whatever CJK font your OS already has (this worked fine on the Windows
box this was built on).

### Frontend

No separate requirements file is needed for the frontend. The dependency list is
already in `frontend/package.json`.

```bash
cd frontend
npm install
npm run dev
```

Vite serves the app at `http://localhost:8080`.

If the app needs API settings, add them to a local `.env` or `.env.local` file
in `frontend/` using the same variable names the app expects.

### Deploy frontend to Vercel

This is a **monorepo**: the TanStack Start app lives in `frontend/`, not the
repo root. A generic Vercel `404: NOT_FOUND` almost always means Vercel built
the wrong directory or used the Cloudflare Nitro preset instead of Vercel's.

**Option A (recommended):** Vercel project → Settings → General → **Root
Directory** = `frontend`, Framework Preset = **TanStack Start**, then redeploy.

**Option B:** Leave Root Directory empty; the repo-root `vercel.json` runs
`cd frontend && npm install && npm run build` for you.

The backend (`backend/`) is **not** deployed by Vercel. Host it separately
(Render, Railway, Fly.io, etc.) and set the frontend env var for your API URL
in the Vercel dashboard before going live.

### Try it end-to-end

1. Start the backend (port 8000) and frontend (`cd frontend && npm run dev`,
   port 8080).
2. Open http://localhost:8080 — the Dashboard shows the three route grades
   (loan/grant/CBAM), the process-stage matrix, and a live 3D factory floor
   (click a building to see its interior; hover equipment for live V/I/P +
   carbon-intensity readouts).
3. Go to **New submission**, upload a document. The Documents panel shows
   the OCR-extracted fields grouped by invoice party (购买方/销售方) plus the
   classified CN code and calculation method — editable via the Edit button
   top-right, or leave as-is.
4. Click **Submit**. The six-stage pipeline runs live in the right-hand
   panel; the final stage (Authorize → Upstream) pauses for your explicit
   confirmation before anything leaves your systems.
5. Try **GreenGru Copilot** for the conversational alternative — describe
   your need in the chat, review the router's proposed routes and
   confidence scores on the right, and confirm before it hands off to New
   submission.
6. The confirmed routes each open their own page (EU license / Loan /
   Grant) with the deterministic score, gap-to-next-tier, and advisory
   suggestions.

## Known limitations / honest gaps (do not treat as launch-ready)

These are documented, not hidden — see
`.claude/skills/carbon-passport-project/references/primary-sources/INVENTORY.md`
for the full list and what to do about each:

1. **DRI-EAF and scrap-EAF China GHG factor DB values** are placeholders
   (only BF-BOF is confirmed against the primary database).
2. **CISA low-carbon-steel tier boundaries** (grades B-D) are interpolated
   placeholders between two real anchors (IEA near-zero for Grade A, EU
   benchmark for Grade B) — every score carries `cisa_grade_is_provisional:
   true` until CISA's own document is obtained.
3. **The CBAM phase-in factor percentages** (see above) are corroborated
   across three independent secondary sources but not yet cross-checked
   against the delegated act's own formula text.
4. **LLM output is mock by default.** Real prose quality (passport,
   financing report, advisory plan) requires a real `DASHSCOPE_API_KEY`
   and has not been human-reviewed in this build pass.
5. **ModelScope Stage-0 pre-screen** (`ENABLE_MODELSCOPE_PRESCREEN`) is a
   structural stub — it doesn't hard-fail without the `modelscope` package,
   but real OCR/classification behavior hasn't been exercised.

## Monorepo layout

- `frontend/` — TanStack Start + Vite + React + TypeScript + Tailwind
- `backend/` — Python 3.11+ + FastAPI
- `supabase/migrations/` — SQL schema (source of truth; `backend/app/models_orm.py` mirrors it by hand)
- `firmware/` — ESP32/EmonLib stub (optional, decoupled — see skill for why)
- `.claude/skills/carbon-passport-project/` — project skill: SKILL.md, PRD,
  calculation engine reference, and primary-source inventory

## Supabase quick setup

If you want to run the app against a real Postgres database (Supabase),
follow these steps.

1. Create a Supabase project in the Supabase dashboard.
2. Open the SQL editor and run the SQL in `supabase/migrations/0001_init.sql`.
    (Alternatively, use the helper script below.)
3. In `backend`, create a `.env` file (you can copy the example):

```bash
cp backend/.env.supabase.example backend/.env
# edit backend/.env and replace placeholders with your real values
```

4. Optional: apply the SQL schema from your workstation using the helper:

```bash
# ensure DATABASE_URL is exported; can be the same value you put in backend/.env
export DATABASE_URL='postgresql+asyncpg://postgres:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres'
./backend/scripts/apply_supabase_schema.sh
```

Notes:
- The app expects `DATABASE_URL` in the `postgresql+asyncpg://...` form.
- The helper script normalizes the URL for `psql` by removing `+asyncpg`.
- If you prefer the Supabase dashboard, pasting the SQL directly into the
   SQL editor is the simplest option.

