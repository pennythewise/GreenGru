import { a as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { A as CircleDot, B as ArrowRight, O as Cpu, P as Check, _ as LoaderCircle, a as TriangleAlert, c as ShieldCheck, k as Circle, t as Zap } from "../_libs/lucide-react.mjs";
import { a as cn, i as PageHeader, t as AppShell } from "./AppShell-DTZVPjM9.mjs";
import { o as pipelineStages } from "./dashboard-data-CJ7yUhCJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pipeline-Cjo8uqd2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Pipeline() {
	const [authorized, setAuthorized] = (0, import_react.useState)(false);
	const active = pipelineStages.find((s) => s.status === "active");
	const authStage = pipelineStages[5];
	const complete = authorized;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		crumb: "Pipeline",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				n: "05",
				zh: "流水线",
				title: "Six stages · legible while it runs",
				subtitle: "Every stage persists before the next starts. A DashScope timeout never re-bills finished work.",
				right: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-carbon/30 bg-carbon/5 text-[11.5px] font-mono",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-carbon pulse-dot" }), " LIVE · resumable"]
				})
			}),
			!complete && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				initial: {
					opacity: 0,
					y: 6
				},
				animate: {
					opacity: 1,
					y: 0
				},
				className: "rounded-xl border border-warning/40 bg-warning/[0.08] p-4 flex items-start gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5 text-warning shrink-0 mt-0.5" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[13.5px] font-medium",
							children: "We need you to confirm one detail"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-0.5 text-[12.5px] text-muted-foreground",
							children: "Classifier confidence 61% on Flash pass · your route hint disagrees. Never a silent override."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/entry",
						className: "shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-warning/15 text-warning border border-warning/40 text-[12px] font-medium hover:bg-warning/25 transition",
						children: ["Resolve ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3.5 w-3.5" })]
					})
				]
			}),
			complete ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				initial: {
					opacity: 0,
					y: 8
				},
				animate: {
					opacity: 1,
					y: 0
				},
				className: "panel-lift p-8 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "inline-flex h-12 w-12 items-center justify-center rounded-full bg-carbon/15 text-carbon carbon-glow mx-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
							className: "h-6 w-6",
							strokeWidth: 3
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-4 text-[22px] font-semibold tracking-tight",
						children: "Submitted to Upstream"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[13px] text-muted-foreground",
						children: "Sent to Baowu/Ansteel partner system at 09:52:14 CST · package S-0417 · 6 stages · 4.2 s total."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 flex items-center justify-center gap-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-[13px] font-medium teal-glow hover:brightness-110 transition",
							children: ["Back to dashboard ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
						})
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid lg:grid-cols-[1.4fr_1fr] gap-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "h-3.5 w-3.5 text-teal" }), " Stage tracker · S-0417"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "relative pl-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute left-[15px] top-2 bottom-2 w-px bg-border",
							"aria-hidden": true
						}), pipelineStages.map((s, i) => {
							const done = s.status === "done";
							const isActive = s.status === "active";
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
								transition: { delay: i * .06 },
								className: "relative pl-8 pb-6 last:pb-0",
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
														className: "text-[10.5px] font-mono text-muted-foreground",
														children: ["STAGE ", s.n]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-[10.5px] font-mono text-muted-foreground/70",
														children: ["· ", s.zh]
													}),
													isAuth && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-[10px] font-mono text-warning inline-flex items-center gap-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3 w-3" }), " operator confirm"]
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-0.5 text-[14px] font-medium",
												children: s.key
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: cn("mt-1 text-[12px] font-mono", isActive ? "text-primary" : "text-muted-foreground"),
												children: [isActive && "▸ ", s.model]
											})
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] font-mono text-muted-foreground shrink-0",
											children: s.elapsed ?? "—"
										})]
									}),
									isActive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 h-1 rounded-full bg-muted overflow-hidden shimmer",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full w-2/5 bg-primary rounded-full" })
									}),
									isAuth && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 rounded-md border border-warning/40 bg-warning/[0.06] p-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[12px] font-medium",
												children: "Requires your authorization"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-[11.5px] text-muted-foreground",
												children: "This is the only stage that leaves your systems — it uploads the signed package to the Baowu/Ansteel partner API."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => setAuthorized(true),
												className: "mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-warning text-[oklch(0.14_0.02_220)] text-[12px] font-medium hover:brightness-110 transition",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" }), " Authorize & send"]
											})
										]
									})
								]
							}, s.n);
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground",
									children: "Current stage detail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cpu, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[15px] font-medium",
										children: active?.key
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 text-[12.5px] font-mono text-primary",
									children: ["▸ ", active?.model]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 grid grid-cols-2 gap-2 text-[11.5px] font-mono",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
											k: "Region",
											v: "Beijing"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
											k: "Thinking mode",
											v: "off"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
											k: "Cache hit",
											v: "82%"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
											k: "Tokens so far",
											v: "4,120"
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground",
									children: "Resumability"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 text-[13px]",
									children: [
										"Every stage persists its output ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-carbon",
											children: "before"
										}),
										" the next starts."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
									className: "mt-3 space-y-1.5 text-[12px] text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-start gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleDot, { className: "h-3 w-3 mt-0.5 text-carbon shrink-0" }), " A DashScope timeout resumes from the last completed stage."]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-start gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleDot, { className: "h-3 w-3 mt-0.5 text-carbon shrink-0" }), " Finished work is never re-billed."]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-start gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleDot, { className: "h-3 w-3 mt-0.5 text-carbon shrink-0" }), " Manual confirm pauses at the last checkpoint."]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setAuthorized(true),
							disabled: !authStage,
							className: "w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-md border border-border bg-surface text-[13px] font-medium hover:bg-surface-2 transition",
							children: ["Skip ahead (demo) ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
						})
					]
				})]
			})
		]
	});
}
function MiniStat({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-surface p-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-muted-foreground uppercase text-[10px] tracking-wider",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-0.5 text-foreground",
			children: v
		})]
	});
}
//#endregion
export { Pipeline as component };
