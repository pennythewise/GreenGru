# PRD: 钢铁下游SME碳护照与绿色金融平台
**Codename:** Carbon Passport for Steel SMEs
**Prepared for:** coding agent build (Claude Code), one-month hackathon MVP
**Status:** ready to build

---

## 1. Problem statement

Chinese steel-downstream SMEs (bolt/fastener/structural-steel manufacturers, CN codes under HS 7207/7208/7301/7302/7318/7326) face a compounding squeeze:

1. **EU CBAM** enters its definitive, financially binding phase from 1 January 2026. Without verified emissions data, these SMEs are hit with punitive default values — real industry reporting puts China-origin defaults at roughly double actual measured emissions, and full-rate CBAM cost on a hex bolt (CN 7318 15 88) reaches an estimated €313/tonne by 2034.
2. **No internal expertise.** Per our research, carbon/CN-code literacy work is done ad hoc by QC or EHS staff with no dedicated carbon specialist — a documented "talent desert" (专业碳管理人才荒漠).
3. **Domestic policy pressure.** China's 碳排放总量和强度双控 regime (fully active from 2026) and anchor-enterprise ESG pass-through (e.g. BMW requiring 300+ Tier-1 China suppliers to sign renewable-PPA commitments) mean SMEs face elimination from supply chains even domestically if they can't produce credible carbon data.
4. **No path from number to action.** Existing carbon calculators stop at "here's a number." SMEs need to know whether that number passes a real threshold, and what the cheapest fix is if it doesn't.

**This product turns invisible emissions into three concrete, usable outputs**: a CBAM-ready export passport, a green financing readiness report mapped to real Chinese subsidy/credit programs, and a prioritized action plan — distributed through Baowu/Ansteel as a value-added service to their own downstream customers, which simultaneously improves Baowu's own Category 10 ("processing of sold products") Scope 3 data quality.

---

## 2. Goals and non-goals

### Goals (MVP, one month)
- Support exactly 8 CN codes (see §6.1), all steel/steel-product, Chapters 72/73
- Produce a bilingual (EN + CN) CBAM export passport with a defensible, cited tariff-exposure estimate
- Produce a Chinese-only green financing readiness report mapped to real programs
- Score every submission against two real frameworks: EU CBAM benchmark (route-specific) and CISA's low-carbon steel grade (E–A)
- Produce a ranked, cost-aware action plan (not just a subsidy list)
- Keep every regulated number traceable to a cited source — no LLM-generated arithmetic anywhere in the trust path

### Non-goals (explicitly out of scope for this build)
- Zero-knowledge proofs / cryptographic privacy layer
- Blockchain or distributed ledger of any kind
- Full IoT hardware rollout at scale — one bench-demo sensor prop only, decoupled from the critical path
- Coverage of aluminum, cement, fertilizer, hydrogen, or electricity CBAM sectors
- Autonomous/self-planning agent frameworks — this is a fixed pipeline, not an agent that decides its own steps
- Legal or tax advice — every output carries a disclaimer

---

## 3. Users

| User | What they need | Where they touch the system |
|---|---|---|
| SME operator (QC/EHS staff, no carbon background) | Upload data, get a passport + report + plan, understand it without training | Web app, document intake |
| EU importer / customs contact | Supporting evidence for their own CBAM declaration | Reads the passport PDF (given to them by the SME) |
| Chinese bank / subsidy administrator | Evidence to approve preferential credit or a subsidy | Reads the financing report PDF |
| Baowu/Ansteel account manager (stretch) | Aggregate view of which downstream customers are compliant, at what tier | Separate aggregate dashboard — sees only tier + verified totals, never raw invoice data |

---

## 4. Tech stack — and why

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui | Fastest path to a professional-looking form + document preview UI within a month; shadcn gives accessible, pre-built components so the frontend person isn't hand-rolling forms |
| Backend | Python 3.11 + FastAPI | The calculation engine, factor lookups, and PDF rendering all benefit from Python's data-handling libraries; FastAPI gives typed request/response schemas for free, which matters because every agent boundary here needs a strict schema |
| LLM | Qwen models via Alibaba Cloud Model Studio (DashScope), OpenAI-compatible endpoint — Qwen-Plus for the writing agents (passport, financing report, advisory), Qwen3-VL-Flash for document intake (vision), Qwen-Flash for the CN code classifier | Splits cost/latency the same way as any tiered-model plan: a fast vision model for extraction, a fast text model for narrow classification, a stronger model for prose quality on the two report-writing agents and the advisory agent. Using the **Beijing region endpoint** keeps SME production data on domestic infrastructure, which resolves the cross-border data export concern noted in §10 — pin the region explicitly in config, don't leave it on the international/Singapore default. DashScope's OpenAI-compatible mode supports standard function calling, so the same forced-JSON-output pattern used throughout §8 works unchanged; only the client base_url, API key, and model name strings change from an Anthropic-style integration |
| Database + Auth + File storage | Supabase (managed Postgres + Storage + Auth) | One provider covers three infra needs with near-zero setup time — critical for a one-month build with no dedicated DevOps person |
| Document generation | WeasyPrint (Python, HTML/CSS → PDF) | Needs to render CJK characters cleanly for the bilingual passport and Chinese-only report; HTML/CSS templating is faster to iterate on than a binary PDF library, and the whole team can edit templates without touching Python logic |
| Optional IoT ingestion | ESP32 + EmonLib firmware → MQTT → lightweight Python subscriber writing into Supabase | Matches the original hardware concept; kept fully decoupled — if this component fails, nothing else in the system notices |
| Hosting | Vercel (frontend), Render (backend + MQTT subscriber worker), Supabase (managed) | All three have zero-config deploys from GitHub, which matters more than raw performance for a one-month build |
| Version control | GitHub, single monorepo (`/frontend`, `/backend`, `/firmware`, `/docs`) | Keeps the coding agent's context in one place |

**Explicitly rejected:** blockchain/ledger infra, ZK-proof libraries, any multi-agent orchestration framework (LangGraph/AutoGen/CrewAI) — the pipeline is a fixed, code-orchestrated sequence of API calls, not an autonomous agent system. Orchestration is plain Python function calls in FastAPI route handlers, nothing more.

---

## 5. System architecture

![Six-stage agent architecture diagram](assets/architecture-diagram.png)

Six-stage pipeline, code-orchestrated (no agent decides its own next step):

```
Stage 1 — Data intake
  ├─ Document intake agent (Claude Haiku, vision) — parses invoice/photo/CSV uploads
  └─ IoT sensor feed (optional, no LLM) — ESP32/EmonLib kWh readings, decoupled

Stage 1→2 gate: Intake validator (code, not LLM) — plausibility checks

Stage 2 — Validation and factor integration
  ├─ CN code classifier agent (Claude Haiku) — matches product to 1 of 8 supported codes
  └─ Factor lookup (deterministic code) — China GHG factor DB v2 + EU IR 2025/2621

Stage 3 — Calculation and threshold scoring
  ├─ Calculation engine (deterministic Python, no LLM) — CBAM tariff + electricity intensity
  └─ Threshold scoring agent (rule-based, not generative) — CISA grade E–A, CBAM benchmark gap, de minimis check

Stage 3 output forks in parallel:

Stage 4 — Export compliance                    Stage 5 — Green financing
  ├─ CBAM passport agent (Claude Sonnet)          ├─ Financing report agent (Claude Sonnet)
  └─ Output validator (code) — number match       └─ Program matcher (deterministic lookup)

Both converge into:

Stage 6 — Advisory
  ├─ Path cost ranker (deterministic) — cost per tCO2e closed, Path 1/2/3 framework
  └─ Advisory agent (Claude Sonnet) — writes prioritized action plan
```

**The non-negotiable design rule for the coding agent:** anything colored "deterministic" in the design above must never call an LLM. Anything that calls an LLM must never perform the final arithmetic on a regulated number — it may only read a number that deterministic code already computed and write prose around it. If an implementation detail forces this rule to be broken, stop and flag it rather than proceeding.

---

## 6. Data specification

### 6.1 Supported CN codes (MVP scope — do not expand without explicit sign-off)

| CN code | Description | Route(s) applicable |
|---|---|---|
| 7207 | Semi-finished steel billets | BF-BOF, DRI-EAF |
| 7208 10 00 | Hot-rolled coil (HRC) | BF-BOF |
| 7213 / 7214 | Hot-rolled bars / wire rod | BF-BOF, scrap-EAF |
| 7301 | Sheet piling, welded angles | downstream (any route) |
| 7302 | Railway track construction material | downstream (any route) |
| 7318 15 42 / 7318 15 88 | Bolts, screws | downstream (any route) |
| 7326 | Other steel articles / hardware | downstream (any route) |

Excluded explicitly: CN 7204 (ferrous scrap — not CBAM-applicable), any non-steel HS chapter.

### 6.2 Reference data sources (must be loaded before any calculation runs)

| Source | Used for | Status |
|---|---|---|
| China National GHG Emission Factor Database v2 (data.ncsc.org.cn/factories) | Default crude-steel carbon intensity by route when SME has no measured data | Real, public. **TODO before launch:** pull exact DRI-EAF and scrap-EAF values — only BF-BOF (3.506 tCO2e/t) is confirmed in this PRD |
| Commission Implementing Regulation (EU) 2025/2621 | EU free-allocation benchmarks (BF-BOF 1.370, DRI-EAF 0.481, scrap-EAF 0.072 tCO2e/t) and phase-in markup (10%/20%/30% for 2026/27/28+) | Real, confirmed |
| CISA (China Iron and Steel Association) 低碳排放钢 standard | Five-tier grading, E (baseline) through A (near-zero, aligned to IEA 2021 near-zero threshold) | Real, exists. **TODO before launch:** obtain exact tCO2e/tonne boundary for each tier — do not hardcode placeholder boundaries as final |
| Quzhou 碳账户金融 model | Four-tier (深绿/浅绿/黄/红) financing tier logic — up to 1.5x credit limit, 50–100bp rate discount for top tier | Real, publicly documented |
| National 零碳工厂 policy (工信部联节〔2026〕13号) | Real subsidy amounts — up to ¥2,000,000 national + ¥500,000–¥1,000,000 provincial/municipal matching | Real, confirmed |
| EU CBAM certificate price | Quarterly average, e.g. €75.36/tCO2e for Q1 2026 | Real, published quarterly — must be refreshed each quarter, do not hardcode as permanent |

### 6.3 Core database tables (Supabase/Postgres)

```
companies          (id, name, province, contact_info, created_at)
products           (id, company_id, cn_code, production_route, annual_export_tonnes)
submissions        (id, product_id, source_type[doc|iot], raw_input_ref, submitted_at)
intake_records     (id, submission_id, extracted_json, validator_status, validator_notes)
calculations       (id, submission_id, intensity_tco2e_per_tonne, data_source[measured|china_default],
                     benchmark_tco2e_per_tonne, taxable_emissions, tariff_cost_eur_per_tonne,
                     annual_exposure_eur, calculated_at)
scores             (id, calculation_id, cisa_grade, cbam_risk_tier, gap_to_next_tier_tco2e,
                     de_minimis_exempt boolean)
subsidy_matches    (id, score_id, program_name, amount_estimate, source_citation)
documents          (id, submission_id, doc_type[passport|financing_report], language,
                     content_hash, signature, generated_at, pdf_storage_path)
advisory_plans     (id, score_id, ranked_actions_json, generated_at)
iot_readings       (id, company_id, timestamp, voltage, current, kwh, ingested_at)  -- optional module
```

---

## 7. API contract (backend, FastAPI)

```
POST   /api/intake                  — upload document(s) or manual form data → intake_record
POST   /api/intake/validate         — run intake validator against an intake_record
POST   /api/classify                — CN code classifier agent → product.cn_code + confidence
POST   /api/calculate               — deterministic calculation engine → calculations row
POST   /api/score                   — threshold scoring → scores row
POST   /api/documents/passport      — CBAM passport agent + output validator → signed PDF
POST   /api/documents/financing     — financing report agent + program matcher → signed PDF
POST   /api/advisory                — path cost ranker + advisory agent → ranked action plan
GET    /api/submissions/{id}        — full submission state (all stages)
POST   /api/iot/ingest              — MQTT-subscriber-facing endpoint, writes iot_readings (optional module)
GET    /api/baowu/dashboard         — aggregate view: CISA tier + verified totals only, no raw data (stretch)
```

Every endpoint returns its stage's output plus a `sources` array citing which regulatory constant was used — this is a hard requirement, not a nice-to-have, since it's the core of the trust story.

---

## 8. Agent specifications

### 8.1 Document intake agent
- **Model:** Qwen3-VL-Flash (vision-enabled, Beijing region endpoint)
- **Input:** uploaded image(s)/PDF/CSV
- **Output schema (JSON, forced via tool use):**
```json
{
  "production_volume_tonnes": number,
  "fuel_type": string,
  "cn_code_hint": string | null,
  "billing_period": string,
  "confidence": "high" | "medium" | "low",
  "flags": string[]
}
```
- **Rule:** never allowed to output a final emissions number — extraction only.

### 8.2 Intake validator (code, not an LLM call)
- Checks: production volume within 10x of company's stated historical scale; unit consistency (tonnes vs kg); fuel type consistent with declared production route; flags anything outside plausible bounds for manual review rather than silently proceeding.

### 8.3 CN code classifier agent
- **Model:** Qwen-Flash
- **Input:** extracted product description + the fixed 8-code reference table (embedded in the prompt — no vector DB needed at this scale)
- **Output:** `{ "cn_code": string, "confidence": number }`
- **Rule:** confidence below a configurable threshold (suggest 0.7) routes to manual confirmation instead of auto-proceeding.

### 8.4 Factor lookup + calculation engine
- **No LLM.** Direct port of the reference implementation already validated in this project (`cbam_calculation_engine.py` — reuse it verbatim as the starting point; do not rewrite the formula logic from scratch).
- Every constant must carry an inline comment citing its regulatory source (see §6.2).

### 8.5 Threshold scoring
- **No LLM — pure comparison logic**, not generative. Compares `calculations.intensity_tco2e_per_tonne` against:
  - EU benchmark for the route → CBAM risk tier (exempt / exposed / high-exposure) + gap
  - CISA tier boundaries → grade E–A + gap to next tier up
  - 50-tonne de minimis threshold on `annual_export_tonnes`

### 8.6 CBAM passport agent
- **Model:** Qwen-Plus (verify bilingual EN/CN output quality in week 1 — Qwen is natively bilingual, but the English side of this specific document faces an EU customs reader, so run a native-English-speaker review pass on the first few generated passports before trusting the model's English prose unsupervised)
- **Input:** calculations + scores rows (never raw intake data — only already-validated numbers)
- **Output:** bilingual (EN primary, CN secondary) structured document per the field list in §9.1
- **Rule:** every numeric value in its output must exactly match a value from the calculations/scores tables — see output validator.

### 8.7 Output validator (code, not an LLM call)
- Extracts every number from the generated document text (regex-based), diffs against the source calculation/score row. Mismatch → regenerate that section, do not silently publish.

### 8.8 Financing report agent
- **Model:** Qwen-Plus, Chinese-only output
- **Input:** scores + subsidy_matches rows
- **Rule:** subsidy amounts must be pulled via structured tool call from `subsidy_matches`, never paraphrased freely — if it can't cite a program from that table, it doesn't mention a number.

### 8.9 Path cost ranker (code, not an LLM call)
- Ranks improvement paths (per the original three-path framework: heavy retrofit / market diversification / lightweight digital tools) by estimated cost per tCO2e of gap closed, using rough cost figures from the research (digital platform: ¥1,000–¥10,000; retrofit: ¥100,000+).

### 8.10 Advisory agent
- **Model:** Qwen-Plus
- **Input:** ranked paths from 8.9 + CBAM risk tier + financing tier
- **Output:** plain-language, 1–3 item prioritized action plan, explicitly favoring the cheapest path that closes the gap unless the gap is large enough that only a heavier fix works.

---

## 9. Document specifications

### 9.1 CBAM export passport (bilingual EN/CN, PDF)
Fields: company info, CN code + production route, verified/default intensity + data source disclosure, taxable emissions, tariff estimate (per-tonne and annual), certificate price + quarter used, de minimis status, anti-circumvention self-declaration, QR code linking to any public platform verification (e.g. 碳效码) if available, disclaimer line, content hash + signature.

### 9.2 Green financing readiness report (Chinese only, PDF)
Fields: CISA grade + gap to next tier, matched subsidy programs with amounts and citations, credit/rate implications (Quzhou-style tier logic), recommended next steps (from advisory agent), disclaimer line, content hash + signature.

### 9.3 Document integrity (no blockchain — see decision log §12)
Generate SHA-256 hash of final document content, sign with a backend-held private key, store hash + signature in the `documents` table. This is sufficient tamper-evidence for the trust story; do not build a distributed ledger.

---

## 10. Non-functional requirements

- **Disclaimer, verbatim on both documents:** "Generated using published default values and public regulatory benchmarks. Not a substitute for a licensed customs broker, tax advisor, or financial advisor."
- **Data segregation:** the Baowu-facing aggregate dashboard (§3, stretch feature) may only ever query `scores.cisa_grade` and `calculations.annual_exposure_eur` (aggregated) — it must never have read access to `intake_records.extracted_json` or any raw uploaded file. Enforce this at the database role level (separate Postgres role/RLS policy in Supabase), not just in application code.
- **Data sovereignty:** resolved by the model choice — all LLM calls route through DashScope's Beijing region endpoint, keeping SME production data on domestic infrastructure. Pin `base_url` to the Beijing endpoint explicitly in config (not the international/Singapore default) and note this in the deployment README so nobody accidentally reverts it during a later refactor.
- **No self-harm to gap tracking:** the advisory agent must never be given write access back to `calculations` or `scores` — it only reads. This prevents the pipeline from becoming a loop.

---

## 11. Build timeline (4 weeks)

| Week | Focus |
|---|---|
| 1 | Confirm CISA tier boundaries and remaining China factor DB values (flagged TODOs in §6.2); stand up Supabase schema; port `cbam_calculation_engine.py` into the FastAPI backend with tests reproducing the €177/tonne worked example |
| 2 | Build Stage 1–3 (intake agent, validator, classifier, factor lookup, calculation engine, threshold scoring); get one CN code end-to-end |
| 3 | Build Stage 4–6 (passport agent, financing agent, output validator, path ranker, advisory agent); frontend forms and document preview/download |
| 4 | Full pipeline across all 8 CN codes; rehearse the Haiyan bolt-manufacturer demo scenario end-to-end at least 3 times; record IoT sensor fallback video; polish deck |

## 12. Decision log (for the coding agent's context — do not re-litigate these without new information)

- **No ZK-proofs, no blockchain.** Both were considered and rejected — see §9.3 for the lightweight hash+signature alternative and its rationale.
- **No autonomous multi-agent framework.** Pipeline is fixed and code-orchestrated.
- **Bilingual only on the CBAM passport, not the financing report** — different audiences, no reason to translate a document only Chinese banks will read.
- **CBAM passport and financing report are separate agents run in parallel**, not one combined "report agent" — different audiences, different failure isolation.
- **LLM provider is Qwen (DashScope), not Anthropic** — chosen specifically to keep SME data on domestic (Beijing region) infrastructure, resolving the data sovereignty flag from an earlier draft. DashScope's OpenAI-compatible mode means the agent code should be written against the OpenAI Python SDK interface (client base_url + api_key swap) rather than any provider-specific SDK, so a future multi-provider fallback stays cheap if needed.
- **IoT sensor feed is decoupled and optional** — feeds only the financing report's electricity-intensity score, never the CBAM passport number (steel is an Annex II good; only direct emissions are priced for iron and steel, per current CBAM rules).

---

## 13. Sources cited in this document

- China National GHG Emission Factor Database v2 — data.ncsc.org.cn/factories
- Commission Implementing Regulation (EU) 2025/2621
- CISA 低碳排放钢 grading standard (E–A tiers)
- 中国钢铁工业协会 low-carbon steel standard reporting, csteelnews.com
- Quzhou carbon-account financial model (碳账户金融)
- 工信部联节〔2026〕13号 — 零碳工厂建设工作指导意见
- 界面新闻, "紧固件出口欧洲的'碳'路先锋" — CBAM fastener industry cost analysis and head-vs-long-tail company data
