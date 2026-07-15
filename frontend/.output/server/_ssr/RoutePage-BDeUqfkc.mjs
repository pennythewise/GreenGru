import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { B as ArrowRight, I as BookOpen, M as CircleAlert, O as Download, P as Check, T as FileText, i as Upload, l as Radio, r as WandSparkles, x as Info } from "../_libs/lucide-react.mjs";
import { a as cn, i as PageHeader, n as CitationFooter, t as AppShell } from "./AppShell-DRknCBhl.mjs";
import { a as gaps, d as routeStrip, n as docChecklists, t as advisoryCards, u as routePages } from "./dashboard-data-CiWeEW_G.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/RoutePage-BDeUqfkc.js
var import_jsx_runtime = require_jsx_runtime();
function Checklist({ slug }) {
	const c = docChecklists[slug];
	const done = c.items.filter((i) => i.done).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5 text-teal" }), " Section A · Document intake"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-[11.5px] font-mono",
					children: [
						done,
						" of ",
						c.items.length,
						" collected"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-1 text-[15px] font-semibold tracking-tight",
				children: c.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[11.5px] text-muted-foreground italic",
				children: "Deterministic checklist — no model call. Missing rows block Section B."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 h-1.5 rounded-full bg-muted overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full bg-carbon",
					style: { width: `${done / c.items.length * 100}%` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 divide-y divide-border",
				children: c.items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "py-2.5 flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0", it.done ? "bg-carbon/15 text-carbon" : "bg-muted/60 text-muted-foreground border border-dashed border-border"),
							children: it.done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
								className: "h-3.5 w-3.5",
								strokeWidth: 3
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-current" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("flex-1 text-[13px]", !it.done && "text-muted-foreground"),
							children: it.name
						}),
						it.done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10.5px] font-mono text-carbon",
							children: "✓ done"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "inline-flex items-center gap-1 text-[11.5px] font-mono text-primary hover:brightness-125",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-3 w-3" }), " Upload"]
						})
					]
				}, it.name))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 pt-3 border-t border-border flex items-center gap-1.5 text-[10.5px] font-mono text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-3 w-3" }),
					" ",
					c.kb
				]
			})
		]
	});
}
function StageStrip({ kb }) {
	const stages = routeStrip(kb);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "h-3.5 w-3.5 text-teal" }), " Section B · Route pipeline"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-4 grid grid-cols-2 md:grid-cols-5 gap-3",
				children: stages.map((s) => {
					const done = s.status === "done";
					const active = s.status === "active";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: cn("rounded-lg border p-3 relative", done && "border-carbon/40 bg-carbon/[0.06]", active && "border-primary/50 bg-primary/[0.08] teal-glow", !done && !active && "border-border bg-surface/50"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: cn("text-[10px] font-mono", done ? "text-carbon" : active ? "text-primary" : "text-muted-foreground"),
									children: [
										active && "▸ ",
										"STAGE ",
										s.n
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-mono text-muted-foreground",
									children: s.elapsed ?? "—"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-[13px] font-medium",
								children: s.key
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] font-mono text-muted-foreground",
								children: s.zh
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: cn("mt-2 text-[10.5px] font-mono leading-snug", active ? "text-primary" : "text-muted-foreground"),
								children: s.method
							})
						]
					}, s.n);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-[11.5px] text-muted-foreground italic",
				children: "Pull factory data reads the same live bus as the Dashboard's factory panel — never a second source."
			})
		]
	});
}
function ScoreGauge({ value, grade }) {
	const angle = -90 + Math.max(0, Math.min(100, value)) / 100 * 180;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative w-[220px] h-[120px] mx-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 200 110",
			className: "w-full h-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "rpg",
					x1: "0",
					x2: "1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0",
							stopColor: "var(--color-danger)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0.5",
							stopColor: "var(--color-warning)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "1",
							stopColor: "var(--color-carbon)"
						})
					]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M 15 100 A 85 85 0 0 1 185 100",
					fill: "none",
					stroke: "url(#rpg)",
					strokeWidth: "12",
					strokeLinecap: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					transform: `rotate(${angle} 100 100)`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "100",
						y1: "100",
						x2: "100",
						y2: "35",
						stroke: "var(--color-gold)",
						strokeWidth: "2.5",
						strokeLinecap: "round"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "100",
						cy: "100",
						r: "5",
						fill: "var(--color-gold)"
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute inset-x-0 bottom-0 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-[26px] font-semibold text-gold leading-none",
				children: grade
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-[10.5px] font-mono text-muted-foreground mt-0.5",
				children: [value, " / 100"]
			})]
		})]
	});
}
function RoutePage({ slug }) {
	const cfg = routePages[slug];
	const advice = advisoryCards[slug];
	const gapList = gaps[slug];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		crumb: cfg.label,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				n: cfg.n,
				zh: cfg.zh,
				title: cfg.title,
				subtitle: cfg.subtitle,
				right: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-carbon/30 bg-carbon/5 text-[11.5px] font-mono",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-carbon pulse-dot" }), " Submit-ready"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checklist, { slug }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StageStrip, { kb: cfg.kb }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid lg:grid-cols-2 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						y: 8
					},
					animate: {
						opacity: 1,
						y: 0
					},
					className: "panel-lift p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5 text-teal" }), " Section C · Report preview"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[10.5px] font-mono text-carbon inline-flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-carbon" }), " deterministic"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-2 text-[17px] font-semibold tracking-tight",
							children: cfg.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11.5px] font-mono text-muted-foreground",
							children: [
								cfg.scoreLabel,
								" · ",
								cfg.scoreValue
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 rounded-lg border border-border bg-surface/40 p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreGauge, {
								value: cfg.gauge,
								grade: cfg.scoreGrade
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-mono uppercase tracking-wider text-muted-foreground",
								children: "Gap list"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 space-y-1.5",
								children: gapList.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-start gap-2 text-[12.5px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-3.5 w-3.5 text-warning shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: g })]
								}, g))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-[12.5px] font-medium teal-glow hover:brightness-110 transition",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Download PDF"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10.5px] font-mono text-muted-foreground",
								children: "Available before Advisory finishes."
							})]
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
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WandSparkles, { className: "h-3.5 w-3.5 text-gold" }), " Section C · Advisory"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10.5px] font-mono text-muted-foreground",
								children: "non-blocking · optional follow-up"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-2",
							children: advice.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-lg border border-border bg-surface/50 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[13px] font-medium",
											children: a.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "shrink-0 text-[10.5px] font-mono px-1.5 py-0.5 rounded bg-gold/15 text-gold border border-gold/30",
											children: [
												a.impact,
												" ",
												cfg.advisoryImpactUnit
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
										className: "mt-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
											className: "text-[11.5px] font-mono text-muted-foreground cursor-pointer hover:text-foreground",
											children: "Why?"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1.5 text-[11.5px] text-muted-foreground leading-relaxed",
											children: a.why
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("text-[10.5px] font-mono px-1.5 py-0.5 rounded border", a.status.startsWith("Implemented") ? "bg-carbon/10 text-carbon border-carbon/30" : "bg-muted/60 text-muted-foreground border-border"),
											children: a.status
										})
									})
								]
							}, a.title))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex items-start gap-2 text-[11px] text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-3.5 w-3.5 mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "The SME can act on the left panel alone — advisory is optional." })]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "text-[12.5px] font-mono text-muted-foreground hover:text-foreground inline-flex items-center gap-1",
					children: "← Back to dashboard"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/new",
					className: "text-[12.5px] font-mono text-primary inline-flex items-center gap-1",
					children: ["Go to new submission ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3.5 w-3.5" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CitationFooter, { extra: cfg.citations })
		]
	});
}
//#endregion
export { RoutePage as t };
