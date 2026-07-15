//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-data-CiWeEW_G.js
var routeGrades = [
	{
		key: "loan",
		label: "Green loan",
		zh: "绿色贷款",
		grade: "B",
		status: "Low-risk · eligible",
		tone: "carbon",
		gapLabel: "gap −0.4 to A",
		kb: "PBOC 2025 Green Finance Catalogue"
	},
	{
		key: "grant",
		label: "Factory grant",
		zh: "零碳工厂补贴",
		grade: "C",
		status: "Two gaps to close",
		tone: "warning",
		gapLabel: "+6 pts to B",
		kb: "GB/T 36132 · 工信部联节〔2026〕13号"
	},
	{
		key: "cbam",
		label: "EU license (CBAM)",
		zh: "碳关税",
		grade: "C",
		status: "Exposed · €38/t 2026",
		tone: "ember",
		gapLabel: "+37% over benchmark",
		kb: "Reg (EU) 2023/956 · IR (EU) 2025/2621"
	}
];
var ratioSliders = [
	{
		key: "scrap",
		label: "Scrap steel ratio",
		zh: "废钢比",
		value: 24.5,
		target: 40,
		unit: "%"
	},
	{
		key: "green",
		label: "Green electricity ratio",
		zh: "绿电比",
		value: 45,
		target: 60,
		unit: "%"
	},
	{
		key: "meter",
		label: "Metering coverage",
		zh: "计量覆盖",
		value: 78,
		target: 95,
		unit: "%"
	}
];
var tierGauge = {
	value: 68,
	min: 0,
	max: 100,
	label: "Grant score",
	nextTier: "B",
	zh: "距 B 级"
};
var processMatrix = [
	{
		stage: "Sintering",
		zh: "烧结",
		energy: "ok",
		intensity: "warn",
		metering: "ok",
		audit: "ok"
	},
	{
		stage: "Melting",
		zh: "炼钢",
		energy: "warn",
		intensity: "bad",
		metering: "warn",
		audit: "warn"
	},
	{
		stage: "Rolling",
		zh: "轧制",
		energy: "ok",
		intensity: "ok",
		metering: "ok",
		audit: "ok"
	},
	{
		stage: "Galvanizing",
		zh: "镀锌",
		energy: "warn",
		intensity: "warn",
		metering: "ok",
		audit: "ok"
	},
	{
		stage: "Finishing",
		zh: "精加工",
		energy: "ok",
		intensity: "ok",
		metering: "warn",
		audit: "ok"
	}
];
var emissionsBreakdown = [
	{
		key: "direct",
		label: "Direct combustion",
		value: 42,
		color: "var(--color-ember)"
	},
	{
		key: "process",
		label: "Process reactions",
		value: 24,
		color: "var(--color-warning)"
	},
	{
		key: "indirect",
		label: "Indirect · grid",
		value: 22,
		color: "var(--color-teal)"
	},
	{
		key: "upstream",
		label: "Upstream inputs",
		value: 12,
		color: "var(--color-carbon)"
	}
];
var factorySync = {
	lastSync: "09:41:22 CST",
	downstream: [
		"Readiness pre-screener",
		"Advisory agent",
		"Grant score writeback"
	]
};
var submissions = [
	{
		id: "S-0417",
		route: "CBAM",
		cn: "7318 15 88",
		desc: "Hex bolt M12",
		tons: 1240,
		tier: "Exposed",
		grade: "C",
		status: "Signed",
		date: "2026-03-14"
	},
	{
		id: "S-0416",
		route: "Grant",
		cn: "—",
		desc: "2025 Q4 factory pack",
		tons: 0,
		tier: "Tier 2",
		grade: "C",
		status: "Signed",
		date: "2026-03-09"
	},
	{
		id: "S-0415",
		route: "Loan",
		cn: "—",
		desc: "3-yr working capital",
		tons: 0,
		tier: "Low-risk",
		grade: "B",
		status: "Needs input",
		date: "2026-03-05"
	},
	{
		id: "S-0414",
		route: "CBAM",
		cn: "7301",
		desc: "Welded angle",
		tons: 310,
		tier: "High",
		grade: "D",
		status: "Signed",
		date: "2026-02-27"
	},
	{
		id: "S-0413",
		route: "CBAM",
		cn: "7302",
		desc: "Rail track material",
		tons: 145,
		tier: "Marginal",
		grade: "C",
		status: "Signed",
		date: "2026-02-20"
	},
	{
		id: "S-0412",
		route: "Grant",
		cn: "—",
		desc: "Metering upgrade",
		tons: 0,
		tier: "Tier 2",
		grade: "C",
		status: "Signed",
		date: "2026-02-11"
	}
];
var pipelineStages = [
	{
		n: 1,
		key: "Intake",
		zh: "接入",
		model: "deterministic · OCR + StructBERT",
		status: "done",
		elapsed: "812 ms"
	},
	{
		n: 2,
		key: "Validate",
		zh: "校验",
		model: "deterministic · 国家税务总局 API",
		status: "done",
		elapsed: "428 ms"
	},
	{
		n: 3,
		key: "Classify",
		zh: "分类",
		model: "qwen-flash · CN code classifier → picks calc. method",
		status: "active",
		elapsed: "1.2 s"
	},
	{
		n: 4,
		key: "Calculate",
		zh: "计算",
		model: "python · rule-based",
		status: "pending",
		elapsed: null
	},
	{
		n: 5,
		key: "Update dashboard",
		zh: "更新总览",
		model: "deterministic · data commit (no model)",
		status: "pending",
		elapsed: null
	},
	{
		n: 6,
		key: "Authorize → Upstream",
		zh: "授权上传",
		model: "operator confirm → Baowu/Ansteel API",
		status: "pending",
		elapsed: null,
		requiresAuth: true
	}
];
function routeStrip(kb) {
	return [
		{
			n: 1,
			key: "Pre-screener",
			zh: "预筛",
			method: "deterministic · doc checklist",
			status: "done",
			elapsed: "310 ms"
		},
		{
			n: 2,
			key: "Report",
			zh: "报告",
			method: "python · rule-based",
			status: "done",
			elapsed: "1.4 s"
		},
		{
			n: 3,
			key: "Score",
			zh: "评分",
			method: `rule-based · ${kb}`,
			status: "active",
			elapsed: "0.6 s"
		},
		{
			n: 4,
			key: "Pull factory data",
			zh: "工厂数据",
			method: "deterministic · dashboard bus",
			status: "pending",
			elapsed: null
		},
		{
			n: 5,
			key: "Advisory",
			zh: "建议",
			method: "qwen-plus · EN / 中文",
			status: "pending",
			elapsed: null
		}
	];
}
var docChecklists = {
	loan: {
		title: "Green loan — required documents",
		kb: "PBOC 2025 Green Finance Catalogue",
		items: [
			{
				name: "Business licence · 营业执照",
				done: true
			},
			{
				name: "Latest 12-mo utility invoices",
				done: true
			},
			{
				name: "Emissions ledger · Q1–Q4 2025",
				done: true
			},
			{
				name: "Bank statement · last 6 mo",
				done: true
			},
			{
				name: "Green-project use-of-proceeds",
				done: false
			},
			{
				name: "Auditor attestation (optional)",
				done: false
			}
		]
	},
	grant: {
		title: "Zero-carbon factory grant — required documents",
		kb: "GB/T 36132",
		items: [
			{
				name: "Factory registration · 工厂登记",
				done: true
			},
			{
				name: "Metering coverage report",
				done: true
			},
			{
				name: "Scrap-steel ratio evidence",
				done: true
			},
			{
				name: "Green-electricity PPA / green cert",
				done: true
			},
			{
				name: "Third-party emissions report (12 mo)",
				done: false
			},
			{
				name: "Provincial 零碳工厂 pre-cert",
				done: false
			}
		]
	},
	passport: {
		title: "EU license (CBAM) — required documents",
		kb: "Reg (EU) 2023/956",
		items: [
			{
				name: "CN-code product list · 税则号",
				done: true
			},
			{
				name: "Route-of-production statement",
				done: true
			},
			{
				name: "Direct + indirect embedded emissions",
				done: true
			},
			{
				name: "Verifier accreditation",
				done: true
			},
			{
				name: "Purchased CBAM certificates (Q ledger)",
				done: false
			},
			{
				name: "Installation-level emissions data",
				done: false
			}
		]
	}
};
var routePages = {
	loan: {
		slug: "loan",
		label: "Loan",
		zh: "贷款",
		n: "06",
		title: "Green Loan Preview",
		subtitle: "Deterministic rubric — passes are auditable line by line.",
		kb: "PBOC 2025 Green Finance Catalogue",
		scoreLabel: "Loan risk tier",
		scoreValue: "Low-risk",
		scoreGrade: "B",
		gauge: 78,
		gapUnit: "risk pts",
		advisoryImpactUnit: "loan score",
		citations: "PBOC 2025 · IR (EU) 2025/2621 · Reg (EU) 2023/956"
	},
	grant: {
		slug: "grant",
		label: "Grant",
		zh: "补贴",
		n: "07",
		title: "Green Factory Grant Preview",
		subtitle: "GB/T 36132 rubric — every point cites the specific clause.",
		kb: "GB/T 36132",
		scoreLabel: "Grant tier",
		scoreValue: "Tier 2 · 深绿",
		scoreGrade: "C",
		gauge: 68,
		gapUnit: "grant pts",
		advisoryImpactUnit: "grant score",
		citations: "GB/T 36132 · 工信部联节〔2026〕13号 · PBOC"
	},
	passport: {
		slug: "passport",
		label: "EU license",
		zh: "碳护照",
		n: "05",
		title: "CBAM Readiness Preview",
		subtitle: "Benchmark gap against Reg (EU) 2023/956 default values.",
		kb: "Reg (EU) 2023/956 benchmark gap",
		scoreLabel: "CBAM tier",
		scoreValue: "Exposed",
		scoreGrade: "C",
		gauge: 41,
		gapUnit: "€ / t exposure",
		advisoryImpactUnit: "€/t saved",
		citations: "Reg (EU) 2023/956 · IR (EU) 2025/2621 · CISA"
	}
};
var advisoryCards = {
	loan: [
		{
			title: "Lift metering coverage 78% → 95%",
			impact: "+8",
			why: "PBOC tier weights measurement evidence 25%. Missing meters keep you in Tier 2 despite low-carbon inputs.",
			status: "Not yet — planned"
		},
		{
			title: "Add auditor attestation",
			impact: "+5",
			why: "Attested emissions unlock LPR −85bp under Quzhou 4-tier model.",
			status: "Not yet — planned"
		},
		{
			title: "Refinance existing loan into CERF",
			impact: "+12",
			why: "PBOC 碳减排支持工具 covers 60% principal at 1.75%.",
			status: "Implemented"
		}
	],
	grant: [
		{
			title: "Raise scrap-steel ratio 24.5% → 40%",
			impact: "+9",
			why: "GB/T 36132 §5.2 — scrap ratio is the single largest lever in the grant rubric.",
			status: "Not yet — planned"
		},
		{
			title: "Sign green-electricity PPA 45% → 60%",
			impact: "+6",
			why: "Directly meets 工信部联节〔2026〕13号 renewable clause.",
			status: "Not yet — planned"
		},
		{
			title: "Close Melting-stage metering gap",
			impact: "+3",
			why: "Without stage-level data the auditor caps your score at Tier 2.",
			status: "Implemented"
		}
	],
	passport: [
		{
			title: "Switch to Scrap-EAF for 18% of tonnes",
			impact: "€142/t saved",
			why: "Benchmark gap goes from +37% to −8% for reallocated tonnage — the only structural fix.",
			status: "Not yet — planned"
		},
		{
			title: "Diversify EU-bound tonnes → SEA anchor",
			impact: "€48/t exposure ↓",
			why: "Cuts CBAM-exposed share while retrofit lands.",
			status: "Not yet — planned"
		},
		{
			title: "Install 6× CT-clamp kWh meters",
			impact: "€22/t verified",
			why: "Replaces default values with measured data — sub-¥10k, weeks not months.",
			status: "Implemented"
		}
	]
};
var gaps = {
	loan: ["Metering coverage below Tier-1 floor (78% < 90%)", "Use-of-proceeds document missing"],
	grant: ["Scrap-steel ratio 24.5% below GB/T 36132 §5.2 floor of 30%", "Third-party emissions report not attached"],
	passport: ["Route BF-BOF intensity +37% vs Reg 2023/956 benchmark", "Q4 CBAM certificate ledger not attached"]
};
var routerOutput = [
	{
		key: "grant",
		label: "Grant 补贴",
		conf: .88,
		preSelected: true,
		reason: "Factory registration + metering coverage clear the entry gate."
	},
	{
		key: "loan",
		label: "Loan 贷款",
		conf: .72,
		preSelected: true,
		reason: "Cash-flow signals and green-project intent detected."
	},
	{
		key: "passport",
		label: "EU license CBAM",
		conf: .34,
		preSelected: false,
		reason: "No EU-bound tonnes declared this period."
	}
];
//#endregion
export { gaps as a, ratioSliders as c, routeStrip as d, routerOutput as f, factorySync as i, routeGrades as l, tierGauge as m, docChecklists as n, pipelineStages as o, submissions as p, emissionsBreakdown as r, processMatrix as s, advisoryCards as t, routePages as u };
