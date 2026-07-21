<p align="center">
  <img src="https://img.shields.io/badge/GreenGru-绿毂-0d9488?style=for-the-badge" alt="GreenGru" />
  <img src="https://img.shields.io/badge/CBAM-EU_2026-1d4ed8?style=for-the-badge" alt="CBAM" />
  <img src="https://img.shields.io/badge/IoT-ESP32-f59e0b?style=for-the-badge" alt="ESP32" />
  <img src="https://img.shields.io/badge/AI-Qwen_via_OpenRouter-8b5cf6?style=for-the-badge" alt="Qwen" />
</p>

<h1 align="center">GreenGru</h1>
<p align="center"><i>Turn carbon compliance into bankable capacity.</i></p>

<p align="center">
  <a href="./README.md"><b>🇨🇳 中文</b></a>
  &nbsp;·&nbsp;
  <a href="#english"><b>🇬🇧 English</b></a>
</p>

---

<a id="english"></a>

## 🇬🇧 English

### One-liner

**GreenGru** = shopfloor meters + deterministic carbon math + an **agentic multi-channel workflow with human-in-the-loop** → unlock green loans, factory grants, and EU CBAM passports — while giving Baowu/Ansteel-class anchors a Scope 3 decision net.

---

### 💡 Idea

Not another carbon calculator.

GreenGru turns steel-downstream SME **invoices · IoT electricity · process routes** into one verified data spine:

- **SMEs:** compliance docs → financing readiness (loan · grant · EU license)
- **Anchors:** Scope 3 Category 10 visibility, tiering, action
- **Trust:** engines compute regulated numbers; agents classify & write; humans approve at gates

```mermaid
flowchart LR
  SME["Downstream SME<br/>compliance · green finance"] --- SPINE["GreenGru<br/>one verified spine"]
  SPINE --- ANCHOR["Anchor · Baowu / Ansteel<br/>Scope 3 DSS"]
```

| Who | Pain | GreenGru |
|-----|------|----------|
| SME | Can't file CBAM / unlock green credit | Three-channel pre-screen + reports |
| Anchor | Scope 3 in spreadsheets | Supplier map · CISA tiers |
| Bank | No verifiable kWh evidence | ESP32 windows + CISA grid EF |

> **Trust rule:** tCO₂e · CBAM €/t · CISA grade · subsidy amounts → **deterministic engines**. Qwen **only reads numbers** to write/classify — never invents a tariff.

---

### ⚙️ How it works

#### 1. Multimodal intake

- Invoice PDF/JPEG → OCR  
- ESP32 meter → `POST /api/iot/ingest`  
- Natural-language goals → **Copilot (Agent 0)** routes channels  

#### 2. Agentic workflow + human-in-the-loop

Fixed orchestration (not free-roaming agents). Specialist agents run in parallel; humans decide at gates:

```mermaid
flowchart TB
  U["SME / account manager"] --> COP["Copilot · Agent 0<br/>intent · channel routing"]
  COP --> P1["Agent 1.1<br/>EU CBAM pre-screener"]
  COP --> P2["Agent 1.2<br/>Loan pre-screener"]
  COP --> P3["Agent 1.3<br/>Grant pre-screener"]
  P1 --> HITL{"Human-in-the-loop<br/>gaps · channel confirm · authorize"}
  P2 --> HITL
  P3 --> HITL
  HITL --> ADV["Agent 2 · Advisory<br/>dashboard pull · gap list · actions"]
  ADV --> OUT["Passport Excel · financing report · PDF"]
```

| Agent | Role |
|-------|------|
| **Copilot (0)** | Understand intent; dispatch channels |
| **1.1 EU CBAM** | Export pre-screen · doc gaps |
| **1.2 Loan** | Green-loan readiness · evidence list |
| **1.3 Grant** | Zero-carbon factory grant · score gaps |
| **2 Advisory** | Scores + factory data → actionable advice |

#### 3. Six-stage pipeline (code-orchestrated)

```mermaid
sequenceDiagram
  participant H as Human
  participant C as Copilot
  participant P as Pre-screeners
  participant E as Calc engine
  participant A as Advisory
  H->>C: Declare goals (loan / grant / CBAM)
  C->>P: Parallel pre-screen
  P-->>H: Scores · gap list
  H->>H: Upload / confirm / approve
  P->>E: Validated fields
  E-->>A: Deterministic numbers
  A-->>H: Draft reports
  H->>A: Export / HMAC authorize
```

1 Intake → 2 Validate → 3 Classify (Qwen · CN codes) → 4 **Engine calculate** → 5 Dashboard snapshot → 6 **HMAC authorize**

#### 4. Edge hardware (highlight)

Non-invasive shopfloor metering — demo-ready clamp on live:

```mermaid
flowchart LR
  AC["220V"] --> VT["ZMPT101B<br/>voltage"]
  AC --> CT["SCT-013<br/>current clamp"]
  VT --> ESP["ESP32"]
  CT --> ESP
  ESP -->|"JSON · 5s"| API["/api/iot/ingest"]
  API --> SNAP["Snapshot 10′/30′/60′"]
  SNAP --> FIN["Financing evidence ONLY<br/>never CBAM tariff"]
```

- **ESP32** — edge Vrms / Irms / W / kWh  
- **ZMPT101B** — isolated AC voltage  
- **SCT-013** — clamp CT  
- Grid EF (CISA B.3): `0.5568` or `0.5942` t/MWh → `tCO₂e = ΔkWh/1000 × EF`

#### 5. Stage 6 · HMAC authorization pack

- Shared-secret signature on aggregated results  
- **Anchors verify integrity** (no silent edits)  
- **SMEs keep raw invoices private**  
- Lightweight, auditable, channel-SaaS ready  

---

### 🏗️ Architecture

```mermaid
flowchart TB
  subgraph EDGE["Edge"]
    HW["ESP32 + ZMPT101B + SCT-013"]
  end
  subgraph APP["App"]
    FE["Frontend · TanStack · React 19"]
    BE["Backend · FastAPI · Python 3.11"]
    FE <--> BE
  end
  subgraph AGENTS["Agentic · Qwen"]
    COP2["Copilot"]
    PRE["Pre-screeners ×3"]
    ADV2["Advisory"]
  end
  subgraph TRUST["Trust core"]
    ENG["calculation_engine"]
    HMAC["HMAC authorize"]
  end
  subgraph DATA["Data · MVP"]
    SB[("Supabase")]
  end
  HW --> BE
  BE --> ENG
  BE --> AGENTS
  BE --> SB
  ENG -.->|"numbers"| AGENTS
  BE --> HMAC
```

**Schema (bird’s-eye)**

```mermaid
erDiagram
  companies ||--o{ products : has
  products ||--o{ submissions : has
  submissions ||--o{ calculations : has
  companies ||--o{ iot_readings : streams
  companies ||--o{ iot_window_snapshots : freezes
  calculations ||--o{ scores : has
  scores ||--o{ documents : has
```

DDL: `supabase/migrations/0001_init.sql` · `0002_iot_window_snapshots.sql`

---

### 🎯 Key Innovations

- **Agentic ≠ chaos** — fixed pipeline + specialist pre-screeners + human gates  
- **Numbers vs prose** — engines own tariffs; agents own documents  
- **One spine, two buyers** — SME monetization + anchor Scope 3  
- **Meters as evidence** — IoT windows feed green finance only, never CBAM  
- **HMAC that ships** — integrity + trade-secret privacy without heavy crypto theater  
- **MVP → China stack** — OpenRouter / Supabase today; Bailian / PolarDB tomorrow  

| Capability | MVP | Production |
|------------|-----|------------|
| LLM | **OpenRouter · Qwen** | **Alibaba Bailian** · ModelScope (optional Stage-0) |
| DB | **Supabase** | **PolarDB / RDS Postgres** |
| Objects | Supabase Storage | **OSS** |

---

### 🧰 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | TanStack Start · React 19 · Tailwind · Recharts |
| Backend | FastAPI · calc engine · scorers · OCR · IoT · pipeline |
| Agents | Copilot · CBAM / Loan / Grant pre-screeners · Advisory (Qwen) |
| LLM | OpenRouter (MVP) → Bailian / ModelScope (prod) |
| DB | Supabase (MVP) → PolarDB (prod) |
| Edge | ESP32 · ZMPT101B · SCT-013 · HTTP ingest |
| Trust | HMAC packs · RLS |

---

### 💰 Business model

> Sell **compliance + financing readiness** to SMEs; sell **Scope 3 visibility + supplier tiering** to anchors.  
> One verified spine — two paying sides. Channel SaaS, not a carbon toy.

- SME SaaS / per-passport fees  
- Anchor seats (account-manager DSS)  
- Hardware metering kits  
- Bank / subsidy channel share  

---

### ❓ FAQ (judge defense)

**❓ Will agents invent tariffs?**  
No. Regulated numbers come only from `calculation_engine`. Agents **read results** to write and classify.

**❓ Why human-in-the-loop?**  
Pre-screeners surface scores and gaps; humans confirm uploads, channels, and authorization — finance/compliance must be accountable.

**❓ Why three pre-screeners instead of one mega-model?**  
Loan, grant, and CBAM have different rulebooks and evidence packs. Separation cuts hallucination and keeps RAG/eval clean.

**❓ Does IoT electricity enter CBAM?**  
**No.** Steel is Annex II — CBAM prices direct emissions. Meters serve green-loan / grant evidence only.

**❓ Why HMAC?**  
Goal: **prove integrity without exposing raw invoices**. HMAC is lightweight, auditable, and demo-explainable for channel SaaS.

**❓ Why OpenRouter + Supabase for MVP?**  
Hackathon velocity. Production swaps to **Bailian (Beijing) + PolarDB** via the same OpenAI-compatible client and ORM.

**❓ Why do anchors pay?**  
Scattered SME compliance becomes Scope 3 Cat.10 + CISA tiers — account managers act, instead of chasing Excel.

---

### 🚀 Quick start

```bash
cd backend && python -m venv .venv && pip install -r requirements.txt
# .env → OPENROUTER_* / Supabase (optional)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

cd frontend && npm install && npm run dev
```

Firmware: `firmware/src/main.ino` (optional Blynk + GreenGru HTTP)

```text
GreenGru/
├── frontend/     # dashboard · channels · Copilot · upstream DSS
├── backend/      # FastAPI · engine · agent orchestration · IoT
├── firmware/     # ESP32 smart meter
├── supabase/     # Postgres migrations + RLS
└── PRD.md        # spec; HMAC authorize · engine/agent boundary
```

---

### 🔥 Closing

**GreenGru: agentic multi-channel workflow + human-in-the-loop + verifiable shopfloor meters — carbon compliance that becomes bankable capacity on Baowu-class supply chains.**

<p align="center"><a href="./README.md"><b>← 中文版</b></a></p>
