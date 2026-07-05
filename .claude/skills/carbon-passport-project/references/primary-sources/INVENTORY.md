# Knowledge base inventory — primary sources for the coding agent

This is a status-tracked list of every real, authoritative document the coding
agent should have on hand — not my paraphrase of them, the actual documents.
Bundle the ✅ items directly into `references/primary-sources/`. The ⚠️ items
need someone on the team to fetch them (reasons noted). Do not let the coding
agent proceed to build the CBAM passport or financing report field schemas
without at least the ✅ items in context.

---

## ✅ Already fetched and verified in this project

### 1. EU Guidance Document on CBAM Implementation for Installation Operators Outside the EU
- **What it is**: the EU's own guidance written specifically for producers like your
  target SME — not for EU importers, for *you*. This is the single most
  load-bearing document in this list.
- **Why it matters**: Section 6.11 ("Reporting template") and Annex IV define
  the exact minimum data fields a non-EU operator must be able to provide to
  an EU importer. **Your CBAM passport agent's output schema (PRD §9.1) should
  mirror Annex IV's field list directly, not be invented from scratch.**
- **Status**: fetched in full; saved as `cbam-installation-operator-guidance-EN.pdf` reference
- **Important caveat**: this specific version (8 Dec 2023) covers the
  *transitional period* (2023–2025) methodology and concepts. It is still the
  right document for concepts, system boundaries, and the Annex IV field
  structure — but do not pull benchmark numbers or markup percentages from it;
  those come from the 2025 Implementing Regulations already in PRD §6.2.
  **Action for week 1**: check taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en
  for a definitive-period-updated version of this same guidance document.
- **Chinese version**: confirmed to exist (the EU publishes this guidance in
  Arabic, Chinese, Hindi, Japanese, Korean, Turkish, Ukrainian). **Action**:
  download the Chinese version specifically — it's the one your actual SME
  users would read if they went looking themselves, and it's the best
  cross-check for your Chinese-language UI copy and the financing report's
  terminology.
- **URL**: https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism/cbam-legislation-and-guidance_en
  (look for the language selector on the guidance document page)

### 2. Iron and Steel sector CN code table (Annex I to Regulation 2023/956, via the guidance doc §5.6)
- **What it is**: the official CN code list and descriptions for the iron and
  steel sector specifically, as reproduced in the guidance document.
- **Why it matters**: your 8-code list in PRD §6.1 should be checked word-for-word
  against this table's official product descriptions, not against secondary
  sources (industry blogs, consultancy summaries).
- **Status**: the guidance document (item 1) contains this at section 5.6 —
  extract it directly rather than re-fetching a different source.

---

## ⚠️ Needed but not yet in hand — assign to a team member

### 3. The actual CBAM Communication Template (Excel file)
- **What it is**: the EU's own Excel template that non-EU operators use to
  communicate embedded emissions to EU importers, referenced throughout the
  guidance document (§6.11, footnote references).
- **Why it matters**: this is the *actual form your EU customer will ask your
  SME user to fill in eventually*. Your CBAM passport should either mirror
  its exact field layout or explicitly map onto it — this removes any
  guesswork about "what does the EU importer actually need from us."
  **This is arguably higher priority than item 1** if you only have time for one.
- **Where to get it**: taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en,
  under the guidance/templates section — look for the Excel-based template
  and the accompanying filled example templates (provided per sector,
  including iron & steel).
- **Assign to**: whoever owns the CBAM passport agent (§8.6)

### 4. EU IR 2025/2621 default values (the actual Excel annex, not the secondary reporting of it)
- **What it is**: the legally binding default values and benchmarks — we've
  been citing numbers *about* this regulation (1.370, 0.481, 0.072 tCO2e/t)
  from secondary sources (industry press). The regulation's own Excel annex
  is the authoritative version.
- **Why it matters**: every number in `calculation_engine.py` traces back to
  this file. If a secondary source made a transcription error, it propagates
  into every passport you generate.
- **Where to get it**: taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism/cbam-legislation-and-guidance_en,
  Commission Implementing Regulation (EU) 2025/2621 — an Excel file is
  provided alongside the legal text "for information purposes only."
- **Assign to**: whoever owns the calculation engine (§8.4)

### 5. China National GHG Emission Factor Database v2 — the DRI-EAF and scrap-EAF values
- **What it is**: this is a live query portal (data.ncsc.org.cn/factories),
  not a single downloadable file. Confirmed the crude-steel BF-BOF intensity
  is in there; the DRI-EAF and scrap-EAF placeholders in
  `calculation_engine.py` still need pulling from this portal directly.
- **Why it matters**: these are the two open TODOs already flagged in PRD §6.2 —
  this inventory doesn't add new information, it's the reminder to actually
  do it, since it can't be fetched by search/browse the way a static PDF can.
- **Assign to**: whoever owns the calculation engine, week 1

### 6. CISA 低碳排放钢 standard — exact tier boundary values (E through A)
- **What it is**: the actual China Iron and Steel Association standard
  document defining the five carbon-efficiency tiers.
- **Status**: existence confirmed via secondary industry reporting
  (csteelnews.com), but the standard document itself may sit behind a CISA
  membership/purchase paywall — could not confirm free public access.
- **Fallback if unobtainable in time**: BHP's own case study (already in this
  project's context) cites a real, citable anchor point for the *top* tier:
  IEA's near-zero threshold of 0.40 tCO2e per tonne of crude steel for
  100%-ore-based production, as implemented in ResponsibleSteel's
  International Standard V2.0 (performance level 4, "near zero"). Use this
  as the Grade-A boundary if the CISA document itself can't be obtained
  before launch, and mark it clearly in code as a substitute source until
  CISA's exact figures are confirmed.
- **Assign to**: whoever owns the threshold scoring agent (§8.5) — this is
  the single highest-risk unresolved number in the whole project; escalate
  early if it's not resolved by end of week 1.

### 7. Quzhou 碳账户金融 policy and 工信部联节〔2026〕13号 (零碳工厂 policy)
- **What they are**: the original government policy notices behind the
  financing tier logic and subsidy amounts cited in PRD §6.2 and §9.2.
- **Why it matters**: right now these numbers come from secondary reporting
  (news articles, industry blogs) that quoted the policy. The financing
  report's credibility depends on citing the primary government notice, not
  a summary of it.
- **Where to get them**: search 工业和信息化部 (MIIT) official site for
  文号 工信部联节〔2026〕13号; search 衢州市人民政府 or 浙江省地方金融监督管理局
  for the original 碳账户金融 policy documents.
- **Assign to**: whoever owns the program matcher (§8.8) and financing report agent

---

## How to use this inventory

Drop item 1's PDF and this inventory file into
`carbon-passport-project/references/primary-sources/`. When any team member
starts a session on the passport schema, calculation engine, or financing
report, point them at this file first — it tells them exactly which numbers
are already verified against a primary source and which are still resting on
secondary reporting, so nobody accidentally treats a news article's citation
of a regulation as equivalent to the regulation itself.
