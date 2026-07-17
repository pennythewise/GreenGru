# GreenGru — Steel SME Carbon Passport & Green Finance Platform

**Product:** GreenGru (codename: Carbon Passport for Steel SMEs)  
**Prepared for:** Hackathon MVP → production path  
**Status:** End-to-end PRD (v2) — aligned with current monorepo  
**Last updated:** 2026-07-15

---

## 1. Executive summary

GreenGru is a web platform for **Chinese steel-downstream SMEs** (bolts, fasteners, structural steel — 8 locked CN codes) to:

1. **Ingest** operational data (invoices, utility bills, production records, IoT sensors) with minimal human effort  
2. **Validate** document authenticity against official and commercial tax-invoice sources  
3. **Calculate** carbon intensity and **CISA-grade** performance deterministically  
4. **Route** each SME into one or more of three parallel journeys: **Green Loan**, **Green Factory Grant**, **EU License (CBAM)**  
5. **Screen, diagnose, and advise** on loan/grant eligibility using Chinese regulatory rubrics and **bank evaluation standards**  
6. **Generate** cited PDF reports (WeasyPrint + Jinja2)  
7. **Feed** Scope 1/2 summaries to **anchor enterprises** (Baowu/Ansteel) for Scope 3 integration  
8. **Monitor** factory processes in a simulated real-time dashboard (voltage, current, power, carbon warnings)

The product is distributed through **Baowu/Ansteel** as a value-added service to downstream customers. Every regulated number is computed in deterministic code; LLM agents only read pre-computed values and write prose or classify — never the reverse.

---

## 2. Problem statement

Chinese steel-downstream SMEs face:

| Pressure | Impact |
|----------|--------|
| **EU CBAM** (definitive phase from 2026) | Default embedded-emission values can ~2× actual; certificate obligation phases in 2.5% (2026) → 100% (2034) |
| **Domestic dual-control** (总量+强度) | Anchor-enterprise ESG pass-through eliminates non-compliant suppliers |
| **Green finance gap** | Banks use ESG / green-factory rubrics SMEs cannot map to their own data |
| **No path from number → action** | Calculators stop at a score; SMEs need gaps, fixes, and bank-ready evidence |

GreenGru turns invisible emissions into **three usable outputs**: CBAM export passport (bilingual), green financing readiness report (Chinese), and a prioritized action plan — plus anchor-enterprise aggregate visibility.

---

## 3. Users & journeys

| User | Goal | Primary surfaces |
|------|------|------------------|
| **SME operator** (QC/EHS, no carbon specialist) | Upload data, get scores, fix gaps, download bank-ready PDFs | New Submission, Copilot, Loan/Grant/Passport pages, Factory dashboard |
| **EU importer** | Evidence for CBAM declaration | CBAM passport PDF (from SME) |
| **Bank / subsidy administrator** | Eligibility evidence | Financing report + screening score PDF |
| **Baowu/Ansteel account manager** | National map of downstream SME tiers; Scope 3 feed | Enterprise map + aggregate API (tier + totals only) |

---

## 4. System architecture (dual pipeline)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SME DATA INGESTION LAYER                             │
│  Invoices/photos/PDF ──► OCR (PaddleOCR in-process) + Qwen parse            │
│  CSV/XLSX ────────────► Deterministic parser (no vision LLM)                 │
│  IoT sensors ─────────► MQTT → /api/iot/ingest (optional, decoupled)         │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VALIDATION LAYER (invoice authenticity)                   │
│  State Taxation Administration portal check (国家税务总局发票查验)            │
│  Commercial validators: Nuonuo Open Platform (诺诺开放平台), Yonyou (用友),     │
│  Huawei Cloud Marketplace Fapiao Validation API (秒验真)                    │
│  → Returns: authentic / mismatch / not_found + verifier_id                   │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│              DETERMINISTIC CORE (trust path — no LLM arithmetic)             │
│  Intake validator → CN classifier (8 codes) → Factor lookup                  │
│  → CBAM calculation engine → CISA threshold scoring                          │
└───────────────┬─────────────────────────────────────┬───────────────────────┘
                │                                     │
                ▼                                     ▼
┌───────────────────────────────┐   ┌───────────────────────────────────────┐
│  ANCHOR ENTERPRISE CHANNEL     │   │  SME MULTI-ROUTE AGENT PIPELINE        │
│  Scope 1+2 summary API push      │   │  Router → Pre-screener → Diagnosis     │
│  Privacy-preserving handoff      │   │  → Advisory → Human-in-loop → Report   │
│  National SME map (Baowu view)   │   │  (Loan / Grant / EU License parallel)  │
└───────────────────────────────┘   └───────────────────────────────────────┘
```

### 4.1 Non-negotiable design rules

1. **Deterministic code computes every regulated number** (tCO2e, tariff, CISA grade, subsidy amount, screening score).  
2. **LLM agents** only: extract fields, classify CN code, write prose, diagnose gaps in natural language.  
3. **No blockchain / ZK** in MVP — hash + HMAC signature on PDFs only.  
4. **IoT never feeds CBAM tariff** — steel is Annex II; electricity intensity affects grant/loan scores only.  
5. **Exactly 8 CN codes** — no expansion without sign-off.  
6. **Bilingual passport only** — financing report Chinese-only.

---

## 5. Data ingestion

### 5.1 Supported inputs

| Source | Processing | Human in loop |
|--------|------------|---------------|
| **增值税专用发票** (photos, scans, PDF) | PaddleOCR (lang=ch, zh+en) → field parse (regex + Qwen) → mock fill for gaps | Edit extracted fields before submit |
| **Structured CSV/XLSX** | Deterministic column map | Column mapping confirm if ambiguous |
| **Utility / production records** | Same OCR path or manual form | Optional |
| **IoT (ESP32 + EmonLib)** | MQTT → `POST /api/iot/ingest` | Toggle on New Submission |

### 5.2 OCR stack (current implementation)

| Component | Role | Config |
|-----------|------|--------|
| [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) | Image text detection + recognition (in-process) | `PADDLEOCR_ENABLED`, `PADDLEOCR_LANG=ch` |
| Qwen structured extraction | Invoice field JSON from OCR text | `DASHSCOPE_API_KEY` + `text-embedding-v4` for PDFs |
| Mock invoice templates | Filename-keyed fallback (`sample_A1`, `sample_A2`, WhatsApp photo) | Always available |

**API:** `POST /api/intake/ocr-preview` — powers New Submission upload zone.

### 5.3 PDF embedding (current implementation)

For PDF uploads:

1. Extract text (`pypdf`)  
2. Chunk (~800 chars, 120 overlap)  
3. Embed with **Qwen `text-embedding-v4`** (1024-dim)  
4. Store in **Supabase `document_embeddings`** (pgvector) or local `./storage/embeddings/*.json`

---

## 6. Data validation (invoice authenticity)

### 6.1 Product behaviour (user-facing)

After OCR extraction, the system shows **invoice verification status** as if live:

- ✓ **Verified** — code, number, date, amount match official records  
- ⚠ **Mismatch** — field disagreement (highlight which field)  
- ○ **Pending** — validation in progress  

The UI **does not label data as simulated** — operators experience production-grade verification.

### 6.2 Engineering implementation (simulated)

| Provider | Capability | MVP status |
|----------|------------|------------|
| **国家税务总局发票查验平台** | Official VAT invoice check | Simulated deterministic rules on invoice code/number/checksum patterns |
| **诺诺开放平台 (Nuonuo)** | Commercial 秒验真 API | Simulated — **primary cited provider in backend responses** |
| **用友 (Yonyou)** | Enterprise fapiao validation | Simulated fallback |
| **华为云市场发票验真 API** | Automated split-second verification | Simulated fallback |

**Planned endpoint:** `POST /api/intake/validate-invoice`  
**Response schema:**

```json
{
  "status": "verified | mismatch | not_found",
  "provider": "nuonuo",
  "provider_label": "诺诺开放平台",
  "checked_at": "ISO-8601",
  "field_results": [
    { "field": "invoice_code", "expected": "...", "actual": "...", "match": true }
  ]
}
```

**Current codebase:** Intake validator (`intake_validator.py`) covers plausibility only — **invoice portal check not yet wired to frontend**.

---

## 7. CISA calculation & grading

### 7.1 Calculation engine

Port of `backend/app/calculation_engine.py` (also in skill reference):

| Output | Description |
|--------|-------------|
| `intensity_tco2e_per_tonne` | Measured or China-default by route |
| `benchmark_tco2e_per_tonne` | EU IR 2025/2621 route benchmark |
| `tariff_cost_eur_per_tonne` | **Net**, phase-in adjusted (current year) |
| `gross_tariff_cost_eur_per_tonne` | **2034 steady-state** (fully phased-in) |
| `annual_exposure_eur` | Export tonnes × net tariff |

**Phase-in schedule** (Regulation EU 2023/956 Art. 31(3)): 2.5% (2026) → 100% (2034).

### 7.2 CISA grading

| Grade | Meaning | Status |
|-------|---------|--------|
| E → A | Low-carbon steel tiers | Tier **boundaries provisional** until CISA source obtained |
| BF-BOF default | 3.506 tCO2e/t confirmed | In factor DB |

**API:** `POST /api/calculate` → `POST /api/score`

---

## 8. Multi-route agent pipeline

### 8.1 GreenGru Copilot router

**Surface:** `/entry` + header **G** icon (right-side panel)

| Intent signal | Route |
|---------------|-------|
| Green loan, metering upgrade, bank credit | **Loan** |
| 零碳工厂, grant, subsidy | **Grant** |
| EU export, CBAM, carbon passport | **EU License** |

User **confirms** ticked routes before pipeline runs (confidence floor 0.70).

### 8.2 Per-route document intake (deterministic checklist)

Each route page (`/loan`, `/grant`, `/passport`) shows **Section A — Document intake** with required rows. Missing mandatory docs block Section B.

### 8.3 Loan / Grant screening agent

**Purpose:** Score SME eligibility for green credit and factory subsidies.

**Primary rubrics (deterministic + cited):**

| Framework | Used for |
|-----------|----------|
| 《绿色工厂评价通则》**GB/T 36132** | Grant tier, scrap ratio, metering, renewable share |
| 《绿色金融支持项目目录》**PBOC 2025** | Loan product eligibility |
| **PBOC 碳减排支持工具 (CERF)** | Refinancing benefit estimate |
| **工信部联节〔2026〕13号** | Zero-carbon factory subsidy |

**Bank evaluation standards (screening dimensions — from partner research):**

#### 中国银行 (BOC) — industry credit access

| Industry | Key assessment points |
|----------|----------------------|
| 石油炼化 | Energy-efficiency benchmark; no major EHS accidents in 5y; phase-out if non-compliant without upgrade plan |
| 火力发电 | EIA + energy-saving review; emission-reduction facility ops; orderly exit of low-efficiency units |
| 风力/光伏发电 | Active growth sector; environmental + land compliance |
| 生物多样性 | No credit to projects damaging critical habitats |

#### 建设银行 (CCB) — ESG “四色五类”

| Color | Category | Criterion (3-year window) |
|-------|----------|---------------------------|
| 绿 | 正常类 | No negative ESG events |
| 蓝 | 关注类 | Minor negative ESG events |
| 黄 | 观察类 / 整改类 | Elevated monitoring or rectification required |
| 红 | 退出类 | Major negative ESG events |

CCB model: **74 industry-specific ESG models**, differentiated by industry and enterprise scale.

#### 招商银行 / 江苏银行 / 民生银行 — green factory loan

| Bank | Differentiator |
|------|----------------|
| **招商银行** | Five dimensions: 能源低碳化, 资源高效化, 生产洁净化, 产品绿色化, 用地集约化 → matched products (distributed PV loan, EMC financing, equipment renewal, etc.) |
| **江苏银行** | “Green Factory Loan” pricing tied to **企业绿码** + ESG rating; up to **50bp** cumulative discount |
| **民生银行** | Access: on national/provincial/municipal green-factory list; ≥6 months operation; sound finances; clean controller credit; compliant project |

**Screening output schema:**

```json
{
  "route": "loan | grant",
  "overall_score": 0-100,
  "tier_label": "深绿 | 浅绿 | 黄 | 红 | B | C | ...",
  "bank_esg_color": "绿 | 蓝 | 黄 | 红",
  "dimension_scores": [
    { "framework": "GB/T 36132 §5.2", "score": 68, "max": 100, "citation": "..." }
  ],
  "sources": []
}
```

**Current codebase:** Route pages show **deterministic preview scores** from `dashboard-data.ts`; dedicated screening agent endpoint **not yet implemented**.

### 8.4 EU License (CBAM) pre-screener

**Rubric:** Reg (EU) 2023/956, IR (EU) 2025/2621 default values, verifier accreditation checklist.

**Current codebase:** `/passport` RoutePage with gap list + advisory cards; full pre-screener agent **partial** (calculation + passport agent exist).

### 8.5 Diagnosis agent (NEW — separate from advisory)

**Purpose:** Tell the SME **what they lack** — not solutions yet.

**Input:** Screening scores + intake data + GB/T 36132 + PBOC catalogue + bank dimension gaps  
**Output:**

```json
{
  "gaps": [
    {
      "criterion": "GB/T 36132 §5.2 scrap-steel ratio",
      "required": "≥30%",
      "actual": "24.5%",
      "severity": "blocking | warning",
      "bank_impact": "江苏银行 企业绿码 tier cap"
    }
  ],
  "summary_cn": "...",
  "summary_en": "..."
}
```

**Tone:** Point out issues plainly; **more detail on deficiencies than on strengths**.

**Current codebase:** Gap lists exist as static demo data in `dashboard-data.ts`; **no dedicated diagnosis agent or API**.

### 8.6 Advisory agent

**Purpose:** Actionable solutions from diagnosis output.

**Input:** Diagnosis gaps + path cost ranker + CBAM risk tier + financing tier  
**Output:** 1–3 prioritized actions with cost range (CNY), impact estimate, implementation status

**Current codebase:** `advisory_agent.py` + `POST /api/advisory` — **implemented**; uses deterministic `path_ranker.py` first.

### 8.7 Report-making agent

**Purpose:** Generate final PDF reports from cleaned data + human-approved scores.

| Document | Template engine | Language |
|----------|-----------------|----------|
| CBAM export passport | Jinja2 → WeasyPrint | EN + CN |
| Green financing readiness | Jinja2 → WeasyPrint | CN only |
| Screening / diagnosis summary | Jinja2 → WeasyPrint | CN (+ EN summary optional) |

**Integrity:** SHA-256 content hash + HMAC signature (`documents` table).

**Current codebase:** `pdf_generator.py`, `passport_agent.py`, `financing_agent.py` — **implemented** for passport + financing; screening/diagnosis PDF **not yet**.

### 8.8 Human-in-the-loop approval loop

```
Upload → OCR → Validate → Calculate → Score
    → Screen → Diagnose → Advise
    → [HUMAN REVIEW]
         ├─ Reject / edit data → re-run from intake or screening
         └─ Approve
              → Report agent (final PDF)
              → Link to PBOC green finance portal (银行绿色金融门户)
```

**UI states:** `draft` → `pending_review` → `approved` → `published`

**Current codebase:** New Submission has edit-on-extract + submit animation; **no formal approval state machine or re-run orchestration**.

---

## 9. Anchor enterprise integration

### 9.1 Scope 1/2 → Scope 3 API handoff

After CISA calculation, aggregate **Scope 1 + Scope 2** totals per SME are pushed to Baowu/Ansteel via:

```
POST /api/baowu/scope3-feed
{
  "company_id": "uuid",
  "cisa_grade": "C",
  "intensity_tco2e_per_tonne": 3.12,
  "annual_scope12_tco2e": 1240.5,
  "verification_status": "verified",
  "period": "2026-Q2"
}
```

**Privacy model (simulated decentralization):** SME raw invoices never leave GreenGru; anchor sees **verified aggregates + tier only**. Engineering uses signed API tokens + field-level redaction — **no real crypto/ZK in MVP**.

### 9.2 National SME map (Baowu dashboard)

**Experience:** Clash-of-Clans-style **country map** with cloud layers; zoom in/out; click province → SME cluster → factory card.

| Map layer | Data |
|-----------|------|
| Country | ~N SMEs coloured by CISA grade |
| Province | Cluster count + avg tier |
| Factory pin | Name, grade, last sync, warning badge |

**Interactions:** Pinch/zoom, orbit clouds on idle, enter factory → 3D interior view.

**Current codebase:**

| Piece | Status |
|-------|--------|
| `GET /api/baowu/dashboard` (aggregate rows) | ✅ Implemented |
| `Dashboard.tsx` grade cards + factory sync | ✅ Demo data |
| `FactoryScene.tsx` 3D five-zone factory | ✅ Implemented (simulated V/I/P/carbon) |
| Country map with clouds + zoom | ❌ Not implemented |

---

## 10. SME factory monitoring dashboard

### 10.1 Real-time metrics (simulated)

Example SME: **恒峰紧固件 (Hengfeng Fasteners)**

| Metric | Source | Warning threshold |
|--------|--------|-------------------|
| Voltage (V) | ESP32 CT-clamp | ±10% nominal |
| Current (A) | ESP32 | > rated × 1.15 |
| Power (kW) | V × I | Stage budget exceeded |
| Carbon intensity (tCO2e/t) | Stage allocation model | > CISA tier ceiling |

### 10.2 Process-level view

Five stages (matches `factoryFloor` in `dashboard-data.ts`):

1. Sintering  
2. Melting  
3. Rolling  
4. Galvanizing  
5. Finishing  

Each stage shows live readings; **warnings** when carbon or power exceeds threshold (orange/red badges).

**Current codebase:**

| Piece | Status |
|-------|--------|
| `FactoryScene.tsx` — 3D zones, hover V/I/P, smoke, zoom-to-interior | ✅ |
| `FactoryInteriors.tsx` — equipment cutaway | ✅ |
| `POST /api/iot/ingest` | ✅ Backend stub |
| `firmware/src/main.ino` | ✅ ESP32 stub |
| Live WebSocket feed to dashboard | ❌ Demo timers only |
| Process-level carbon threshold alerts | ❌ Static demo warnings |

---

## 11. GreenGru Copilot (contextual assistant)

Header **G** icon opens full-height right panel:

- Page-aware suggested prompts (Loan / Grant / EU License / New Submission)  
- Chat for questions while filling forms  
- Non-blocking (modal=false sheet)

**Current codebase:** ✅ `CopilotChat.tsx` + `copilot-context.ts`

---

## 12. Tech stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Frontend | TanStack Start, React 19, TypeScript, Tailwind, shadcn/ui, Recharts, React Three Fiber | Port 8080 dev |
| Backend | Python 3.11, FastAPI | Port 8000; Vite proxies `/api` in dev |
| LLM | Qwen via QwenCloud / DashScope OpenAI-compatible API | `text-embedding-v4`, `qwen-flash`, `qwen-plus`, `qwen3-vl-flash` |
| OCR | PaddleOCR (in-process) | `paddleocr_client.ocr_image_bytes` |
| DB | Supabase Postgres + pgvector | SQLite fallback for local dev |
| PDF | WeasyPrint + Jinja2 | CJK fonts bundled |
| IoT | ESP32 + MQTT → FastAPI ingest | Decoupled optional module |
| Monorepo | `/frontend`, `/backend`, `/firmware`, `/supabase` | |

### 12.1 Environment variables

**Backend (`backend/.env`):**

| Variable | Required | Purpose |
|----------|----------|---------|
| `DASHSCOPE_API_KEY` | Yes (real AI) | Qwen chat + embeddings |
| `DASHSCOPE_BASE_URL` | Yes | QwenCloud: `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` |
| `LLM_MOCK_MODE` | Yes | `false` when key set |
| `MODEL_EMBEDDING` | Yes | `text-embedding-v4` |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | For PDF vectors | pgvector storage |
| `PADDLEOCR_ENABLED` | Optional | `true` — in-process PP-OCRv4 |
| `PADDLEOCR_LANG` | Optional | `ch` (简体中文 + English) |

**Frontend (`frontend/.env`):**

| Variable | Dev | Prod |
|----------|-----|------|
| `VITE_API_URL` | Leave unset (Vite proxy) | Deployed backend URL |

---

## 13. API contract (full)

### 13.1 Implemented today

```
GET    /health
POST   /api/intake/ocr-preview          ← New Submission upload preview
POST   /api/intake                      ← Full intake + validator
POST   /api/intake/validate             ← Re-validate manual fields
POST   /api/classify
POST   /api/calculate
POST   /api/score
POST   /api/documents/passport
POST   /api/documents/financing
GET    /api/documents/{id}/download
POST   /api/advisory
POST   /api/submissions
GET    /api/submissions/{id}
POST   /api/submissions/{id}/process     ← Full pipeline orchestrator
POST   /api/iot/ingest
GET    /api/baowu/dashboard
POST   /api/companies
POST   /api/products
```

### 13.2 Planned (this PRD)

```
POST   /api/intake/validate-invoice     ← Nuonuo-simulated fapiao check
POST   /api/screen/loan                 ← Loan screening agent score
POST   /api/screen/grant                ← Grant screening agent score
POST   /api/screen/passport             ← CBAM pre-screener score
POST   /api/diagnose                    ← Diagnosis agent (gaps only)
POST   /api/submissions/{id}/approve    ← Human-in-loop gate
POST   /api/submissions/{id}/rerun      ← Re-run from stage N
POST   /api/baowu/scope3-feed           ← Aggregate push to anchor ERP
GET    /api/baowu/map                    ← GeoJSON SME pins for country map
GET    /api/factory/{id}/live            ← WebSocket or SSE for IoT stream
```

Every response includes `sources[]` citing regulatory constants used.

---

## 14. Database schema

### 14.1 Core tables (implemented — `0001_init.sql`)

`companies`, `products`, `submissions`, `intake_records`, `calculations`, `scores`, `subsidy_matches`, `documents`, `advisory_plans`, `iot_readings`

### 14.2 Document embeddings (implemented — `0002_document_embeddings.sql`)

```sql
document_embeddings (
  id, file_name, file_hash, chunk_index, chunk_text,
  embedding vector(1024), model, created_at
)
```

### 14.3 Planned extensions

```sql
invoice_validations (submission_id, provider, status, field_results_json, checked_at)
screening_results   (submission_id, route, overall_score, dimension_scores_json)
diagnosis_reports   (submission_id, gaps_json, summary_cn, summary_en)
approval_events     (submission_id, actor, action, note, created_at)
sme_locations       (company_id, province, lat, lng, map_cluster_id)
```

---

## 15. Supported CN codes (locked)

| CN code | Description | Route(s) |
|---------|-------------|----------|
| 7207 | Semi-finished billets | BF-BOF, DRI-EAF |
| 7208 10 00 | Hot-rolled coil | BF-BOF |
| 7213 / 7214 | Bars / wire rod | BF-BOF, scrap-EAF |
| 7301 | Sheet piling | downstream |
| 7302 | Railway track material | downstream |
| 7318 15 42 / 7318 15 88 | Bolts, screws | downstream |
| 7326 | Other steel articles | downstream |

---

## 16. Implementation status matrix (codebase snapshot 2026-07-15)

| Capability | Backend | Frontend | Notes |
|------------|---------|----------|-------|
| Invoice OCR upload | ✅ `ocr-preview` | ✅ `new.tsx` | PaddleOCR + qwen fallback + mock |
| PDF text-embedding-v4 | ✅ | ✅ shows in card | Supabase or local JSON |
| Qwen classify + parse | ✅ | ✅ | QwenCloud intl endpoint |
| Intake validator (plausibility) | ✅ | — | |
| Invoice portal validation (Nuonuo) | ❌ | ❌ | PRD §6 — next sprint |
| CN classifier (8 codes) | ✅ | ✅ preview | |
| CBAM calculation + phase-in | ✅ | ✅ dashboard | 42 tests |
| CISA threshold scoring | ✅ | ✅ | Provisional tier bounds |
| CBAM passport PDF | ✅ | ✅ `/passport` | |
| Financing report PDF | ✅ | — | |
| Program matcher (PBOC/CERF) | ✅ | — | `subsidy_programs.py` |
| Advisory agent | ✅ | ✅ cards | |
| **Diagnosis agent** | ❌ | ❌ | Separate from advisory |
| **Loan/grant screening agent** | ❌ | demo scores | Bank rubrics in PRD §8.3 |
| **Human approval loop** | ❌ | ❌ | |
| GreenGru Copilot | — | ✅ | |
| Baowu aggregate API | ✅ | demo | |
| **Country SME map** | ❌ | ❌ | |
| **Scope 3 API push** | ❌ | ❌ | |
| 3D factory dashboard | — | ✅ `FactoryScene` | Simulated metrics |
| IoT live stream | stub | demo | |
| Vite → backend proxy | — | ✅ | Fixes CORS/fetch |
| Supabase pgvector | ✅ migration | — | |

---

## 17. Build phases (recommended)

### Phase A — Complete ingestion trust story (Week 1)
- [ ] `validate-invoice` simulated Nuonuo endpoint + UI badge on ExtractedInvoiceCard  
- [ ] Wire New Submission **Submit** → full `/api/submissions` pipeline  
- [ ] Human edit fields → persist to `intake_records`

### Phase B — Screening + diagnosis (Week 2)
- [ ] Deterministic loan/grant screener (GB/T 36132 + PBOC + bank dimensions)  
- [ ] Diagnosis agent (Qwen prose, gaps-only prompt)  
- [ ] Separate diagnosis panel on Loan/Grant pages (issues first, advisory second)

### Phase C — Enterprise map + Scope 3 (Week 3)
- [ ] `sme_locations` seed data + map component (MapLibre/Leaflet, cloud overlay)  
- [ ] `POST /api/baowu/scope3-feed` simulated push  
- [ ] Baowu dashboard reads map + aggregates

### Phase D — Human loop + bank handoff (Week 4)
- [ ] Approval state machine on submissions  
- [ ] Re-run from stage N without re-billing completed stages  
- [ ] Final PDF + PBOC portal deep link  
- [ ] IoT WebSocket → factory warning badges

---

## 18. Non-functional requirements

| Requirement | Implementation |
|-------------|----------------|
| **Trust** | Every endpoint returns `sources[]`; no LLM arithmetic |
| **Disclaimer** | On all PDFs: not a substitute for licensed broker/advisor |
| **Data segregation** | Baowu role: `scores` + `calculations` aggregates only (RLS in migration) |
| **Simulation policy** | External APIs simulated in backend; **UI presents all results as production** |
| **Resume pipeline** | Stage outputs persisted before next stage (DashScope outage safe) |
| **CJK PDF** | Noto Sans SC bundled — test asserts CN string survives render |

---

## 19. Decision log

| Decision | Rationale |
|----------|-----------|
| No blockchain/ZK | Hash+HMAC sufficient for MVP trust |
| No autonomous agent framework | Fixed code-orchestrated pipeline |
| IoT decoupled from CBAM | Steel Annex II — direct emissions only |
| Diagnosis separate from Advisory | User request: more focus on gaps before solutions |
| Nuonuo as cited validator | User spec; simulated, not wired to real API yet |
| QwenCloud intl endpoint for hackathon | User's key source; production should migrate to Beijing Model Studio for data sovereignty |
| PaddleOCR in-process | Avoids dead chineseocr model links; single-process deploy |
| 8 CN codes locked | PRD scope guardrail |

---

## 20. Appendix — repository map

```
GreenGru-1/
├── PRD.md                          ← this document
├── frontend/                       TanStack Start UI
│   ├── src/routes/new.tsx          New Submission + OCR upload
│   ├── src/routes/entry.tsx        Copilot router
│   ├── src/routes/loan|grant|passport.tsx
│   ├── src/components/FactoryScene.tsx
│   ├── src/components/CopilotChat.tsx
│   └── src/lib/api.ts              Backend client (dev proxy)
├── backend/                        FastAPI pipeline
│   ├── app/calculation_engine.py   Deterministic CBAM
│   ├── app/services/ocr_preview.py OCR orchestration
│   ├── app/services/pdf_embedding.py  text-embedding-v4
│   ├── app/services/advisory_agent.py
│   └── app/routers/intake.py       /ocr-preview
├── supabase/migrations/            Postgres + pgvector
├── firmware/                       ESP32 stub
└── .claude/skills/carbon-passport-project/  Build rules + original PRD reference
```

---

## 21. Sources cited

- Reg (EU) 2023/956, IR (EU) 2025/2621 — CBAM benchmarks + markup  
- China GHG Factor Database v2 — route intensities  
- CISA 低碳排放钢 standard (tier boundaries pending)  
- GB/T 36132 — 绿色工厂评价通则  
- PBOC 2025 绿色金融支持项目目录  
- 工信部联节〔2026〕13号 — 零碳工厂  
- 中国人民银行碳减排支持工具 (2026 expansion)  
- 中国银行 / 建设银行 / 招商银行 / 江苏银行 / 民生银行 — industry credit & ESG rubrics (partner screenshots)  
- Nuonuo Open Platform, Yonyou, Huawei Cloud — invoice validation (simulated in MVP)  
- [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) — Stage-1 image OCR

---

*For non-negotiable build rules during implementation, always consult `.claude/skills/carbon-passport-project/SKILL.md` first.*
