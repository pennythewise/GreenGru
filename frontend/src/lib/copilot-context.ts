export type CopilotPage =
  | "passport"
  | "loan"
  | "grant"
  | "new"
  | "entry"
  | "dashboard";

export type CopilotRoute = "loan" | "grant" | "passport";

export type CopilotPrompt = {
  id: string;
  label: string;
  zh: string;
};

export type CopilotRouteChip = {
  key: CopilotRoute;
  label: string;
  icon: "loan" | "grant" | "passport";
};

export const COPILOT_ROUTE_CHIPS: CopilotRouteChip[] = [
  { key: "loan", label: "贷款 · Loan", icon: "loan" },
  { key: "grant", label: "补贴 · Grant", icon: "grant" },
  { key: "passport", label: "CBAM · EU license", icon: "passport" },
];

export type CopilotContext = {
  page: CopilotPage;
  pageLabel: string;
  greeting: string;
  prompts: [CopilotPrompt, CopilotPrompt, CopilotPrompt];
};

const PROMPTS: Record<CopilotPage, [CopilotPrompt, CopilotPrompt, CopilotPrompt]> = {
  passport: [
    {
      id: "passport-docs",
      label: "What documents do I need for the EU license?",
      zh: "碳护照需要哪些文件？",
    },
    {
      id: "passport-gap",
      label: "Why does my benchmark gap show as exposed?",
      zh: "为什么基准差距显示为高风险？",
    },
    {
      id: "passport-verifier",
      label: "Do I need verifier accreditation before submitting?",
      zh: "提交前是否必须完成核查机构认证？",
    },
  ],
  loan: [
    {
      id: "loan-tier",
      label: "What would raise my loan tier from B to A?",
      zh: "如何把贷款等级从 B 提升到 A？",
    },
    {
      id: "loan-blockers",
      label: "Which missing documents block Section B?",
      zh: "哪些缺失文件会卡住第二阶段？",
    },
    {
      id: "loan-ppa",
      label: "How does a green-electricity PPA affect my score?",
      zh: "绿电购电协议如何影响评分？",
    },
  ],
  grant: [
    {
      id: "grant-scrap",
      label: "What scrap-steel ratio do I need for Tier 2?",
      zh: "深绿等级需要多少废钢比例？",
    },
    {
      id: "grant-metering",
      label: "Which metering gaps block my grant application?",
      zh: "哪些计量缺口会阻碍补贴申请？",
    },
    {
      id: "grant-policy",
      label: "How does 工信部联节〔2026〕13号 apply here?",
      zh: "工信部联节〔2026〕13号如何适用？",
    },
  ],
  new: [
    {
      id: "new-files",
      label: "What file types can I upload for intake?",
      zh: "新建提交支持哪些文件格式？",
    },
    {
      id: "new-pipeline",
      label: "What happens after I submit a document?",
      zh: "提交文件后会进入什么流程？",
    },
    {
      id: "new-guardrails",
      label: "Will a wrong upload trigger a paid model call?",
      zh: "错误上传会触发付费模型调用吗？",
    },
  ],
  entry: [
    {
      id: "entry-router",
      label: "How does the router pick Loan vs Grant vs CBAM?",
      zh: "路由如何选择贷款、补贴或碳护照？",
    },
    {
      id: "entry-floor",
      label: "Why is CBAM below the confidence floor?",
      zh: "为什么 CBAM 低于置信度门槛？",
    },
    {
      id: "entry-combine",
      label: "Can I combine multiple routes in one submission?",
      zh: "能否在一次提交中组合多条路线？",
    },
  ],
  dashboard: [
    {
      id: "dash-what",
      label: "What is GreenGru Carbon Passport?",
      zh: "GreenGru 碳护照是什么？",
    },
    {
      id: "dash-start",
      label: "Which route should I start — Loan, Grant, or EU license?",
      zh: "应该先走贷款、补贴还是欧盟许可？",
    },
    {
      id: "dash-data",
      label: "Where does my data get processed?",
      zh: "我的数据在哪里处理？",
    },
  ],
};

/** Three prompts per route — shown after user picks Loan / Grant / EU license. */
export const ROUTE_PROMPTS: Record<CopilotRoute, [CopilotPrompt, CopilotPrompt, CopilotPrompt]> = {
  loan: PROMPTS.loan,
  grant: PROMPTS.grant,
  passport: PROMPTS.passport,
};

const GREETINGS: Record<CopilotPage, string> = {
  passport:
    "You're on the EU license (CBAM) route. I can explain document checklists, benchmark gaps, and verifier requirements — ask anything while you fill in details.",
  loan:
    "You're on the green-loan route. I can walk through PBOC tier rules, missing-doc blockers, and what moves your risk grade.",
  grant:
    "You're on the zero-carbon factory grant route. I can clarify GB/T 36132 clauses, scrap-ratio floors, and metering evidence.",
  new:
    "You're starting a new submission. I can explain upload formats, Stage-0 guardrails, and what runs after you hit submit.",
  entry:
    "You're in GreenGru Copilot routing. I can explain how Loan, Grant, and CBAM get selected — and why you confirm before anything runs.",
  dashboard:
    "I'm GreenGru Copilot. Ask about CBAM passports, green loans, factory grants, or where to start — I'll keep answers tied to cited regulations.",
};

const PAGE_LABELS: Record<CopilotPage, string> = {
  passport: "EU license · CBAM",
  loan: "Green loan",
  grant: "Green factory grant",
  new: "New submission",
  entry: "GreenGru Copilot",
  dashboard: "Dashboard",
};

const RESPONSES: Record<string, string> = {
  "passport-docs":
    "Section A needs six items: CN-code product list, route-of-production statement, direct + indirect embedded emissions, verifier accreditation, purchased CBAM certificates ledger, and installation-level emissions data. Two are still missing on your checklist — upload those before Section B unlocks.",
  "passport-gap":
    "Your gauge reads 41/100 (Grade C · Exposed) because embedded intensity sits ~37% above the Reg (EU) 2023/956 default benchmark for your CN code. The biggest structural fix in Advisory is shifting 18% of tonnes to Scrap-EAF — that alone closes most of the gap.",
  "passport-verifier":
    "Verifier accreditation is required before final CBAM declaration, but you can preview the passport while it's pending. Upload your accreditation certificate in Section A — without it, the gap list flags 'Verifier accreditation' and blocks submit-ready status.",
  "loan-tier":
    "You're at Grade B (78/100). To reach A: lift metering coverage from 78% → 95% (+8 pts), add auditor attestation (+5), and document green-project use-of-proceeds. PBOC Tier-1 wants ≥90% metering — that's your fastest lever.",
  "loan-blockers":
    "Two items still block Section B: 'Green-project use-of-proceeds' and optional 'Auditor attestation'. The use-of-proceeds doc is mandatory — upload it in Section A. Everything else on your checklist is already marked done.",
  "loan-ppa":
    "A green-electricity PPA doesn't directly change the loan rubric, but it strengthens your emissions ledger evidence and supports CERF refinancing (+12 loan score in Advisory). Pair it with metering data so the auditor can verify renewable share.",
  "grant-scrap":
    "GB/T 36132 §5.2 sets a 30% scrap-steel ratio floor for Tier 2 (深绿). You're at 24.5% — that's the top gap on your preview. Raising to 40% would add +9 grant points per the deterministic rubric.",
  "grant-metering":
    "Melting-stage metering is the main gap — without stage-level data the auditor caps you at Tier 2. Your checklist shows metering coverage report as done, but Advisory flags the melting-stage gap as not yet closed.",
  "grant-policy":
    "工信部联节〔2026〕13号 is the MIIT zero-carbon factory subsidy notice. It requires renewable-energy share evidence — your green-electricity PPA at 45% is close but below the 60% target in Advisory (+6 pts if you close that gap).",
  "new-files":
    "Accepted formats: PDF, CSV, XLSX, PNG, JPG/JPEG. Structured CSV/XLSX skip the vision model entirely. Photos and scans go through qwen3.7-plus intake after the local Stage-0 pre-screen.",
  "new-pipeline":
    "After submit: Stage 0 pre-screen → intake extraction → validation → deterministic calculation → parallel passport + financing agents → advisory. Each regulated number is computed in code before any LLM writes prose.",
  "new-guardrails":
    "No — Stage 0 (StructBERT + DAMO OCR, local) rejects selfies, blank pages, and wrong document types before any DashScope call. You also must tick the authorization checkbox before submit runs.",
  "entry-router":
    "Chat first, then tap Finish asking questions. The router (qwen3.7-plus) scores Loan, Grant, and/or CBAM from that conversation — not after every message. Routes above 0.70 pre-select; you always confirm before anything runs.",
  "entry-floor":
    "CBAM is below 0.70 because you declared no EU-bound tonnage this period (mostly domestic, EU maybe Q3). Without declared export volume, CBAM isn't in scope — you can re-enable it anytime before confirming.",
  "entry-combine":
    "Yes — tick multiple routes on the confirm panel. Each confirmed route opens its own page after New submission. Loan + Grant can run in parallel; CBAM is independent and only needed when EU export is declared.",
  "dash-what":
    "GreenGru is a CBAM export passport and green-financing readiness report for Chinese steel-downstream SMEs — distributed via Baowu/Ansteel. Every regulated number is computed deterministically and cited to source regulations.",
  "dash-start":
    "Start with GreenGru Copilot (/entry) if unsure — describe your goal and the router suggests routes. EU license if you export to the EU; Loan for PBOC green credit; Grant for 零碳工厂 subsidies. You can combine routes.",
  "dash-data":
    "Processing stays on Beijing-region DashScope infrastructure (pinned explicitly for data sovereignty). Stage-0 pre-screen runs locally; paid model calls only fire after you confirm routes and pass guardrails.",
};

const FALLBACKS: Record<CopilotPage, string> = {
  passport:
    "For CBAM questions, check Section A's document checklist and the benchmark gap in Section C. I can explain any specific row — try one of the suggested prompts above.",
  loan:
    "For loan questions, focus on Section A missing docs and the PBOC tier gauge. Tell me which checklist item you're stuck on.",
  grant:
    "For grant questions, GB/T 36132 and the scrap-ratio gap are usually the blockers. Ask about a specific clause or document.",
  new:
    "For intake questions, describe the file you're uploading or the field you're filling in — I'll point you to the right stage.",
  entry:
    "Describe what you need (loan, grant, EU export) and I'll explain how the router would classify it.",
  dashboard:
    "Tell me whether you're focused on export compliance, green credit, or factory subsidies — I'll point you to the right route.",
};

export function pathnameToCopilotPage(pathname: string): CopilotPage {
  if (pathname.startsWith("/passport")) return "passport";
  if (pathname.startsWith("/loan")) return "loan";
  if (pathname.startsWith("/grant")) return "grant";
  if (pathname.startsWith("/new")) return "new";
  if (pathname.startsWith("/entry")) return "entry";
  return "dashboard";
}

export function getCopilotContext(pathname: string): CopilotContext {
  const page = pathnameToCopilotPage(pathname);
  return {
    page,
    pageLabel: PAGE_LABELS[page],
    greeting: GREETINGS[page],
    prompts: PROMPTS[page],
  };
}

export function getCopilotReply(page: CopilotPage, promptId: string | null, userText: string): string {
  if (promptId && RESPONSES[promptId]) return RESPONSES[promptId];

  const lower = userText.toLowerCase();
  for (const [id, text] of Object.entries(RESPONSES)) {
    const prompt = Object.values(PROMPTS)
      .flat()
      .find((p) => p.id === id);
    if (!prompt) continue;
    const keywords = prompt.label.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
    if (keywords.some((k) => lower.includes(k))) return text;
  }

  return FALLBACKS[page];
}
