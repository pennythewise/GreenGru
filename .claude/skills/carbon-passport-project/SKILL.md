---
name: carbon-passport-project
description: >
  Project context and non-negotiable build rules for the Steel SME Carbon Passport
  hackathon project — a CBAM export passport and green financing readiness report
  for Chinese steel-downstream SMEs (bolt/fastener/structural-steel manufacturers),
  distributed through Baowu/Ansteel as an anchor-enterprise service. ALWAYS consult
  this skill before writing or modifying any code, prompt, schema, or document
  template in this repo — backend, frontend, calculation engine, agent prompts, PDF
  templates, or pitch material. Trigger on any mention of CBAM, carbon passport,
  Baowu, Ansteel, threshold scoring, CN code, CISA grade, or any of the six
  pipeline stages (intake, validation, calculation, export compliance, green
  financing, advisory). This skill exists specifically so implementation stays
  consistent with the approved architecture and scope across many separate coding
  sessions — read it even for small, seemingly self-contained tasks.
---

# Steel SME Carbon Passport — project skill

Full detail lives in `references/PRD.md` — read it before starting any non-trivial
task. This file is the fast-reference version: the rules that must never be
silently violated, even by a well-intentioned refactor.

## The one rule that matters most

**Deterministic code computes every regulated number. LLM agents only read
numbers that deterministic code already computed, and write prose or classify
around them.** If you find yourself about to let an LLM call produce or modify a
tariff estimate, a tCO2e value, a CISA grade, or a subsidy amount — stop. That
number belongs in `references/calculation_engine.py` or its threshold-scoring
equivalent, not in a prompt completion. This is the entire trust story for the
product; breaking it anywhere breaks the pitch.

## Locked scope — do not expand without explicit sign-off

- Exactly 8 CN codes (7207, 7208 10 00, 7213/7214, 7301, 7302, 7318 15 42,
  7318 15 88, 7326). See PRD §6.1 for the full table. Do not add aluminum,
  cement, fertilizer, hydrogen, or electricity CBAM sectors.
- Bilingual (EN+CN) output only on the CBAM passport. The financing report is
  Chinese-only — don't "helpfully" add English to it.
- CBAM passport agent and financing report agent are separate agents that run
  in parallel off the same threshold-scoring output. Do not merge them back
  into one "report agent."
- The IoT sensor feed (if built) is optional and decoupled — it feeds only the
  financing report's electricity-intensity score, never the CBAM passport
  number. Steel is a CBAM Annex II good: only direct emissions are priced for
  iron and steel, so electricity data has no legitimate path into the CBAM
  tariff calculation. If a task seems to require it, that's a sign of a scope
  misunderstanding — check PRD §12 before proceeding.
- No ZK-proofs. No blockchain. No autonomous/self-planning multi-agent
  framework. The pipeline is a fixed, code-orchestrated sequence — see PRD §5
  and §12 for why each of these was explicitly rejected, so nobody re-opens
  the debate mid-build under deadline pressure.

## Tech stack (see PRD §4 for full rationale)

- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui
- Backend: Python 3.11 + FastAPI
- LLM: Qwen via Alibaba Cloud Model Studio (DashScope), OpenAI-compatible
  endpoint, **Beijing region pinned explicitly** — this is load-bearing for
  data sovereignty, not a default to leave unset. Qwen3-VL-Flash for intake,
  Qwen-Flash for CN code classification (single escalation retry to Qwen-Plus
  on low confidence — the only model-escalation path in the system),
  Qwen-Plus for the three writing agents. Qwen-Max is deliberately unused;
  disable thinking mode on every call. See PRD §4.1 before changing any
  model assignment.
- Optional Stage-0 pre-processing: local ModelScope models (DAMO OCR +
  StructBERT zero-shot doc-type pre-screen), feature-flagged, never in the
  trust path, pipeline must run with them disabled. RaNER, CSANMT
  translation, and self-hosted LLMs were evaluated and rejected — PRD §4.2.
- DB/Auth/Storage: Supabase
- PDF generation: WeasyPrint (HTML/CSS → PDF, for clean CJK rendering)
- Write agent integration code against the OpenAI-compatible client interface,
  not a DashScope-specific SDK, so a provider swap later stays cheap.

## Two known open TODOs — do not hardcode placeholder values as if final

1. Exact CISA low-carbon-steel tier boundaries (E through A) — only the
   BF-BOF China-default intensity (3.506 tCO2e/t) is confirmed in the PRD.
2. DRI-EAF and scrap-EAF China factor database values — placeholders in
   `calculation_engine.py` are marked as such in code comments. Replace them
   from the real database before treating any output as launch-ready.

## When starting a new session on this repo

1. Read `references/PRD.md` in full if this is your first time touching a
   given stage (§5 architecture, §8 agent specs, §9 document specs).
2. Re-use `references/calculation_engine.py` verbatim as the starting point
   for the calculation engine — do not rewrite the formula logic from memory.
3. Check `references/PRD.md` §12 (decision log) before proposing any
   architectural change — most "obvious improvements" (blockchain, ZK,
   combining the two report agents, adding more CN codes) were already
   considered and rejected for a stated reason.
4. Before building the CBAM passport agent's output schema or the
   calculation engine's constants, read
   `references/primary-sources/INVENTORY.md` — it tracks which numbers are
   verified against an actual regulation/guidance document versus which are
   still resting on secondary reporting, and lists exactly what's still
   missing (with who should fetch it).
