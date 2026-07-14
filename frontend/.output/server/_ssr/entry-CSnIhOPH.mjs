import { a as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { B as ArrowRight, L as Banknote, R as BadgeCheck, f as Paperclip, l as Send, o as Sparkles, p as MessagesSquare, s as Ship, v as Leaf } from "../_libs/lucide-react.mjs";
import { a as cn, i as PageHeader, n as CitationFooter, t as AppShell } from "./AppShell-DTZVPjM9.mjs";
import { f as routerOutput } from "./dashboard-data-CJ7yUhCJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/entry-CSnIhOPH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var chips = [
	{
		key: "loan",
		label: "贷款 · Loan",
		icon: Banknote
	},
	{
		key: "grant",
		label: "补贴 · Grant",
		icon: Leaf
	},
	{
		key: "passport",
		label: "CBAM · EU license",
		icon: Ship
	}
];
function Entry() {
	const [selected, setSelected] = (0, import_react.useState)(() => Object.fromEntries(routerOutput.map((r) => [r.key, r.preSelected])));
	const confirmedCount = Object.values(selected).filter(Boolean).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		crumb: "Ask GreenGru",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				n: "03",
				zh: "入口",
				title: "Ask GreenGru what you need",
				subtitle: "Type it, tap a chip, or upload — the router picks the applicable route(s). You always confirm before anything runs."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid lg:grid-cols-[1.15fr_1fr] gap-5",
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
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessagesSquare, { className: "h-3.5 w-3.5 text-teal" }), " Ask GreenGru"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "max-w-[75%] rounded-2xl rounded-tl-sm border border-border bg-surface px-3.5 py-2.5 text-[13px]",
								children: "Hi — I'm GreenGru. Tell me what you need and I'll route it. You can tap a chip below."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-primary/15 border border-primary/30 px-3.5 py-2.5 text-[13px]",
								children: "We want a green loan for a metering upgrade, and we're applying for the zero-carbon factory grant this year."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: chips.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-mono hover:border-primary/40 hover:bg-primary/[0.06] transition",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(c.icon, { className: "h-3.5 w-3.5 text-teal" }),
									" ",
									c.label
								]
							}, c.key))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "h-4 w-4 text-muted-foreground" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									placeholder: "Describe your goal · 描述目标…",
									className: "flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/70"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium teal-glow hover:brightness-110 transition",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-3.5 w-3.5" }), " Send"]
								})
							]
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
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-gold" }), " Router output · confirm the route"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10.5px] font-mono text-muted-foreground",
								children: "qwen-flash · confidence floor 0.70"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-2",
							children: routerOutput.map((r) => {
								const on = selected[r.key];
								const above = r.conf >= .7;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: cn("rounded-lg border p-3 cursor-pointer transition", on ? "border-primary/50 bg-primary/[0.08]" : "border-border bg-surface/50 hover:bg-surface-2"),
									onClick: () => setSelected((prev) => ({
										...prev,
										[r.key]: !prev[r.key]
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: cn("h-4 w-4 rounded border flex items-center justify-center", on ? "bg-primary border-primary" : "border-border"),
												children: on && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "h-3 w-3 text-primary-foreground" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[13px] font-medium",
												children: r.label
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: cn("text-[10.5px] font-mono px-1.5 py-0.5 rounded border", above ? "bg-carbon/10 text-carbon border-carbon/30" : "bg-warning/10 text-warning border-warning/30"),
											children: [Math.round(r.conf * 100), "%"]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1.5 text-[11.5px] text-muted-foreground pl-6",
										children: r.reason
									})]
								}, r.key);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "text-[12px] font-mono text-muted-foreground hover:text-foreground",
								children: "Edit"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/new",
								className: "inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-[12.5px] font-medium teal-glow hover:brightness-110 transition",
								children: [
									"Confirm ",
									confirmedCount,
									" route",
									confirmedCount === 1 ? "" : "s",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3.5 w-3.5" })
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-[11px] text-muted-foreground italic",
							children: "Never a silent override. Each confirmed route opens its own page after New submission."
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CitationFooter, { extra: "PBOC 2025 · GB/T 36132 · Reg (EU) 2023/956" })
		]
	});
}
//#endregion
export { Entry as component };
