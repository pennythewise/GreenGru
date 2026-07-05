# CLAUDE.md

Steel SME Carbon Passport — a CBAM export passport and green financing
readiness report for Chinese steel-downstream SMEs, distributed through
Baowu/Ansteel as an anchor-enterprise service. One-month hackathon MVP.

**Before touching any code, prompt, schema, or document template in this
repo, read the `carbon-passport-project` skill** (`.claude/skills/carbon-passport-project/SKILL.md`).
It has the non-negotiable build rules, locked scope, and rejected
alternatives — most "obvious improvements" here were already considered and
turned down for a stated reason. See [PRD.md](PRD.md) for the full product
requirements doc.

## Monorepo layout

- `frontend/` — Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui
- `backend/` — Python 3.11 + FastAPI
- `firmware/` — ESP32/EmonLib stub (optional, decoupled — see skill for why)
- `.claude/skills/carbon-passport-project/` — project skill: SKILL.md, PRD,
  calculation engine reference, and primary-source inventory

## The one rule that matters most

Deterministic code computes every regulated number (tCO2e, tariff estimate,
CISA grade, subsidy amount). LLM agents only read numbers already computed
and write prose or classify around them — never the reverse.

## Known open TODOs

1. DRI-EAF and scrap-EAF China GHG factor DB values — only BF-BOF
   (3.506 tCO2e/t) is confirmed.
2. CISA low-carbon-steel tier boundaries (E through A) — not yet obtained.

Do not hardcode placeholders for either as if final.
