# EU Guidance Document on CBAM Implementation for Installation Operators Outside the EU
Source: European Commission, Directorate-General for Taxation and Customs Union
Document date: 8 December 2023 (transitional-period edition — see caveat below)
Full document (local): `cbam-installation-operator-guidance-EN.pdf` (21 Nov 2023 edition)
Official URL: https://taxation-customs.ec.europa.eu/system/files/2023-12/Guidance%20document%20on%20CBAM%20implementation%20for%20installation%20operators%20outside%20the%20EU.pdf

**Product wiring**: passport Stage 3 Score uses a deterministic readiness scorer
(`backend/app/services/cbam_operator_scorer.py`) mapped to Quick Guide §3,
Monitoring §6, and Iron & Steel §5.6/§7.2 — UI mirrors grant Stage 3.

## Provenance — read this before trusting anything below
This file was built from an **actual PDF text extraction** (web_fetch with
PDF text extraction enabled), not from memory or inference. A first fetch
attempt on this same URL failed silently (returned only the URL string, no
real content) and an earlier version of this file was mistakenly written from
recalled/inferred knowledge of the document rather than verified text —
that version has been deleted and replaced with this one. Treat any other
reference file in this project the same way: if it doesn't say "extracted
via web_fetch on [date]," verify it before relying on it for a specific
number, page reference, or field name.

**Coverage of this extraction**: confirmed, real text for Sections 1–5.5
(Summary, Introduction, Quick Guide for Operators, CBAM overview and
transitional-period rules, Cement/Hydrogen/Fertilizer sector detail). The
fetch was cut off before reaching **Section 5.6 (Iron and Steel)** and
**Section 7.2 (Iron and Steel worked examples)** — the sections that matter
most to this project. **Action: fetch pages covering Section 5.6 (starts
p.52) and Section 7.2 (starts p.180) specifically before building the
calculation engine or passport schema against this document.**

**Transitional vs. definitive period**: this document (Dec 2023) governs the
2023–2025 transitional period. It is still correct for concepts, definitions,
and the Annex IV/communication-template field structure — but do NOT pull
2026+ benchmark numbers, markup percentages, or certificate prices from it;
those live in the 2025 Implementing Regulations already cited in PRD §6.2.
Also check for a definitive-period-updated version of this same guidance on
the EU's CBAM legislation page before final launch.

---

## Verified real content

### Document structure (real table of contents, with real page numbers)
1 Summary (p.7) — 2 Introduction (p.8) — 3 Quick guide for operators (p.12)
— 4 The Carbon Border Adjustment Mechanism (p.20) — 5 CBAM goods and
production routes (p.31; **5.6 Iron and Steel, p.52**) — 6 Monitoring and
reporting obligations (p.82; **6.11 Reporting template, p.163**) — 7 Sector
specific monitoring and reporting (p.168; **7.2 Iron and Steel, p.180**) —
8 Exemptions (p.227) — Annex A Abbreviations (p.228) — Annex B Definitions
(p.230) — Annex C Biomass (p.238) — Annex D Standard values for emission
calculations (p.246)

### Key verified definitions (Section 4.2 — quote these, don't paraphrase from memory)
- **Embedded emissions**: "emissions released during the production of goods,
  including the embedded emissions of relevant precursor materials consumed
  in the production process."
- **Direct emissions**: "emissions from the production processes of goods,
  including emissions from the production of heating and cooling consumed
  during the production processes, regardless of the location."
- **Indirect emissions**: "emissions from the production of electricity,
  which is consumed during the production processes of goods."
- **Specific embedded emissions**: "the embedded emissions of one tonne of
  goods, expressed as tonnes of CO2e emissions per tonne of goods" — this is
  exactly the unit `calculation_engine.py` computes.
- **Simple goods**: produced using exclusively input materials and fuels
  with zero embedded emissions. **Complex goods**: everything else (steel
  from iron ore + coking coal is a complex good).
- Confirmed: "only direct emissions are relevant for electricity imported
  into the EU as a good in its own right" — supports the PRD decision log's
  note that steel is treated on a direct-emissions-only (Annex II) basis.

### The actual governance/reporting workflow (Section 4.3.4, Figure 4-1)
This is the real sequence your SME users are already living through, per
your own market research:
1. EU importer receives CBAM goods from installations outside the EU.
2. Importer lodges the customs declaration; customs clears the import.
3. Customs authority informs the European Commission via the CBAM Registry.
4. **The importer requests embedded-emissions data from the operator**
   (sometimes via intermediary traders) — this is the exact request event
   your product exists to make painless. The operator replies, "if possible,
   using the template provided for this purpose by the Commission."
5. Importer submits the quarterly/annual CBAM report.
6. Commission cross-checks against customs data; penalties flow through
   national competent authorities if there's a mismatch.

### Reporting period rules (Section 4.3.3 — relevant to the intake agent's assumptions)
- Default operator reporting period: 12 months, calendar year by default,
  fiscal year allowed if justified.
- A shorter period (minimum 3 months) is allowed if it aligns with an
  existing carbon-pricing or MRV scheme's own reporting cycle — relevant if
  an SME is already inside a domestic scheme (e.g. national ETS pilot).

### On the Communication Template (Section 3, "Quick guide for operators")
Confirmed direct quote: "The template can be found on the European
Commission's dedicated website for the CBAM. It has been designed based on
the rules set out in Annex IV to the Implementing Regulation on the content
of the recommended communication from operators of installations to
reporting declarants." This confirms INVENTORY.md item 3 (get the actual
Excel template) is the right next action — this guidance document describes
the template's existence and purpose but the template itself is a separate
file.

### Icon legend used throughout the source document (useful if quoting figures/diagrams later)
The source uses icons to flag: information of particular importance to
operators; simplified approaches; recommended improvements; pointers to
other documents/templates/tools; worked examples; and sections specific to
the definitive period rather than the transitional period. Note this if
anyone screenshots pages from the source PDF directly.

---

## Not yet verified — do not build against these without the follow-up fetch
- Section 5.6 (Iron and Steel goods/production routes) — CN codes and
  production-route definitions specific to steel, in the Commission's own
  words rather than secondary industry reporting.
- Section 7.2 (Iron and Steel worked examples) — includes a worked example
  "for the making of steel products from purchased precursors" per the
  version history, directly relevant to how our SME's use of Baowu-sourced
  billet/coil as a precursor should be modeled.
- Annex D (Standard values for emission calculations, p.246) — per the
  version history, an earlier Annex on Default Values was deleted from this
  document "as this information can be found on the European Commission's
  dedicated website for the CBAM" — meaning Annex D is NOT where the actual
  numbers live; confirms PRD §6.2's approach of sourcing defaults from the
  dedicated CBAM website / IR 2025/2621 rather than this guidance document.
