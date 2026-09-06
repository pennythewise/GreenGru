export const shell = {
  smeOperator: { en: "SME operator", zh: "中小企业操作员" },
  dataResidency: { en: "Agents run on Qwen3.7-Plus; vectors use Qwen3-Embedding-8B.", zh: "智能体使用 Qwen3.7-Plus；向量使用 Qwen3-Embedding-8B。" },
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
  graphRag: { en: "Graph RAG", zh: "图谱检索" },
} as const;

export const newPage = {
  title: { en: "Get real data in — with guardrails", zh: "真实数据接入 — 带安全护栏" },
  subtitle: { en: "", zh: "" },
  documents: { en: "1 · Documents", zh: "1 · 文件" },
  dropTitle: { en: "Drop invoices / photos / PDF", zh: "拖入发票 / 照片 / PDF" },
  dropSub: { en: "", zh: "" },
  addMoreTitle: { en: "Add more invoices / PDFs", zh: "继续添加发票 / PDF" },
  addMoreSub: { en: "Drop files here or browse — each upload runs OCR separately", zh: "拖入或浏览 — 每个文件单独运行 OCR" },
  browse: { en: "Browse files", zh: "浏览文件" },
  intakeNote: { en: "", zh: "" },
  sensorOptional: { en: "2 · Sensor data · optional", zh: "2 · 传感器数据 · 可选" },
  esp32: { en: "Include ESP32 kWh feed", zh: "包含 ESP32 用电数据" },
  sensorNote: { en: "", zh: "" },
  readySubmit: { en: "Ready to submit", zh: "准备提交" },
  pipelineLive: { en: "Pipeline · live", zh: "流水线 · 运行中" },
  pipelinePreview: { en: "Pipeline preview", zh: "流水线预览" },
  pipelinePreviewSub: { en: "", zh: "" },
  documentsRow: { en: "Documents", zh: "文件" },
  ready: { en: "ready", zh: "就绪" },
  tonnage: { en: "Tonnage", zh: "吨位" },
  sensor: { en: "Sensor", zh: "传感器" },
  sensorVal: { en: "attached · 30 d", zh: "已接入 · 30 天" },
  submit: { en: "Submit", zh: "提交" },
  uploadToEnable: { en: "", zh: "" },
  ocrRunning: { en: "Running OCR intake on backend…", zh: "后端正在运行 OCR 接入…" },
  fixUploadError: { en: "Remove or replace failed uploads before submitting.", zh: "提交前请移除或替换失败的上传。" },
  resumable: { en: "Resumable — a failed stage never re-bills finished work.", zh: "可恢复 — 已完成阶段不会重复计费。" },
  waitingOcr: { en: "Waiting for OCR results…", zh: "等待 OCR 结果…" },
  verifyBlocked: {
    en: "Extraction cross-check failed — edit numbers or confirm mismatches below.",
    zh: "提取交叉校验未通过 — 请改数，或在下方确认不一致项。",
  },
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
  resetRouter: { en: "Reset to router", zh: "恢复路由建议" },
  send: { en: "Send", zh: "发送" },
  describeGoal: { en: "Describe your goal · 描述目标…", zh: "描述您的目标…" },
  thinking: { en: "Thinking…", zh: "思考中…" },
  updating: { en: "scoring…", zh: "计分中…" },
  confirmRoutes: { en: (n: number) => `Confirm ${n} route${n === 1 ? "" : "s"}`, zh: (n: number) => `确认 ${n} 条路线` },
  greeting: {
    en: "You're in GreenGru Copilot routing. Ask about Loan, Grant, or CBAM — when you're done, tap Finish asking questions so the router can score your intent.",
    zh: "您已进入 GreenGru 副驾路由。可先询问贷款、补贴或 CBAM — 提问结束后点「结束提问并计算」，路由再根据对话计分。",
  },
} as const;

export const dashboardPage = {
  title: { en: "CBAM prices & live factory metering", zh: "CBAM 价格与工厂实时计量" },
  subtitle: {
    en: "",
    zh: "",
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
  checklistNote: {
    en: "Attach all files first, then Process PDFs (MinerU→PyMuPDF→embed). Missing or unprocessed rows block Section B.",
    zh: "先附上全部文件，再点「处理 PDF」（MinerU→PyMuPDF→嵌入）。缺失或未处理项将阻塞 B 节。",
  },
  upload: { en: "Attach", zh: "附上" },
  queued: { en: "queued", zh: "已排队" },
  processAll: { en: "Process PDFs → embed", zh: "处理 PDF → 嵌入" },
  processAllHint: {
    en: "One batch: MinerU each PDF (PyMuPDF fallback), then a single embedding call for Stage 1 RAG.",
    zh: "批量：逐个 MinerU 解析 PDF（失败则 PyMuPDF），再一次嵌入调用写入 Stage 1 RAG。",
  },
  nothingToProcess: { en: "Attach PDF files first", zh: "请先附上 PDF 文件" },
  attachedProgress: {
    en: (a: number, d: number, t: number) => `${a} attached · ${d}/${t} processed`,
    zh: (a: number, d: number, t: number) => `已附上 ${a} · 已处理 ${d}/${t}`,
  },
  done: { en: "✓ done", zh: "✓ 完成" },
  sectionBPipeline: { en: "Section B · Route pipeline", zh: "B 节 · 路线流水线" },
  factoryNote: { en: "Pull factory data reads the same live bus as the Dashboard's factory panel — never a second source.", zh: "工厂数据拉取与总览工厂面板共用同一实时总线 — 非第二数据源。" },
  advisoryFlowLabel: {
    en: "Data flow · Score + factory signals → Advisory agent",
    zh: "数据流 · 评分 + 工厂信号 → 顾问智能体",
  },
  advisoryFlowFromScore: {
    en: "→ Advisory",
    zh: "→ 顾问",
  },
  advisoryFlowFromFactory: {
    en: "→ Advisory",
    zh: "→ 顾问",
  },
  sectionCPreview: { en: "Section C · Graph RAG", zh: "C 节 · Graph RAG" },
  sectionCPreviewLegacy: { en: "Section C · Report preview", zh: "C 节 · 报告预览" },
  deterministic: { en: "deterministic", zh: "确定性" },
  gapList: { en: "Gap list", zh: "差距清单" },
  downloadPdf: { en: "Download PDF", zh: "下载 PDF" },
  downloadExcel: { en: "Download Excel", zh: "下载 Excel" },
  pdfNote: { en: "Available before Advisory finishes.", zh: "建议阶段完成前即可下载。" },
  excelNote: {
    en: "Official EU CBAM Communication template (.xlsx), filled from your workbook.",
    zh: "欧盟官方 CBAM 沟通模板（.xlsx），已按工作簿填写。",
  },
  excelStage2Title: {
    en: "Report · CBAM Communication Excel",
    zh: "报告 · CBAM 沟通模板 Excel",
  },
  excelStage2Desc: {
    en: "This .xlsx is the official EU Commission CBAM communication workbook for your importer. It carries installation identity, reporting period, CN codes, and emissions fields from your evaluation form — use it to hand data to the EU declarant. It does not invent tCO₂e; numbers come from your form / deterministic pipeline.",
    zh: "此 .xlsx 为欧委会官方 CBAM 沟通工作簿，供欧盟进口申报方使用。内容来自评价表中的装置信息、报告期、海关编码与排放字段。不会编造 tCO₂e；数值来自评价表 / 确定性流水线。",
  },
  excelStage2Hint: {
    en: "Pipeline complete · Stage 2 report Excel ready · click show/hide",
    zh: "流水线完成 · 阶段 2 报告 Excel 已就绪 · 点击展开/收起",
  },
  sectionCAdvisory: { en: "Section C · Advisory", zh: "C 节 · 建议" },
  advisoryNote: { en: "non-blocking · optional follow-up", zh: "非阻塞 · 可选跟进" },
  why: { en: "Why?", zh: "为何？" },
  advisoryFooter: { en: "The SME can act on the left panel alone — advisory is optional.", zh: "中小企业可仅依据左侧面板行动 — 建议为可选。" },
  uploading: { en: "Uploading…", zh: "上传中…" },
  converting: { en: "Converting PDF…", zh: "解析 PDF…" },
  embedding: { en: "Embedding…", zh: "嵌入中…" },
  uploadFailed: { en: "Upload failed", zh: "上传失败" },
  runPipeline: { en: "Run pipeline", zh: "运行流水线" },
  pipelineRunning: { en: "Running…", zh: "运行中…" },
  pipelineComplete: { en: "Pipeline complete", zh: "流水线完成" },
  pipelineLocked: {
    en: "Attach & process all Section A documents to unlock",
    zh: "附上并处理全部 A 节文件后解锁",
  },
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
  livePower: { en: "Live shopfloor power", zh: "车间实时功率" },
  liveGridEmissions: { en: "Grid electricity tCO₂e", zh: "电网电力排放" },
  waitingEsp32: { en: "Waiting for ESP32 feed…", zh: "等待 ESP32 数据…" },
  liveSamples: { en: "samples", zh: "个采样点" },
  iotMonitor: { en: "IoT energy & emissions monitor", zh: "IoT 能耗与排放监测" },
  plantWide: { en: "Plant-wide", zh: "全厂" },
  byProcess: { en: "By process", zh: "按工序" },
  byMachine: { en: "By machine", zh: "按机台" },
  selectProcess: { en: "Select a process to drill into machines", zh: "选择工序以展开机台" },
  powerKw: { en: "Power", zh: "功率" },
  intensityT: { en: "Intensity", zh: "强度" },
  energySaving: { en: "vs baseline", zh: "相对基线" },
  hotspotMachine: { en: "Hotspot", zh: "热点" },
  cbamPrices: { en: "CBAM certificate prices", zh: "CBAM 证书价格" },
  latestQuarter: { en: "Latest published", zh: "最新已发布" },
  priorQuarter: { en: "Prior quarter", zh: "上一季度" },
  upcomingCadence: { en: "Upcoming & cadence", zh: "待发布与发布节奏" },
  pricePerT: { en: "€ / tCO₂e", zh: "€ / tCO₂e" },
  pending: { en: "Pending", zh: "待发布" },
  qoQChange: { en: "QoQ", zh: "环比" },
  weeklyFrom2027: {
    en: "From 2027: weekly prices after EU ETS auction weeks",
    zh: "2027 年起：按 EU ETS 拍卖周发布周度价格",
  },
  openCommission: { en: "Commission page", zh: "委员会页面" },
  publishedOn: { en: "Published", zh: "发布日" },
  dueOn: { en: "Due", zh: "预计" },
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
  intakeDetail: { en: "PaddleOCR → field parse → CN classify · PDFs also embed via Qwen3-Embedding-8B", zh: "PaddleOCR → 字段解析 → CN 分类 · PDF 亦经 Qwen3-Embedding-8B 嵌入" },
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
  verifyTitle: { en: "Extraction cross-check", zh: "提取交叉校验" },
  verifyPass: { en: "Pass", zh: "通过" },
  verifyWarn: { en: "Warn", zh: "告警" },
  verifyFail: { en: "Fail", zh: "未通过" },
  verifyReRunning: { en: "Re-checking numbers…", zh: "正在重新验算数字…" },
  verifyHint: {
    en: "Deterministic checks: qty×price≈amount · Σ lines≈total · amount+tax≈total with tax · digits in OCR text. Does not invent CBAM € figures.",
    zh: "确定性验算：数量×单价≈金额 · 明细合计≈合计 · 金额+税额≈价税合计 · 数字是否出现在 OCR 原文。不编造 CBAM 欧元数。",
  },
  confirmMismatch: {
    en: "I reviewed the mismatches and confirm the numbers for submit",
    zh: "我已复核不一致项，确认按当前数字提交",
  },
} as const;

export const graphRagPage = {
  eyebrow: { en: "CBAM Advisory · Graph RAG", zh: "CBAM 顾问 · Graph RAG" },
  title: {
    en: "Metallurgical & regulatory knowledge graph",
    zh: "冶金与法规知识图谱",
  },
  subtitle: {
    en: "Multi-hop lineage from Baowu BF-BOF → plate CN 7208 → fastener CN 7318, anchored to §3.16.2 boundaries, STM BAT plating guidance, and Stage-3 scoring rubrics — vectors for clauses, graph for relationships, code for numbers.",
    zh: "多跳溯源：宝武 BF-BOF → 板材 CN 7208 → 紧固件 CN 7318，锚定 §3.16.2 边界、STM BAT 镀层指引与阶段三评分标尺 — 向量检索条款，图谱承载关系，确定性代码算数。",
  },
  nodes: { en: "Nodes", zh: "节点" },
  edges: { en: "Edges", zh: "边" },
  algo: { en: "View", zh: "视图" },
  algoShortest: { en: "shortest path", zh: "最短路径" },
  algoLocal: { en: "local subgraph", zh: "局部子图" },
  algoFull: { en: "full ontology", zh: "全本体" },
  canvasHint: {
    en: "Views differ: shortest = BF→fastener chain only; local = 2-hop neighborhood; full = entire ontology. Drag empty space to orbit, grab spheres to pull nodes.",
    zh: "三种视图不同：最短路径 = 仅高炉→紧固件链；局部子图 = 2 跳邻域；全本体 = 完整图谱。拖空白旋转，抓球体拉动节点。",
  },
  queryLabel: { en: "Compliance question", zh: "合规问题" },
  run: { en: "Run Graph RAG cycle", zh: "运行 Graph RAG 循环" },
  advisory: { en: "Advisory agent", zh: "顾问解读" },
  yourQuery: { en: "Your query", zh: "您的问题" },
  nextActions: { en: "Suggested next actions", zh: "建议下一步" },
  answer: { en: "Cycle evidence answer", zh: "循环证据答复" },
  math: { en: "Deterministic precursor math", zh: "确定性前体倍率" },
  paths: { en: "Extracted paths", zh: "提取路径" },
  trace: { en: "Reasoning trajectory", zh: "推理轨迹" },
  stackNote: {
    en: "Stack: LangGraph StateGraph (Plan→Route→Execute→Evaluate→Generate, ≤1 back-edge) + NetworkX paths + Qwen embeddings / pgvector + math_bridge — Annex II steel: Scope 2 electricity is not CBAM-priced.",
    zh: "技术栈：LangGraph 状态图（Plan→Route→Execute→Evaluate→Generate，最多 1 次回边）+ NetworkX 路径 + Qwen 向量 / pgvector + math_bridge — 附件二钢铁：范围二电力不计入 CBAM 计价。",
  },
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
