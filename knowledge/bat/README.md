# Advisory KB — steel-factory surface treatment (STM BREF extract)

Curated, classified knowledge base for the CBAM Graph RAG / advisory agent
(PRD §8.10). Source: European Commission JRC, *Best Available Techniques (BAT)
Reference Document for the Surface Treatment of Metals and Plastics* (STM
BREF), **Draft 1, February 2025**.

Wired into the NetworkX Graph RAG ontology as the `bat` layer (replacing the
former 十五五 policy nodes). Markdown files stay here as citation sources;
ontology nodes point at these paths via `source_file` — **never** read BAT
numbers into tCO₂e / tariff / CISA / subsidy arithmetic.

See [carbon-passport-project SKILL.md](../../.claude/skills/carbon-passport-project/SKILL.md).

## Classification

| Folder | Steel relevance | Source (STM BREF Draft 1) |
|---|---|---|
| `pretreatment_pickling_descaling/` | Pickling, descaling, degreasing, drag-out/rinsing — universal first step before any steel surface treatment | Ch.2.1.4–2.1.6 |
| `zinc_chromium_plating_fasteners/` | Chromium plating, chromium conversion coatings, zinc/zinc-alloy plating — core corrosion protection for bolts/fasteners/structural steel (jig/barrel) | Ch.2.2.1.3–2.2.1.5 |
| `continuous_steel_coil_coating/` | Continuous steel coil coating — relevant when SME steel input comes pre-coated from Baowu/Ansteel | Ch.2.4 / Ch.3.3 |
| `steel_enamelling/` | Porcelain (vitreous) enamelling of steel | Ch.2.8.3.3.1 |
| `cross_cutting_bat/` | EMS, monitoring, energy, decarbonisation, water, materials, **Cr(VI) substitution**, air, wastewater, residues | Ch.4.1–4.2 |
| `bat_electroplating_chemical_plating/` | BAT for electroplating/chemical plating (material efficiency, drag-out, air abatement) | Ch.4.3.1 |

## Graph RAG mapping

| Ontology node id | Markdown |
|---|---|
| `bat_stm_bref_root` | `README.md` |
| `bat_pretreatment_pickling` | `pretreatment_pickling_descaling/...` |
| `bat_zinc_chromium_plating` | `zinc_chromium_plating_fasteners/...` |
| `bat_continuous_coil_coating` | `continuous_steel_coil_coating/...` |
| `bat_steel_enamelling` | `steel_enamelling/...` |
| `bat_cross_cutting_*` | `cross_cutting_bat/01–05` |
| `bat_electroplating_specific` | `bat_electroplating_chemical_plating/...` |

Stage-3 scoring marking rubrics live as `rubric_*` nodes in
`backend/app/services/graph_rag/ontology.py` (PRD §8.5), not in this folder.
