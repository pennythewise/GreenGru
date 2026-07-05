---
name: project-carbon-passport
description: Core context for the Steel SME Carbon Passport hackathon project — locked scope, tech stack, monorepo layout, open TODOs, and rejected alternatives.
metadata:
  type: project
---

Steel SME Carbon Passport for Chinese downstream SMEs (bolt/fastener/structural-steel manufacturers). Distributed through Baowu/Ansteel. One-month hackathon MVP.

**Monorepo root:** `/Users/penny/Desktop/GreenGru/`
- `frontend/` — Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui (scaffolded)
- `backend/` — Python 3.11 + FastAPI (scaffolded, no implementation yet)
- `firmware/` — ESP32/EmonLib stub (optional, decoupled)
- `CLAUDE.md` — root instructions pointing to the skill; `PRD.md` — thin pointer to the canonical PRD
- `.claude/skills/carbon-passport-project/` — project skill (SKILL.md + `references/` holding PRD.md,
  calculation_engine.py, and primary-sources/). Single canonical copy — the old `docs/` folder was
  removed 2026-07-06 (byte-for-byte duplicate). The packaged `carbon-passport-project.skill` zip is
  gitignored, not tracked.

**LLM provider:** Qwen via DashScope (Alibaba Cloud Model Studio), OpenAI-compatible. Beijing region endpoint — data sovereignty requirement, NOT a default to leave unset.

**Two open TODOs (do not hardcode placeholders as final):**
1. DRI-EAF and scrap-EAF China GHG factor DB values — only BF-BOF (3.506 tCO2e/t) confirmed.
2. CISA 低碳排放钢 tier boundaries (E through A) — exact tCO2e/t per tier not yet obtained.

**Why:** both were explicitly flagged in PRD §6.2 and INVENTORY.md — week 1 task is to resolve them before treating output as launch-ready.

**Three rejected alternatives (do not re-open):**
1. ZK-proofs / blockchain — rejected; hash+signature in `documents` table is sufficient.
2. Autonomous multi-agent framework (LangGraph/AutoGen/CrewAI) — rejected; pipeline is fixed, code-orchestrated.
3. Bilingual financing report — rejected; financing report is Chinese-only (different audience than CBAM passport).
