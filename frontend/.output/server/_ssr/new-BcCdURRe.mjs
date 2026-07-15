import { a as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { B as ArrowRight, P as Check, T as FileText, d as Pencil, i as Upload, j as CircleCheck, k as Circle, l as Radio, n as X, s as ShieldCheck, w as FileUp, x as Info, y as LoaderCircle } from "../_libs/lucide-react.mjs";
import { a as cn, i as PageHeader, t as AppShell } from "./AppShell-DRknCBhl.mjs";
import { o as pipelineStages } from "./dashboard-data-CiWeEW_G.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/new-BcCdURRe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EXTRACTED = {
	invoiceCode: "3400174130",
	invoiceNumber: "05073978",
	issueDate: "2017-12-01",
	buyer: {
		name: "六安江淮电机有限公司",
		taxId: "9134150072554518XQ",
		addressPhone: "安徽省六安市寿春路 · 0564-3368617",
		bankAccount: "建行六安城北支行 · 3400174620805300512"
	},
	seller: {
		name: "合肥市日普贸易有限公司",
		taxId: "91340100748916334H",
		addressPhone: "合肥市金奥路162号安徽国际商务中心B座26楼 · 0551-63671971",
		bankAccount: "徽商银行合肥太湖路支行 · 2051012000004989"
	},
	items: [
		{
			name: "碳结圆",
			spec: "Φ90",
			unit: "吨",
			qty: "4.736",
			unitPrice: "3957.26",
			amount: "18741.61",
			taxRate: "17%",
			tax: "3186.07"
		},
		{
			name: "碳结圆",
			spec: "Φ80",
			unit: "吨",
			qty: "6.674",
			unitPrice: "3957.26",
			amount: "26410.79",
			taxRate: "17%",
			tax: "4489.83"
		},
		{
			name: "碳结圆",
			spec: "Φ65",
			unit: "吨",
			qty: "12.49",
			unitPrice: "3957.26",
			amount: "49426.24",
			taxRate: "17%",
			tax: "8402.46"
		}
	],
	totalAmount: "94578.64",
	totalTax: "16078.36",
	totalWithTax: "110657.00",
	payee: "陈义康",
	reviewer: "王建",
	issuer: "陈文康"
};
var CLASSIFICATION = {
	cnCode: "7213 / 7214",
	cnLabel: "热轧圆钢 / 盘条 · bars & rods, hot-rolled, non-alloy steel",
	flashConfidence: 63,
	escalated: true,
	plusConfidence: 91,
	route: "BF-BOF",
	benchmark: "EU benchmark 1.370 tCO2e/t (IR 2025/2621)",
	defaultIntensity: "China default 3.506 tCO2e/t (China GHG Factor DB v2)"
};
function EditableField({ label, value, editing, onChange, mono = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80",
		children: label
	}), editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		value,
		onChange: (e) => onChange(e.target.value),
		className: cn("mt-0.5 w-full bg-surface border border-input rounded px-2 py-1 text-[12.5px] outline-none focus:border-ring focus:ring-2 focus:ring-ring/25", mono && "font-mono")
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mt-0.5 text-[12.5px]", mono && "font-mono"),
		children: value
	})] });
}
function PartyBlock({ title, zh, party, editing, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-surface/40 p-3 space-y-2.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-[11px] font-mono uppercase tracking-[0.12em] text-teal",
				children: [
					title,
					" · ",
					zh
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableField, {
				label: "名称 · Name",
				value: party.name,
				editing,
				onChange: (v) => onChange({
					...party,
					name: v
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableField, {
				label: "纳税人识别号 · Tax ID",
				value: party.taxId,
				editing,
				onChange: (v) => onChange({
					...party,
					taxId: v
				}),
				mono: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableField, {
				label: "地址、电话 · Address / phone",
				value: party.addressPhone,
				editing,
				onChange: (v) => onChange({
					...party,
					addressPhone: v
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableField, {
				label: "开户行及账号 · Bank",
				value: party.bankAccount,
				editing,
				onChange: (v) => onChange({
					...party,
					bankAccount: v
				}),
				mono: true
			})
		]
	});
}
function ExtractedInvoiceCard({ fileName, fileSizeLabel, onRemove, locked = false }) {
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [data, setData] = (0, import_react.useState)(EXTRACTED);
	const canEdit = editing && !locked;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: {
			opacity: 0,
			y: 6
		},
		animate: {
			opacity: 1,
			y: 0
		},
		className: "mt-3 rounded-xl border border-carbon/40 bg-carbon/[0.04] p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2.5 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-8 w-8 rounded-lg bg-carbon/15 text-carbon flex items-center justify-center shrink-0 mt-0.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[13.5px] font-medium",
							children: "Extracted info with classified result"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[11px] font-mono text-muted-foreground",
							children: [
								"提取信息与分类结果 · ",
								fileName,
								" · ",
								fileSizeLabel
							]
						})]
					})]
				}), !locked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5 shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setEditing((e) => !e),
						className: cn("inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-[11.5px] font-medium transition", editing ? "border-carbon/50 bg-carbon/15 text-carbon" : "border-border bg-surface hover:bg-surface-2"),
						children: [editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" }), editing ? "Done" : "Edit"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onRemove,
						"aria-label": "Remove file",
						className: "h-7 w-7 rounded-md border border-border bg-surface flex items-center justify-center hover:bg-surface-2 transition",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 text-[11px] text-muted-foreground",
				children: locked ? "Locked — submitted to the pipeline as shown below." : "Runs as-is on submit. Click Edit to correct anything the OCR pass misread."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 rounded-lg border border-teal/30 bg-teal/[0.06] p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.12em] text-teal",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" }), " Classified result · 分类结果"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center px-2 py-1 rounded border border-teal/40 bg-teal/10 text-[12px] font-mono text-foreground",
							children: ["CN ", CLASSIFICATION.cnCode]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11.5px] text-muted-foreground",
							children: CLASSIFICATION.cnLabel
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 text-[11px] font-mono text-muted-foreground",
						children: [
							"qwen-flash ",
							CLASSIFICATION.flashConfidence,
							"%",
							CLASSIFICATION.escalated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								" · low confidence → escalated → qwen-plus ",
								CLASSIFICATION.plusConfidence,
								"%"
							] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 pt-2 border-t border-border/60 text-[11.5px]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "Calculation method selected → "
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: CLASSIFICATION.route
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: " route · "
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-[11px] text-muted-foreground",
								children: [
									CLASSIFICATION.benchmark,
									" · ",
									CLASSIFICATION.defaultIntensity
								]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableField, {
					label: "发票代码 · Invoice code",
					value: data.invoiceCode,
					editing: canEdit,
					onChange: (v) => setData((d) => ({
						...d,
						invoiceCode: v
					})),
					mono: true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableField, {
					label: "发票号码 · Invoice No",
					value: data.invoiceNumber,
					editing: canEdit,
					onChange: (v) => setData((d) => ({
						...d,
						invoiceNumber: v
					})),
					mono: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid md:grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartyBlock, {
					title: "购买方",
					zh: "Buyer",
					party: data.buyer,
					editing: canEdit,
					onChange: (p) => setData((d) => ({
						...d,
						buyer: p
					}))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartyBlock, {
					title: "销售方",
					zh: "Seller",
					party: data.seller,
					editing: canEdit,
					onChange: (p) => setData((d) => ({
						...d,
						seller: p
					}))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 rounded-lg border border-border bg-surface/40 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground",
						children: "货物明细 · Line items"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-[11.5px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1.5 pr-2 text-left",
										children: "名称"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1.5 pr-2 text-left",
										children: "规格"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1.5 pr-2 text-right",
										children: "数量"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1.5 pr-2 text-right",
										children: "单价"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1.5 pr-2 text-right",
										children: "金额"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1.5 pr-2 text-right",
										children: "税率"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1.5 text-right",
										children: "税额"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "font-mono",
								children: data.items.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border/60 last:border-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1.5 pr-2",
											children: canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: it.name,
												onChange: (e) => setData((d) => ({
													...d,
													items: d.items.map((x, idx) => idx === i ? {
														...x,
														name: e.target.value
													} : x)
												})),
												className: "w-16 bg-surface border border-input rounded px-1 py-0.5 text-[11px] font-sans"
											}) : it.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1.5 pr-2",
											children: canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: it.spec,
												onChange: (e) => setData((d) => ({
													...d,
													items: d.items.map((x, idx) => idx === i ? {
														...x,
														spec: e.target.value
													} : x)
												})),
												className: "w-12 bg-surface border border-input rounded px-1 py-0.5 text-[11px]"
											}) : it.spec
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "py-1.5 pr-2 text-right",
											children: [
												it.qty,
												" ",
												it.unit
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1.5 pr-2 text-right",
											children: it.unitPrice
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1.5 pr-2 text-right",
											children: it.amount
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1.5 pr-2 text-right",
											children: it.taxRate
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1.5 text-right",
											children: it.tax
										})
									]
								}, i))
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 pt-2 border-t border-border flex items-center justify-end gap-4 text-[11.5px] font-mono",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: ["合计金额 ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-foreground",
									children: ["¥", data.totalAmount]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: ["税额 ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-foreground",
									children: ["¥", data.totalTax]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: ["价税合计 ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-gold",
									children: ["¥", data.totalWithTax]
								})]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center gap-4 text-[10.5px] font-mono text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["收款人 ", data.payee] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["复核 ", data.reviewer] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["开票人 ", data.issuer] })
				]
			})
		]
	});
}
var DURATIONS_MS = [
	700,
	650,
	1100,
	850,
	500
];
function idleRuntime() {
	return pipelineStages.map(() => ({
		status: "pending",
		elapsed: null
	}));
}
function PipelineTracker({ running, authorized, onAuthorize }) {
	const [runtime, setRuntime] = (0, import_react.useState)(idleRuntime);
	(0, import_react.useEffect)(() => {
		if (!running) {
			setRuntime(idleRuntime());
			return;
		}
		let cancelled = false;
		let i = 0;
		const step = () => {
			if (cancelled) return;
			setRuntime((prev) => prev.map((r, idx) => idx === i ? {
				...r,
				status: "active"
			} : r));
			if (i === pipelineStages.length - 1) return;
			const dur = DURATIONS_MS[i] ?? 600;
			setTimeout(() => {
				if (cancelled) return;
				setRuntime((prev) => prev.map((r, idx) => idx === i ? {
					status: "done",
					elapsed: `${(dur / 1e3).toFixed(1)} s`
				} : r));
				i += 1;
				step();
			}, dur);
		};
		step();
		return () => {
			cancelled = true;
		};
	}, [running]);
	(0, import_react.useEffect)(() => {
		if (!authorized) return;
		setRuntime((prev) => prev.map((r, idx) => idx === pipelineStages.length - 1 ? {
			status: "done",
			elapsed: "0.4 s"
		} : r));
	}, [authorized]);
	const authActive = runtime[pipelineStages.length - 1]?.status === "active";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
		className: "relative pl-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "absolute left-[15px] top-2 bottom-2 w-px bg-border",
			"aria-hidden": true
		}), pipelineStages.map((s, i) => {
			const r = runtime[i];
			const done = r.status === "done";
			const isActive = r.status === "active";
			const isAuth = s.requiresAuth;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.li, {
				initial: {
					opacity: 0,
					x: -8
				},
				animate: {
					opacity: 1,
					x: 0
				},
				transition: { delay: i * .04 },
				className: "relative pl-8 pb-5 last:pb-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("absolute left-0 top-0.5 h-6 w-6 rounded-full flex items-center justify-center border-2", done && "bg-carbon/15 border-carbon text-carbon", isActive && "bg-primary/15 border-primary text-primary", !done && !isActive && "bg-surface border-border text-muted-foreground"),
						children: [
							done && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
								className: "h-3.5 w-3.5",
								strokeWidth: 3
							}),
							isActive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }),
							!done && !isActive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-2 w-2 fill-current" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[10px] font-mono text-muted-foreground",
										children: ["STAGE ", s.n]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[10px] font-mono text-muted-foreground/70",
										children: ["· ", s.zh]
									}),
									isAuth && isActive && !authorized && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[10px] font-mono text-warning inline-flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3 w-3" }), " needs you"]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-0.5 text-[13px] font-medium",
								children: s.key
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("mt-0.5 text-[11px] font-mono", isActive ? "text-primary" : "text-muted-foreground"),
								children: [isActive && "▸ ", s.model]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10.5px] font-mono text-muted-foreground shrink-0",
							children: r.elapsed ?? "—"
						})]
					}),
					isActive && !isAuth && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 h-1 rounded-full bg-muted overflow-hidden shimmer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full w-2/5 bg-primary rounded-full" })
					})
				]
			}, s.n);
		})]
	}), authActive && !authorized && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: {
			opacity: 0,
			y: 6
		},
		animate: {
			opacity: 1,
			y: 0
		},
		className: "mt-4 rounded-md border border-warning/40 bg-warning/[0.06] p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[12px] font-medium",
				children: "Requires your authorization"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[11px] text-muted-foreground",
				children: "Only stage that leaves your systems — uploads the signed package to Baowu/Ansteel."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: onAuthorize,
				className: "mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-warning text-[oklch(0.14_0.02_220)] text-[12px] font-medium hover:brightness-110 transition",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" }), " Authorize & send"]
			})
		]
	})] });
}
function NewSubmission() {
	const fileInputRef = (0, import_react.useRef)(null);
	const [file, setFile] = (0, import_react.useState)(null);
	const [dragOver, setDragOver] = (0, import_react.useState)(false);
	const [submitted, setSubmitted] = (0, import_react.useState)(false);
	const [authorized, setAuthorized] = (0, import_react.useState)(false);
	const canSubmit = !!file && !submitted;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		crumb: "New submission",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			n: "04",
			zh: "新建",
			title: "Get real data in — with guardrails",
			subtitle: "Upload a document — obviously-wrong uploads get rejected before any paid model call runs."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid lg:grid-cols-[1.4fr_1fr] gap-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: fileInputRef,
							type: "file",
							className: "hidden",
							accept: ".pdf,.csv,.xlsx,.png,.jpg,.jpeg",
							onChange: (e) => setFile(e.target.files?.[0] ?? null)
						}),
						file ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExtractedInvoiceCard, {
							fileName: file.name,
							fileSizeLabel: `${(file.size / 1024).toFixed(0)} KB`,
							locked: submitted,
							onRemove: () => {
								setFile(null);
								if (fileInputRef.current) fileInputRef.current.value = "";
							}
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							onClick: () => fileInputRef.current?.click(),
							onDragOver: (e) => {
								e.preventDefault();
								setDragOver(true);
							},
							onDragLeave: () => setDragOver(false),
							onDrop: (e) => {
								e.preventDefault();
								setDragOver(false);
								const dropped = e.dataTransfer.files?.[0];
								if (dropped) setFile(dropped);
							},
							className: cn("mt-3 rounded-xl border-2 border-dashed p-8 text-center transition cursor-pointer", dragOver ? "border-primary bg-primary/[0.08]" : "border-primary/30 bg-primary/[0.04] hover:bg-primary/[0.08]"),
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
									onClick: (e) => {
										e.stopPropagation();
										fileInputRef.current?.click();
									},
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
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						y: 8
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: { delay: .05 },
					className: "panel p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "h-3.5 w-3.5 text-carbon" }), " 2 · Sensor data · optional"]
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
				})]
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
							children: submitted ? "Pipeline · live" : "Ready to submit"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-1 text-lg font-semibold tracking-tight",
							children: submitted ? "Processing your submission" : "Pipeline preview"
						}),
						!submitted && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[12px] text-muted-foreground",
							children: "Upload a document and hit Submit to start the six-stage pipeline — it stays idle until then."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipelineTracker, {
								running: submitted,
								authorized,
								onAuthorize: () => setAuthorized(true)
							})
						}),
						!submitted && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-1 hairline" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 space-y-1.5 text-[11.5px] font-mono",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									k: "Tonnage",
									v: "1,240 t / yr"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									k: "Sensor",
									v: "attached · 30 d"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								disabled: !canSubmit,
								onClick: () => setSubmitted(true),
								className: cn("mt-5 w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-md text-[13.5px] font-medium transition", canSubmit ? "bg-primary text-primary-foreground teal-glow hover:brightness-110" : "bg-muted text-muted-foreground cursor-not-allowed"),
								children: ["Submit ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2.5 flex items-start gap-1.5 text-[11px] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5 text-carbon shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: file ? "Resumable — a failed stage never re-bills finished work." : "Upload a document above to enable submit." })]
							})
						] }),
						submitted && authorized && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 rounded-md border border-carbon/30 bg-carbon/5 p-3 flex items-start gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-carbon shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[12px] text-muted-foreground",
								children: ["Submitted to Upstream. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/",
									className: "text-primary hover:underline",
									children: "Back to dashboard →"
								})]
							})]
						})
					]
				})
			})]
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
