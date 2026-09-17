# AGENTS.md — build & verification notes

Read `CLAUDE.md` and `.claude/skills/carbon-passport-project/SKILL.md` first for
scope and the deterministic-numbers rule. This file only records how to run
and verify the code.

## Backend (Python 3.11 + FastAPI)

```bash
cd backend
uv venv .venv -p 3.11 && uv pip install -p .venv/bin/python -r requirements.txt
# lighter offline test env (skips PaddleOCR / MinerU):
#   uv pip install -p .venv/bin/python fastapi uvicorn pydantic pydantic-settings python-multipart \
#     httpx openai jinja2 openpyxl sqlalchemy greenlet aiosqlite python-dotenv pypdf pymupdf \
#     "numpy<2.4" pillow networkx neo4j langgraph langchain-text-splitters langchain-core supabase pytest pytest-asyncio
.venv/bin/python -m pytest -q          # all tests run offline; conftest forces LLM_MOCK_MODE=true
.venv/bin/uvicorn app.main:app --reload --port 8000
```

- Tests must stay green with no API keys configured.
- `tests/test_calculation_engine.py` is the regression guard for the CBAM
  formula (free-allocation deduction `SEE − CBAM_factor × CSCF × BM`, not a
  multiplier on the liability). Any change to `app/calculation_engine.py` must
  also be copied to
  `.claude/skills/carbon-passport-project/references/calculation_engine.py`.
- LLM failures raise `LlmCallError` → HTTP 503 (`app/main.py`); never fall back
  to inventing a number.

## Frontend (TanStack Start + Vite)

```bash
cd frontend
npm install
npm run dev              # port 8080, proxies /api → localhost:8000
npx tsc --noEmit -p .    # 3 pre-existing TS2367 errors (ApiDocumentationArticle.tsx, vite.config.ts) — not regressions
```

## Regulatory constants — where they live

| Constant | File |
|---|---|
| Annex I China default SEE (8 CN codes, verified vs IR 2026/1740) | `backend/app/calculation_engine.py` |
| CBAM factor / CSCF schedule | `backend/app/calculation_engine.py` |
| Certificate price by quarter | `backend/app/data/cert_price.py` |
| CISA tier boundaries (provisional) | `backend/app/data/cisa_tiers.py` |
| Grid EF (CISA App. B.3) | `backend/app/routers/iot.py`, `frontend/src/lib/cisa-grid-ef.ts` |
