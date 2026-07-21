<p align="center">
  <img src="https://img.shields.io/badge/GreenGru-绿毂-0d9488?style=for-the-badge" alt="GreenGru" />
  <img src="https://img.shields.io/badge/CBAM-EU_2026-1d4ed8?style=for-the-badge" alt="CBAM" />
  <img src="https://img.shields.io/badge/IoT-ESP32-f59e0b?style=for-the-badge" alt="ESP32" />
  <img src="https://img.shields.io/badge/AI-Qwen_via_OpenRouter-8b5cf6?style=for-the-badge" alt="Qwen" />
</p>

<h1 align="center">GreenGru</h1>
<p align="center"><b>Carbon passport · green loan · zero-carbon factory grant — for steel-downstream SMEs</b></p>
<p align="center">One verified data spine for <b>SME monetization</b> and <b>Baowu / Ansteel Scope 3 decisioning</b></p>

<p align="center">
  <a href="./README.md"><b>🇨🇳 中文</b></a>
  &nbsp;·&nbsp;
  <a href="#greengru"><b>🇬🇧 English</b></a>
</p>

---

## Why now?

From 2026, EU **CBAM** bills for real. Exporters without verified actuals fall onto **default-value paths** — industry walkthroughs put slab near **~€172/t** and downstream fasteners near **~€526/t**, enough to wipe thin SME margins.

Domestically, **green loans, CERF-style facilities, and zero-carbon factory subsidies** are expanding — but SMEs lack meters, evidence packs, and bilingual filings. Anchor enterprises need auditable **Scope 3 Category 10** across thousands of suppliers.

**GreenGru** ships a demo-ready channel: **shopfloor meter + invoice OCR + deterministic engines + Qwen prose**.

| Who | Pain | GreenGru |
|-----|------|----------|
| **Downstream SME** | Can't file CBAM, can't unlock green credit | Three routes: EU license · loan · grant |
| **Baowu / Ansteel** | Scope 3 lives in spreadsheets | Portfolio map · CISA tiers · action hub |
| **Banks / reviewers** | No verifiable electricity evidence | ESP32 time windows + CISA grid EF |

> **Trust rule:** Regulated numbers (tCO₂e, CBAM €/t, CISA grade, subsidy amounts) come from **deterministic code**. Qwen **only reads those numbers** to classify and write — never invents a tariff.

---

## Product at a glance

<p align="center">
  <img src="docs/assets/architecture-winwin.png" alt="Win-win: SME × anchor enterprise" width="920" />
</p>

- **Three channels:** green loan · factory grant · EU CBAM passport  
- **Edge hardware:** ESP32 + ZMPT101B + SCT-013 → HTTP ingest (Blynk optional)  
- **Save windows:** last **10 / 30 / 60 minutes** on New submission → attached to pipeline as **financing evidence only** (never CBAM tariff math)

<p align="center">
  <img src="docs/assets/architecture-dss.png" alt="Anchor DSS: national map · Scope 3 · decision hub" width="920" />
</p>

---

## Architecture

<p align="center">
  <img src="docs/assets/architecture-system.png" alt="GreenGru system panorama" width="920" />
</p>

```mermaid
flowchart TB
  subgraph EDGE["Edge · Hardware"]
    AC["220V load"] --> ZMPT["ZMPT101B"]
    AC --> SCT["SCT-013 CT"]
    ZMPT --> ESP["ESP32<br/>Vrms · Irms · W · kWh"]
    SCT --> ESP
  end

  subgraph APP["Application"]
    FE["Frontend<br/>TanStack · React 19 · Tailwind"]
    BE["Backend<br/>FastAPI · Python 3.11"]
    FE <--> BE
  end

  subgraph AI["Intelligence · MVP"]
    OR["OpenRouter → Qwen<br/>OCR assist · CN classify · reports"]
  end

  subgraph DATA["Data · MVP"]
    SB[("Supabase Postgres")]
    SQL[("SQLite · zero-config dev")]
  end

  subgraph TRUST["Trust core"]
    ENG["calculation_engine"]
    CISA["CISA / loan / grant scorers"]
  end

  ESP -->|"POST /api/iot/ingest"| BE
  BE --> ENG
  BE --> CISA
  BE --> OR
  BE --> SB
  BE --> SQL
```

> **Stage 6 trust: HMAC authorization packs.** A shared-secret signature proves the aggregated payload wasn’t tampered with — anchors can verify integrity without SMEs handing over raw invoices. Lightweight, auditable, and practical for channel SaaS.

### MVP → China production

| Capability | MVP (fast) | Production (sovereignty) |
|------------|------------|---------------------------|
| LLM | **OpenRouter · Qwen** | **Alibaba Bailian / DashScope** (Beijing) · ModelScope optional Stage-0 |
| DB | **Supabase** | **PolarDB / RDS Postgres** (same ORM) |
| Objects | Supabase Storage | **OSS** |
| IoT | ESP32 → HTTP | Same; optional MQTT bridge |

---

## Six-stage pipeline (fixed orchestration)

<p align="center">
  <img src="docs/assets/architecture-channels.png" alt="SME multi-path channels" width="920" />
</p>

```mermaid
flowchart LR
  S1["1 Intake"] --> S2["2 Validate"]
  S2 --> S3["3 Classify"]
  S3 --> S4["4 Calculate"]
  S4 --> S5["5 Dashboard"]
  S5 --> S6["6 Authorize<br/>HMAC"]
```

Pre-screener knowledge base (RAG): compliance docs → MinerU → LangChain chunking → Qwen embeddings → Supabase → channel agents.

<p align="center">
  <img src="docs/assets/architecture-rag.png" alt="RAG knowledge base" width="920" />
</p>

IoT snapshots travel in Stage 1 / Stage 6 as:

`scope = financing_electricity_only_not_cbam`

---

## Hardware (highlight)

<p align="center">
  <img src="docs/assets/architecture-hardware.png" alt="ESP32 smart meter wiring" width="720" />
</p>

| Part | Role |
|------|------|
| **ESP32** | Edge Wi‑Fi, local RMS / power / kWh |
| **ZMPT101B** | Isolated AC voltage |
| **SCT-013** | Clamp CT + bias circuit |
| **Path** | Optional Blynk + **HTTP → GreenGru** |

Grid EF (CISA App. B.3): **0.5568** vs **0.5942** t/MWh by green-power trading choice →  
`tCO₂e = ΔkWh / 1000 × EF`

---

## Stack map

- **Frontend** — TanStack Start, React 19, Tailwind, Recharts, bilingual SME + upstream DSS  
- **Backend** — FastAPI, CBAM engine, scorers, OCR, IoT, pipeline, Excel/PDF  
- **DB** — `supabase/migrations/0001_init.sql`, `0002_iot_window_snapshots.sql`

```mermaid
erDiagram
  companies ||--o{ products : has
  products ||--o{ submissions : has
  submissions ||--o{ calculations : has
  companies ||--o{ iot_readings : streams
  companies ||--o{ iot_window_snapshots : freezes
```

---

## Business model (one line)

> Sell **compliance + financing readiness** to SMEs; sell **Scope 3 visibility + supplier tiering** to anchors — **one verified spine, two paying sides**.

---

## Quick start

```bash
cd backend && python -m venv .venv && pip install -r requirements.txt
# configure OpenRouter + Supabase in .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

cd frontend && npm install && npm run dev
```

Firmware: `firmware/src/main.ino`

---

## Credo

1. **Numbers are trusted** — engines compute; models write.  
2. **Channels distribute** — via Baowu / Ansteel into SME networks.  
3. **Edge is evidence** — meters unlock green finance.  
4. **Sovereignty upgrades** — MVP global stack → China cloud at launch.

<p align="center"><b>GreenGru — turn carbon compliance into bankable capacity.</b></p>

<p align="center"><a href="./README.md">← 中文版 README</a></p>
