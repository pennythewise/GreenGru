import { a as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { B as ArrowRight, C as FileUp, L as Banknote, a as TriangleAlert, b as HardHat, i as Upload, j as CircleCheck, s as Ship, u as Radio, v as Leaf, y as Info } from "../_libs/lucide-react.mjs";
import { a as cn, i as PageHeader, t as AppShell } from "./AppShell-DTZVPjM9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/new-U3Zo8Thz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var cnCodes = [
	"7207",
	"7208 10 00",
	"7213 / 7214",
	"7301",
	"7302",
	"7318 15 42",
	"7318 15 88",
	"7326"
];
var routes = [
	"BF-BOF",
	"DRI-EAF",
	"Scrap-EAF",
	"Downstream only",
	"not sure"
];
var routeChips = [
	{
		key: "loan",
		label: "Loan 贷款",
		icon: Banknote
	},
	{
		key: "grant",
		label: "Grant 补贴",
		icon: Leaf
	},
	{
		key: "passport",
		label: "CBAM 碳关税",
		icon: Ship
	}
];
function NewSubmission() {
	const [picked, setPicked] = (0, import_react.useState)({
		loan: true,
		grant: true,
		passport: false
	});
	const active = Object.entries(picked).filter(([, v]) => v).map(([k]) => k);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		crumb: "New submission",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			n: "04",
			zh: "新建",
			title: "Get real data in — with guardrails",
			subtitle: "Invoices, route(s), tonnage. Obviously-wrong uploads get rejected before any paid model call runs."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid lg:grid-cols-[1.4fr_1fr] gap-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 8
						},
						animate: {
							opacity: 1,
							y: 0
						},
						className: "panel p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, { className: "h-3.5 w-3.5 text-teal" }), " 1 · Documents"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/[0.04] p-8 text-center hover:bg-primary/[0.08] transition cursor-pointer",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {
										className: "h-8 w-8 text-primary mx-auto",
										strokeWidth: 1.6
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 text-[14px] font-medium",
										children: "Drop invoices / photos / PDF"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 text-[12px] text-muted-foreground",
										children: "or upload CSV / XLSX — structured files skip the vision model entirely"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-surface text-[12px] font-medium hover:bg-surface-2 transition",
										children: "Browse files"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex items-start gap-2 text-[11.5px] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-3.5 w-3.5 mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Stage 0 pre-screen (StructBERT + DAMO OCR, local) rejects selfies, blank pages, and wrong document types before any DashScope call." })]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 8
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: { delay: .05 },
						className: "panel p-5 space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HardHat, { className: "h-3.5 w-3.5 text-warning" }), " 2 · Product & route"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11.5px] font-mono text-muted-foreground",
									children: "Applicable route(s) · 适用路径 · multi-select"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex flex-wrap gap-2",
									children: routeChips.map((c) => {
										const on = picked[c.key];
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setPicked((p) => ({
												...p,
												[c.key]: !p[c.key]
											})),
											className: cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-mono transition", on ? "border-primary/50 bg-primary/[0.12] text-foreground teal-glow" : "border-border bg-surface text-muted-foreground hover:border-primary/40"),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(c.icon, { className: "h-3.5 w-3.5" }),
												" ",
												c.label
											]
										}, c.key);
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-[11px] text-muted-foreground",
									children: "Each active route pulls in its own document checklist further down (deterministic — no model call)."
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hairline" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid md:grid-cols-2 gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "CN code hint · 税则号",
										hint: "optional",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											className: "w-full bg-surface border border-input rounded-md px-3 py-2 text-[13px] font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/25",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "",
												children: "— let the classifier decide"
											}), cnCodes.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Production route · 工艺路线",
										hint: "or 'not sure'",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											className: "w-full bg-surface border border-input rounded-md px-3 py-2 text-[13px] font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/25",
											children: routes.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: r }, r))
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Company name · 公司名称",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											defaultValue: "宁波恒峰精密紧固件有限公司",
											className: "w-full bg-surface border border-input rounded-md px-3 py-2 text-[13px] outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Registration · 统一社会信用代码",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											defaultValue: "91330203MA2G4X7K9L",
											className: "w-full bg-surface border border-input rounded-md px-3 py-2 text-[13px] font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Annual export tonnage · 年出口吨数",
										hint: "inline 1000× check on submit",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												defaultValue: "1240",
												className: "w-full bg-surface border border-input rounded-md px-3 py-2 pr-14 text-[13px] font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-muted-foreground",
												children: "t / yr"
											})]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Reporting period · 期间",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											defaultValue: "2025-04-01 → 2026-03-31",
											className: "w-full bg-surface border border-input rounded-md px-3 py-2 text-[13px] font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
										})
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-2 rounded-md border border-warning/30 bg-warning/[0.06] p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 text-warning shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[12px] text-muted-foreground",
									children: "Grant route rejects submissions with no factory registration on file, before any scoring call runs. Kg/tonne mix-ups and values below 50 or above 500,000 t/yr are flagged before submit."
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 8
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: { delay: .1 },
						className: "panel p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "h-3.5 w-3.5 text-carbon" }), " 3 · Sensor data · optional"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "inline-flex items-center gap-2 cursor-pointer",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											defaultChecked: true,
											className: "peer sr-only"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "w-9 h-5 rounded-full bg-muted peer-checked:bg-carbon transition relative",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-0.5 left-0.5 w-4 h-4 bg-background rounded-full transition peer-checked:translate-x-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[12px] font-mono",
											children: "Include ESP32 kWh feed"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-[12px] text-muted-foreground",
								children: [
									"Decoupled — feeds the ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-carbon",
										children: "grant + loan scores"
									}),
									", never the CBAM tariff number."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 grid grid-cols-3 gap-2 text-[11px] font-mono",
								children: [
									{
										k: "MQTT topic",
										v: "hf/shopfloor/mains"
									},
									{
										k: "Last reading",
										v: "412.8 kW · 09:41"
									},
									{
										k: "Uptime 30d",
										v: "98.4%"
									}
								].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-md border border-border bg-surface p-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-muted-foreground uppercase text-[10px] tracking-wider",
										children: r.k
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-0.5",
										children: r.v
									})]
								}, r.k))
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lg:sticky lg:top-24 space-y-3 self-start",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						y: 8
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: { delay: .15 },
					className: "panel-lift p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground",
							children: "Ready to submit"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-1 text-lg font-semibold tracking-tight",
							children: "Pipeline preview"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-3 space-y-2 text-[12.5px]",
							children: [
								"Intake — deterministic OCR + StructBERT",
								"Validate — 国家税务总局 API",
								"Classify — qwen-flash · route router",
								"Calculate — python · rule-based",
								"Update dashboard — deterministic write-back",
								"Authorize → Upstream (Baowu/Ansteel)"
							].map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-[10px] w-4 shrink-0 text-primary",
									children: i + 1
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: s
								})]
							}, s))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-4 hairline" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-1.5 text-[11.5px] font-mono",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									k: "Routes active",
									v: active.length ? active.join(" · ") : "none"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									k: "Tonnage",
									v: "1,240 t / yr"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									k: "Sensor",
									v: "attached · 30 d"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/pipeline",
							className: "mt-5 w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-md bg-primary text-primary-foreground text-[13.5px] font-medium teal-glow hover:brightness-110 transition",
							children: ["Submit ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2.5 flex items-start gap-1.5 text-[11px] text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5 text-carbon shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Routed to Pipeline status (05). Resumable — a failed stage never re-bills finished work." })]
						})
					]
				})
			})]
		})]
	});
}
function Field({ label, hint, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[11.5px] font-mono text-muted-foreground",
				children: label
			}), hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[10px] font-mono text-muted-foreground/70",
				children: hint
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1",
			children
		})]
	});
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground shrink-0",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-foreground text-right truncate",
			children: v
		})]
	});
}
//#endregion
export { NewSubmission as component };
