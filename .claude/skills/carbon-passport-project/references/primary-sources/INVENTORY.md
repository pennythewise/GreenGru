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

### 3. CBAM 2026 definitive-period mechanics (declarant obligations, phase-in factor)
- **What it is**: confirmation, from multiple independent 2026 sources including a
  European Parliament research-service (EPRS) briefing PDF and the European
  Commission's own CBAM guidance/Q&A pages, of exactly how the definitive
  period (from 1 Jan 2026) works: (a) it is the EU *importer* — via an
  EU-established indirect customs representative if the importer itself is
  non-EU — who must hold Authorized CBAM Declarant status, never the non-EU
  exporter directly; (b) the number of certificates payable is reduced by a
  "CBAM factor" that mirrors the EU ETS free-allocation phase-out: **2.5%
  (2026), 5% (2027), 10% (2028), 22.5% (2029), 48.5% (2030), 61% (2031),
  73.5% (2032), 86% (2033), 100% (2034+)**, per Regulation (EU) 2023/956
  Art. 31(3) and Directive 2003/87/EC Art. 10a(1a).
- **Why it matters**: (b) was **completely missing from `calculation_engine.py`**
  before this research pass — the engine was charging the full un-phased-in
  taxable emissions every year, overstating 2026-2033 tariff costs by
  roughly 10-40x. Fixed in `calculation_engine.py` (see `CBAM_PHASE_IN_FACTOR_BY_YEAR`
  and the new `gross_tariff_cost_eur_per_tonne` field) — this inventory
  entry is the paper trail for why that field exists.
- **Status**: mechanism and percentages corroborated across three independent
  secondary sources that all cite the same primary legal basis, but **not
  yet cross-checked against the delegated act's own formula text** (the
  free-allocation-equivalent calculation methodology referenced by Art.
  31(4)). Do not treat the exact percentages as immune from a future
  correction until that primary text is obtained.
- **Where to get it**: search for the Commission Delegated Regulation
  supplementing Regulation (EU) 2023/956 on the calculation of the
  free-allocation-equivalent (referenced from Art. 31(4)); cross-check
  against the EPRS briefing at europarl.europa.eu (RegData/etudes/BRIE/2026/789377).
- **Assign to**: whoever owns the calculation engine (§8.4) — same owner as
  item 8 below, do both in the same pass since they're both about the
  legally-binding numbers in `calculation_engine.py`.

### 4. China steel export VAT rebate cancellation (2021)
- **What it is**: 财政部 税务总局公告2021年第16号 (effective 1 May 2021, 146
  steel tariff codes) and 公告2021年第25号 (effective 1 Aug 2021, 23 more
  codes) — together cancelling export VAT rebates on 169 steel product
  tariff codes. CN 7302 (railway track material, tariff line 73021000) is
  confirmed present on the second announcement's own published list.
- **Why it matters**: this is real, load-bearing context for the problem
  statement (§1) — an SME on one of these codes is already absorbing a lost
  ~13% VAT rebate before CBAM enters the picture, which strengthens (and
  should inform the tone of) the advisory agent's framing of urgency.
- **Status**: the two announcements themselves are confirmed real and dated
  (gov.cn, mof.gov.cn primary sources), and CN 7302's presence on the
  second list is confirmed via a reproduced list (dxtax.com). **The other 7
  of this project's 8 CN codes have NOT been individually checked against
  the full 169-code annex** — do not assume they are or aren't affected
  without checking the actual PDF annexes.
- **Where to get it**: the full annexes are linked as PDF attachments from
  szs.mof.gov.cn/zhengcefabu/202104/t20210428_3694213.htm (16号) and
  gov.cn/zhengce/zhengceku/2021-07/29/content_5628266.htm (25号).
- **Assign to**: whoever owns the problem-statement/pitch material and the
  advisory agent (§8.10) — this is narrative context, not a calculation
  engine input, so it doesn't block the engine.

### 5. PBOC 碳减排支持工具 (Carbon Emission Reduction Facility) 2026 expansion
- **What it is**: the People's Bank of China's carbon-reduction refinancing
  facility (est. Nov 2021), which as of a Jan 2026 policy briefing (PBOC
  Deputy Governor 邹澜, reported via finance.sina.com.cn) explicitly expanded
  its covered project types to include 节能改造/绿色升级/能源绿色低碳转型 —
  directly applicable to a steel SME's decarbonization retrofit capex.
- **Why it matters**: this is a real, current, citable subsidy_matches
  candidate beyond the two already in PRD §6.2 (Quzhou tier logic, 零碳工厂
  subsidy) — the financing report agent's program matcher should be able to
  surface this for any SME whose advisory plan includes a retrofit path.
- **Status**: confirmed via a Chinese financial news report of an official
  PBOC briefing (secondary reporting of a primary announcement, not the
  PBOC's own policy document text).
- **Where to get the primary text**: PBOC official site (pbc.gov.cn),
  search 碳减排支持工具 for the original policy document and its 2026
  amendment/expansion notice.
- **Assign to**: whoever owns the program matcher (§8.8)

### 6. 中小微企业贷款贴息政策 (2026 SME loan interest subsidy)
- **What it is**: a State Council/Ministry of Finance notice (关于实施中小微
  企业贷款贴息政策的通知), effective for qualifying loans issued from 1 Jan
  2026: a 1.5-percentage-point annual interest subsidy from central finance,
  up to 2 years, capped at ¥50,000,000 loan principal per borrower, covering
  several industry chains including 节能环保服务 (energy-saving/environmental
  services).
- **Why it matters**: another real, current, citable subsidy_matches
  candidate — this one is a general SME financing-cost reducer rather than
  green-specific, so the program matcher needs a rule for whether/how to
  surface a non-green-specific-but-eligible program alongside green-specific
  ones (recommend: only surface it if the SME's industry chain is explicitly
  listed as eligible, and label it clearly as "general SME," not "green,"
  in the financing report so it isn't mistaken for climate-specific credit).
- **Status**: primary source is the State Council's own document repository
  (gov.cn/zhengce/zhengceku), which is about as authoritative as a secondary
  fetch gets short of the original PDF/red-header document scan.
- **Assign to**: whoever owns the program matcher (§8.8)

### 10. CISA 低碳排放钢 standard — tier boundary formula and values (E through A)
- **What it is**: CISA's own draft standard — 钢协科〔2024〕32号, the public-
  comment draft of T/CISA 452《低碳排放钢评价方法》(chinaisa.org.cn, draft
  dated 2024-07-29, comment period closed 2024-08-30). Previously assumed to
  sit behind a membership/purchase paywall; it doesn't — it's posted on
  CISA's own public site as the comment-period draft.
- **What it contains**: not a flat per-grade cutoff, but a formula —
  `y_n = a_n - b_n × scrap_ratio + α_n` — where `a_n`/`b_n` (Table 1) define
  a crude-steel-stage boundary linear in scrap ratio, and `α_n` (Table 2) is
  a hot-rolled-product-specific add-on (separate columns for hot coil,
  plate, bar/wire rod, seamless tube; ore-based vs scrap-based). Now
  implemented in `backend/app/data/cisa_tiers.py`, using the 线棒材
  (bar/wire rod) column since this project's 8 CN codes are downstream of
  that category.
- **Important caveat — still not fully closed**: this is the **comment
  draft**, not the finalized text. CISA published the finalized T/CISA
  452-2024 on 2024-10-17; the numbers above have NOT been individually
  cross-checked against that finalized version. `is_provisional=True` stays
  on every score produced from this table until that cross-check happens —
  do not remove the provisional flag from any UI surface on the strength of
  this entry alone.
- **Assign to**: whoever owns the threshold scoring agent (§8.5) — next step
  is confirming the finalized T/CISA 452-2024 text matches this draft
  (or obtaining it if it doesn't), not re-deriving the formula from scratch.

---

## ⚠️ Needed but not yet in hand — assign to a team member

### 7. The actual CBAM Communication Template (Excel file)
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

### 8. EU IR 2025/2621 default values (the actual Excel annex, not the secondary reporting of it)
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

### 9. China National GHG Emission Factor Database v2 — the DRI-EAF and scrap-EAF values
- **What it is**: this is a live query portal (data.ncsc.org.cn/factories),
  not a single downloadable file. Confirmed the crude-steel BF-BOF intensity
  is in there; the DRI-EAF and scrap-EAF placeholders in
  `calculation_engine.py` still need pulling from this portal directly.
- **Partial progress (still not the actual China-specific route average)**:
  two things were found by search that improve on the old un-sourced
  1.9 / 0.6 guesses, but neither one *is* the missing number:
  1. worldsteel's Sustainability Indicators Report 2024 (worldsteel.org)
     gives global production-weighted averages — DRI-EAF 1.47 tCO2/t,
     scrap-EAF 0.69 tCO2/t. Now wired into `calculation_engine.py` as the
     interim default, explicitly flagged in-code as a global (not
     China-specific) proxy that likely *understates* the true China figure,
     since China's grid is more carbon-intensive than the global blend
     worldsteel uses.
  2. MEE's own steel-industry GHG accounting guideline (全国碳排放权交易
     市场技术规范 CETS—AG—03.01—V01—2024, mee.gov.cn) gives official
     process-emission factors for EAF input materials — DRI 0.073 tCO2/t,
     scrap 0.037 tCO2/t, electrode 3.663 tCO2/t (Appendix A.2) — real and
     China-specific, but only the *carbon-content-of-the-input* piece of a
     route intensity, not a full route average. Building a defensible
     bottom-up China number from these still needs electricity/fuel
     consumption-per-tonne assumptions that aren't in that document either.
- **Why it matters**: these are the two open TODOs already flagged in PRD §6.2 —
  this inventory doesn't add new information, it's the reminder to actually
  do it, since it can't be fetched by search/browse the way a static PDF can.
- **Assign to**: whoever owns the calculation engine — query the portal
  directly for the actual China-specific DRI-EAF/scrap-EAF averages; the two
  interim sources above are a better floor than before, not a resolution.

### 11. Quzhou 碳账户金融 policy and 工信部联节〔2026〕13号 (零碳工厂 policy)
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
