export const shell = {
  smeOperator: { en: "SME operator", zh: "中小企业操作员" },
  dataResidency: { en: "Your data stays on Beijing-region infrastructure.", zh: "数据留存于北京地区基础设施。" },
  commandCenter: { en: "Command Center", zh: "指挥中心" },
  apiConnected: { en: "API Connected", zh: "API 已连接" },
  accountManager: { en: "Account Manager", zh: "客户经理" },
  cited: { en: "Cited:", zh: "引用：" },
  copyright: { en: "© GreenGru · Beijing-region infra", zh: "© GreenGru · 北京地区基础设施" },
} as const;

export const crumbs = {
  dashboard: { en: "Dashboard", zh: "总览" },
  new: { en: "New submission", zh: "新建" },
  entry: { en: "GreenGru Copilot", zh: "副驾" },
  passport: { en: "EU license", zh: "碳护照" },
  loan: { en: "Loan", zh: "贷款" },
  grant: { en: "Grant", zh: "补贴" },
  upstream: { en: "Portfolio", zh: "供应商组合" },
} as const;

export const newPage = {
  title: { en: "Get real data in — with guardrails", zh: "真实数据接入 — 带安全护栏" },
  subtitle: {
    en: "Upload documents — obviously-wrong uploads get rejected before any paid model call runs.",
    zh: "上传文件 — 明显错误的文件会在调用付费模型前被拦截。",
  },
  documents: { en: "1 · Documents", zh: "1 · 文件" },
  dropTitle: { en: "Drop invoices / photos / PDF", zh: "拖入发票 / 照片 / PDF" },
  dropSub: { en: "or upload CSV / XLSX — structured files skip the vision model entirely", zh: "或上传 CSV / XLSX — 结构化文件跳过视觉模型" },
  addMoreTitle: { en: "Add more invoices / PDFs", zh: "继续添加发票 / PDF" },
  addMoreSub: { en: "Drop files here or browse — each upload runs OCR separately", zh: "拖入或浏览 — 每个文件单独运行 OCR" },
  browse: { en: "Browse files", zh: "浏览文件" },
  intakeNote: {
    en: "Stage 1 intake uses PaddleOCR (zh+en) for photos; PDFs extract text and embed with Qwen text-embedding-v4 into Supabase. Missing fields fall back to cited mock invoice templates. Use the chevron on each row to collapse long lists.",
    zh: "阶段 1 接入：照片走 PaddleOCR（中英）；PDF 提取文本并用 Qwen text-embedding-v4 写入 Supabase。缺失字段回退至引用模板。长列表可用每行箭头折叠。",
  },
  sensorOptional: { en: "2 · Sensor data · optional", zh: "2 · 传感器数据 · 可选" },
  esp32: { en: "Include ESP32 kWh feed", zh: "包含 ESP32 用电数据" },
  sensorNote: {
    en: "Decoupled — feeds the grant + loan scores, never the CBAM tariff number.",
    zh: "与 CBAM 关税解耦 — 仅影响补贴与贷款评分。",
  },
  readySubmit: { en: "Ready to submit", zh: "准备提交" },
  pipelineLive: { en: "Pipeline · live", zh: "流水线 · 运行中" },
  pipelinePreview: { en: "Pipeline preview", zh: "流水线预览" },
  pipelinePreviewSub: {
    en: "Upload documents and hit Submit to start the six-stage pipeline — it stays idle until then.",
    zh: "上传文件后点击提交，启动六阶段流水线 — 此前保持空闲。",
  },
  documentsRow: { en: "Documents", zh: "文件" },
  ready: { en: "ready", zh: "就绪" },
  tonnage: { en: "Tonnage", zh: "吨位" },
  sensor: { en: "Sensor", zh: "传感器" },
  sensorVal: { en: "attached · 30 d", zh: "已接入 · 30 天" },
  submit: { en: "Submit", zh: "提交" },
  uploadToEnable: { en: "Upload at least one document above to enable submit.", zh: "请至少上传一个文件以启用提交。" },
  ocrRunning: { en: "Running OCR intake on backend…", zh: "后端正在运行 OCR 接入…" },
  fixUploadError: { en: "Remove or replace failed uploads before submitting.", zh: "提交前请移除或替换失败的上传。" },
  resumable: { en: "Resumable — a failed stage never re-bills finished work.", zh: "可恢复 — 已完成阶段不会重复计费。" },
  waitingOcr: { en: "Waiting for OCR results…", zh: "等待 OCR 结果…" },
  authorizedMsg: {
    en: "Encrypted package signed and sent to Baowu/Ansteel.",
    zh: "加密数据包已签名并发送至宝武/鞍钢。",
  },
  continueCopilot: { en: "Continue in GreenGru Copilot →", zh: "继续在 GreenGru 副驾中 →" },
} as const;

export const entryPage = {
  title: { en: "Ask your GreenGru Copilot what you need", zh: "告诉 GreenGru 副驾您需要什么" },
  subtitle: {
    en: "Chat with Copilot about your goal, then finish asking — qwen3.7-plus scores Loan / Grant / CBAM from the conversation. Confirm routes to fill forms in order.",
    zh: "先与副驾对话说明目标，再结束提问 — qwen3.7-plus 根据对话历史为贷款 / 补贴 / CBAM 打分。确认路线后按序填写表单。",
  },
  routerTitle: { en: "Router output · confirm the route", zh: "路由输出 · 确认路线" },
  chatPlaceholder: {
    en: "Ask Copilot about your goal first — percentages appear after you finish asking.",
    zh: "请先向副驾说明目标 — 结束提问后才会显示百分比。",
  },
  waitingForQuestions: {
    en: "No questions yet — chat with Copilot, then finish asking to score routes.",
    zh: "尚未提问 — 请先与副驾对话，再结束提问以计算路线得分。",
  },
  readyToScore: {
    en: "When you’re done asking, score routes from this conversation.",
    zh: "提问结束后，可根据本次对话计算路线得分。",
  },
  finishAsking: { en: "Finish asking questions", zh: "结束提问并计算" },
  recalculateIntent: { en: "Recalculate intent %", zh: "重新计算意图 %" },
  scoringIntent: { en: "Scoring with qwen3.7-plus…", zh: "正在用 qwen3.7-plus 计分…" },
  whyConfirm: { en: "Why confirm, not auto-run?", zh: "为何需确认，而非自动运行？" },
  resetRouter: { en: "Reset to router", zh: "恢复路由建议" },
  send: { en: "Send", zh: "发送" },
  describeGoal: { en: "Describe your goal · 描述目标…", zh: "描述您的目标…" },
  thinking: { en: "Thinking…", zh: "思考中…" },
  updating: { en: "scoring…", zh: "计分中…" },
  whyConfirmBody: {
    en: (floor: number) =>
      `Intent % is calculated only when you finish asking — from the full chat via qwen3.7-plus. Routes at or above ${floor}% pre-select, but you always confirm. Multiple routes fill in order: EU license → Loan → Grant.`,
    zh: (floor: number) =>
      `意图百分比仅在您结束提问后，由 qwen3.7-plus 根据完整对话计算。达到 ${floor}% 的路线会预选，但您须手动确认。多路线按序填写：欧盟许可 → 贷款 → 补贴。`,
  },
  confirmRoutes: { en: (n: number) => `Confirm ${n} route${n === 1 ? "" : "s"}`, zh: (n: number) => `确认 ${n} 条路线` },
  greeting: {
    en: "You're in GreenGru Copilot routing. Ask about Loan, Grant, or CBAM — when you're done, tap Finish asking questions so the router can score your intent.",
    zh: "您已进入 GreenGru 副驾路由。可先询问贷款、补贴或 CBAM — 提问结束后点「结束提问并计算」，路由再根据对话计分。",
  },
} as const;

export const dashboardPage = {
  title: { en: "One glance across all three routes", zh: "三条路线一览" },
  subtitle: {
    en: "Loan, grant, and CBAM read the same way — plus a live pull from the factory that generates the data.",
    zh: "贷款、补贴与 CBAM 统一呈现 — 并实时拉取工厂数据。",
  },
  open: { en: "Open", zh: "打开" },
} as const;

export const pipeline = {
  stage: { en: "STAGE", zh: "阶段" },
  needsYou: { en: "needs you", zh: "需您确认" },
  requiresAuth: { en: "Requires your authorization", zh: "需要您的授权" },
  authNote: {
    en: "Only stage that leaves your systems — uploads the signed package to Baowu/Ansteel.",
    zh: "唯一离开您系统的阶段 — 将签名数据包上传至宝武/鞍钢。",
  },
  authorizeSend: { en: "Authorize & send", zh: "授权并发送" },
} as const;

export const routeFlow = {
  copilotFlow: { en: "Copilot flow ·", zh: "副驾流程 ·" },
  stepOf: { en: (s: number, t: number) => `Step ${s} of ${t}`, zh: (s: number, t: number) => `第 ${s}/${t} 步` },
  next: { en: (label: string) => ` — next: ${label}`, zh: (label: string) => ` — 下一步：${label}` },
  continueTo: { en: (label: string) => `Continue to ${label}`, zh: (label: string) => `继续至${label}` },
  finishFlow: { en: "Finish flow", zh: "完成流程" },
  backDashboard: { en: "← Back to dashboard", zh: "← 返回总览" },
  goNewSubmission: { en: "Go to new submission", zh: "前往新建提交" },
  submitReady: { en: "Submit-ready", zh: "可提交" },
} as const;

export const routeLabels = {
  loan: { en: "Loan", zh: "贷款" },
  grant: { en: "Grant", zh: "补贴" },
  passport: { en: "EU license", zh: "欧盟许可" },
} as const;

export const copilot = {
  title: { en: "GreenGru Copilot", zh: "GreenGru 副驾" },
  suggested: { en: "Suggested", zh: "建议提问" },
  thinking: { en: "Thinking…", zh: "思考中…" },
  placeholder: { en: "Ask while you fill in…", zh: "边填边问…" },
  allRoutes: { en: "← All routes", zh: "← 全部路线" },
  closePanel: { en: "Close copilot panel", zh: "关闭副驾面板" },
  openCopilot: { en: "Open GreenGru Copilot", zh: "打开 GreenGru 副驾" },
  send: { en: "Send", zh: "发送" },
} as const;

export const copilotGreetings: Record<string, { en: string; zh: string }> = {
  passport: {
    en: "You're on the EU license (CBAM) route. I can explain document checklists, benchmark gaps, and verifier requirements — ask anything while you fill in details.",
    zh: "您已进入欧盟许可（CBAM）路线。我可说明文件清单、基准差距与核查要求 — 填写时可随时提问。",
  },
  loan: {
    en: "You're on the green-loan route. I can walk through PBOC tier rules, missing-doc blockers, and what moves your risk grade.",
    zh: "您已进入绿色贷款路线。我可说明人行等级规则、缺失文件阻碍及如何提升风险等级。",
  },
  grant: {
    en: "You're on the zero-carbon factory grant route. I can clarify GB/T 36132 clauses, scrap-ratio floors, and metering evidence.",
    zh: "您已进入零碳工厂补贴路线。我可说明 GB/T 36132 条款、废钢比例门槛与计量证据。",
  },
  new: {
    en: "You're starting a new submission. I can explain upload formats, Stage-0 guardrails, and what runs after you hit submit.",
    zh: "您正在新建提交。我可说明上传格式、阶段 0 护栏及提交后的流程。",
  },
  entry: {
    en: "You're in GreenGru Copilot routing. I can explain how Loan, Grant, and CBAM get selected — and why you confirm before anything runs.",
    zh: "您已进入 GreenGru 副驾路由。我可说明贷款、补贴与 CBAM 如何被选择 — 以及为何须先确认再运行。",
  },
  dashboard: {
    en: "I'm GreenGru Copilot. Ask about CBAM passports, green loans, factory grants, or where to start — I'll keep answers tied to cited regulations.",
    zh: "我是 GreenGru 副驾。可咨询碳护照、绿色贷款、工厂补贴或从何开始 — 回答均引用法规来源。",
  },
};

export const copilotPageLabels: Record<string, { en: string; zh: string }> = {
  passport: { en: "EU license · CBAM", zh: "欧盟许可 · CBAM" },
  loan: { en: "Green loan", zh: "绿色贷款" },
  grant: { en: "Green factory grant", zh: "零碳工厂补贴" },
  new: { en: "New submission", zh: "新建提交" },
  entry: { en: "GreenGru Copilot", zh: "GreenGru 副驾" },
  dashboard: { en: "Dashboard", zh: "总览" },
};

export const routePage = {
  sectionADoc: { en: "Section A · Document intake", zh: "A 节 · 文件接入" },
  collected: { en: (d: number, t: number) => `${d} of ${t} collected`, zh: (d: number, t: number) => `已收集 ${d}/${t}` },
  checklistNote: { en: "Deterministic checklist — no model call. Missing rows block Section B.", zh: "确定性清单 — 无模型调用。缺失项将阻塞 B 节。" },
  upload: { en: "Upload", zh: "上传" },
  done: { en: "✓ done", zh: "✓ 完成" },
  sectionBPipeline: { en: "Section B · Route pipeline", zh: "B 节 · 路线流水线" },
  factoryNote: { en: "Pull factory data reads the same live bus as the Dashboard's factory panel — never a second source.", zh: "工厂数据拉取与总览工厂面板共用同一实时总线 — 非第二数据源。" },
  sectionCPreview: { en: "Section C · Report preview", zh: "C 节 · 报告预览" },
  deterministic: { en: "deterministic", zh: "确定性" },
  gapList: { en: "Gap list", zh: "差距清单" },
  downloadPdf: { en: "Download PDF", zh: "下载 PDF" },
  downloadExcel: { en: "Download Excel", zh: "下载 Excel" },
  pdfNote: { en: "Available before Advisory finishes.", zh: "建议阶段完成前即可下载。" },
  excelNote: {
    en: "Official EU CBAM Communication template (.xlsx), filled from your workbook.",
    zh: "欧盟官方 CBAM 沟通模板（.xlsx），已按工作簿填写。",
  },
  sectionCAdvisory: { en: "Section C · Advisory", zh: "C 节 · 建议" },
  advisoryNote: { en: "non-blocking · optional follow-up", zh: "非阻塞 · 可选跟进" },
  why: { en: "Why?", zh: "为何？" },
  advisoryFooter: { en: "The SME can act on the left panel alone — advisory is optional.", zh: "中小企业可仅依据左侧面板行动 — 建议为可选。" },
  uploading: { en: "Uploading…", zh: "上传中…" },
  runPipeline: { en: "Run pipeline", zh: "运行流水线" },
  pipelineRunning: { en: "Running…", zh: "运行中…" },
  pipelineComplete: { en: "Pipeline complete", zh: "流水线完成" },
  pipelineLocked: { en: "Upload all Section A documents to unlock", zh: "上传全部 A 节文件后解锁" },
  generatingPdf: { en: "Generating PDF…", zh: "生成 PDF 中…" },
  generatingExcel: { en: "Generating Excel…", zh: "生成 Excel 中…" },
  pdfReady: { en: "PDF ready", zh: "PDF 已就绪" },
  excelReady: { en: "Excel ready", zh: "Excel 已就绪" },
  pdfError: { en: "PDF generation failed", zh: "PDF 生成失败" },
  excelError: { en: "Excel generation failed", zh: "Excel 生成失败" },
  replaceFile: { en: "Replace", zh: "替换" },
} as const;

export const dashboardSections = {
  distanceTier: { en: "Distance to next tier", zh: "距下一等级" },
  tierUnlock: { en: (n: number) => `${n} pts to unlock`, zh: (n: number) => `还差 ${n} 分解锁` },
  grantLevers: { en: "Grant rubric levers", zh: "补贴评分杠杆" },
  sliderNote: { en: "Solid marker = current · thin line = rubric floor. Only two levers stand between C and B.", zh: "实心=当前值 · 细线=规则底线。仅两项杠杆介于 C 与 B 之间。" },
  emissionsSplit: { en: "Emissions source split", zh: "排放来源构成" },
  processMatrix: { en: "Process-stage matrix", zh: "工序阶段矩阵" },
  stage: { en: "Stage", zh: "工序" },
  energy: { en: "Energy", zh: "能源" },
  intensity: { en: "Intensity", zh: "强度" },
  metering: { en: "Metering", zh: "计量" },
  audit: { en: "Audit", zh: "审计" },
  ok: { en: "ok", zh: "正常" },
  attention: { en: "attention", zh: "关注" },
  hotspot: { en: "hotspot", zh: "热点" },
  factoryFloor: { en: "Simulated factory floor", zh: "模拟工厂车间" },
  live: { en: "live", zh: "实时" },
  lastSync: { en: "Last sync", zh: "最近同步" },
  syncNote: { en: "deterministic threshold-watch, no model call.", zh: "确定性阈值监测，无模型调用。" },
  feeds: { en: "Feeds →", zh: "输出 →" },
  yourSubmissions: { en: "Your submissions", zh: "您的提交" },
  onePagePerRoute: { en: "One page per confirmed route", zh: "每条确认路线一页" },
  route: { en: "Route", zh: "路线" },
  descriptor: { en: "Descriptor", zh: "描述" },
  tonnes: { en: "Tonnes", zh: "吨位" },
  tier: { en: "Tier", zh: "等级" },
  grade: { en: "Grade", zh: "评分" },
  status: { en: "Status", zh: "状态" },
  date: { en: "Date", zh: "日期" },
  signed: { en: "Signed", zh: "已签署" },
  needsInput: { en: "Needs input", zh: "待补充" },
  firstTime: { en: "First time?", zh: "首次使用？" },
  talkCopilot: { en: "Talk to GreenGru Copilot →", zh: "咨询 GreenGru 副驾 →" },
  startNew: { en: "Start a new submission", zh: "开始新建提交" },
  distributed: { en: "Distributed via Baowu / Ansteel supplier program", zh: "经宝武 / 鞍钢供应商计划分发" },
  loadingFactory: { en: "Loading 3D factory floor…", zh: "工厂 3D 场景加载中…" },
  copilotBtn: { en: "GreenGru Copilot", zh: "GreenGru 副驾" },
} as const;

export const invoiceCard = {
  collapse: { en: "Collapse document", zh: "折叠文件" },
  expand: { en: "Expand document", zh: "展开文件" },
  remove: { en: "Remove file", zh: "移除文件" },
  ocrRunning: { en: "OCR running…", zh: "OCR 运行中…" },
  ocrFailed: { en: "OCR failed", zh: "OCR 失败" },
  ready: { en: "Ready", zh: "就绪" },
  runningIntake: { en: "Running OCR intake…", zh: "正在运行 OCR 接入…" },
  intakeDetail: { en: "PaddleOCR → field parse → CN classify · PDFs also embed via text-embedding-v4", zh: "PaddleOCR → 字段解析 → CN 分类 · PDF 亦经 text-embedding-v4 嵌入" },
  previewFailed: { en: "OCR preview failed", zh: "OCR 预览失败" },
  extractedTitle: { en: "Extracted info with classified result", zh: "提取信息与分类结果" },
  edit: { en: "Edit", zh: "编辑" },
  done: { en: "Done", zh: "完成" },
  lockedNote: { en: "Locked — submitted to the pipeline as shown below.", zh: "已锁定 — 按下方所示提交至流水线。" },
  editNote: { en: "Runs as-is on submit. Click Edit to correct anything the OCR pass misread.", zh: "提交时按原样运行。点编辑可修正 OCR 误读。" },
  classified: { en: "Classified result", zh: "分类结果" },
  lowConfidence: { en: "low confidence → escalated →", zh: "低置信 → 升级 →" },
  calcMethod: { en: "Calculation method selected →", zh: "已选计算方法 →" },
  route: { en: "route", zh: "路线" },
  lineItems: { en: "Line items", zh: "货物明细" },
} as const;

export const authModal = {
  title: { en: "Stage 6 · Authorize upload", zh: "阶段 6 · 授权上传" },
  subtitle: { en: "operator confirm → Baowu/Ansteel API", zh: "操作员确认 → 宝武/鞍钢 API" },
  encryptBody: {
    en: "Your data will be sent to your supplier (Baowu/Ansteel) in encrypted state — TLS in transit, HMAC-signed package at rest.",
    zh: "数据将以加密状态发送至供应商（宝武/鞍钢）— 传输层 TLS，静态包 HMAC 签名。",
  },
  cryptoSig: { en: "Cryptographic signature", zh: "加密签名" },
  signed: { en: "signed", zh: "已签名" },
  signing: { en: "signing…", zh: "签名中…" },
  signingDetail: { en: "SHA-256 package hash → HMAC-SHA256 operator seal…", zh: "SHA-256 包哈希 → HMAC-SHA256 操作员签章…" },
  packageHash: { en: "Package hash · SHA-256", zh: "包哈希 · SHA-256" },
  operatorSig: { en: "Operator signature · HMAC-SHA256", zh: "操作员签名 · HMAC-SHA256" },
  nextNote: { en: "Next: GreenGru Copilot — choose Loan, Grant, or EU license route.", zh: "下一步：GreenGru 副驾 — 选择贷款、补贴或欧盟许可路线。" },
  continue: { en: "Authorize and Continue", zh: "授权并继续" },
} as const;

export const signinPage = {
  signIn: { en: "Sign in", zh: "登录" },
  headline: { en: "Turn invisible emissions into a CBAM passport, a financing report, and a ranked plan.", zh: "将隐形排放转化为碳护照、融资报告与优先级行动方案。" },
  sub: { en: "Distributed to Baowu / Ansteel downstream customers as a value-added service. Bilingual EN / 中文, every regulated number cited.", zh: "作为增值服务分发给宝武/鞍钢下游客户。中英双语，每项监管数字均有引用来源。" },
  welcome: { en: "Welcome back", zh: "欢迎回来" },
  b2b: { en: "B2B access via Baowu / Ansteel referral. No open self-serve signup.", zh: "经宝武/鞍钢推荐的企业访问。不开放自助注册。" },
  workEmail: { en: "Work email", zh: "工作邮箱" },
  password: { en: "Password", zh: "密码" },
  signInBtn: { en: "Sign in", zh: "登录" },
  residency: { en: "Your data stays on Beijing-region infrastructure. No cross-border export at any pipeline stage.", zh: "数据留存于北京地区基础设施。流水线任何阶段均不出境。" },
  demoLink: { en: "Direct link (demo):", zh: "直达链接（演示）：" },
  dashboard: { en: "→ dashboard", zh: "→ 总览" },
} as const;
