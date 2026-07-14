import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link, v as ClientOnly } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { A as CircleDot, B as ArrowRight, E as Factory, L as Banknote, M as CircleAlert, N as ChevronRight, R as BadgeCheck, d as Plus, j as CircleCheck, s as Ship, t as Zap, v as Leaf, w as FileText, z as ArrowUpRight } from "../_libs/lucide-react.mjs";
import { a as cn, i as PageHeader, n as CitationFooter, t as AppShell } from "./AppShell-DTZVPjM9.mjs";
import { c as ratioSliders, i as factorySync, l as routeGrades, m as tierGauge, p as submissions, r as emissionsBreakdown, s as processMatrix } from "./dashboard-data-CJ7yUhCJ.mjs";
import { i as ResponsiveContainer, n as Pie, r as Cell, t as PieChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-By-b2NHT.js
var import_jsx_runtime = require_jsx_runtime();
function GradeCard({ r }) {
	const gradeTone = r.tone === "carbon" ? "text-carbon border-carbon/40 bg-carbon/10" : r.tone === "warning" ? "text-warning border-warning/40 bg-warning/10" : "text-gold border-gold/40 bg-gold/10";
	const routeHref = r.key === "loan" ? "/loan" : r.key === "grant" ? "/grant" : "/passport";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: {
			opacity: 0,
			y: 8
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: { duration: .35 },
		className: "panel p-5 relative overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground",
					children: r.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] font-mono text-muted-foreground/70",
					children: r.zh
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("inline-flex h-14 w-14 items-center justify-center rounded-xl border font-display font-bold text-[32px] leading-none", gradeTone),
					children: r.grade
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 text-[13px] font-medium",
				children: r.status
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-[11.5px] font-mono text-muted-foreground",
				children: r.gapLabel
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 pt-3 border-t border-border flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10.5px] font-mono text-muted-foreground truncate pr-2",
					children: r.kb
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: routeHref,
					className: "text-primary hover:brightness-125 text-[11.5px] font-mono inline-flex items-center gap-1",
					children: ["Open ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3 w-3" })]
				})]
			})
		]
	});
}
function RatioSlider({ s }) {
	const pct = Math.min(100, s.value / (s.target * 1.25) * 100);
	const targetPct = Math.min(100, s.target / (s.target * 1.25) * 100);
	const good = s.value >= s.target;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-baseline justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[12.5px]",
			children: s.label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ml-1.5 text-[10.5px] font-mono text-muted-foreground/80",
			children: s.zh
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "font-mono text-[13px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: good ? "text-carbon" : "text-warning",
				children: [s.value.toFixed(1), s.unit]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-muted-foreground/70",
				children: [
					" / ",
					s.target,
					s.unit
				]
			})]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 h-2 rounded-full bg-muted/60 relative overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("absolute inset-y-0 left-0 rounded-full", good ? "bg-carbon" : "bg-warning"),
			style: { width: `${pct}%` }
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute top-0 bottom-0 w-px bg-foreground/50",
			style: { left: `${targetPct}%` }
		})]
	})] });
}
function TierGauge() {
	const angle = -90 + tierGauge.value / 100 * 180;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative w-[240px] h-[130px] mx-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 200 110",
			className: "w-full h-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "arcG",
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
					stroke: "url(#arcG)",
					strokeWidth: "14",
					strokeLinecap: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					transform: `rotate(${angle} 100 100)`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "100",
						y1: "100",
						x2: "100",
						y2: "30",
						stroke: "var(--color-gold)",
						strokeWidth: "2.5",
						strokeLinecap: "round"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "100",
						cy: "100",
						r: "6",
						fill: "var(--color-gold)"
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute inset-x-0 bottom-0 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-[28px] font-semibold text-gold leading-none",
				children: tierGauge.value
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-[10.5px] font-mono text-muted-foreground mt-0.5",
				children: [
					tierGauge.label,
					" · ",
					tierGauge.zh,
					" ",
					tierGauge.nextTier
				]
			})]
		})]
	});
}
function MatrixCell({ s }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("inline-block h-3.5 w-3.5 rounded-sm", s === "ok" ? "bg-carbon/70" : s === "warn" ? "bg-warning/80" : "bg-danger/80") });
}
function FactorySceneFallback() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-[400px] rounded-lg border border-border bg-surface/40 flex items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px] font-mono text-muted-foreground animate-pulse",
			children: "Loading 3D factory floor · 工厂实时加载中…"
		})
	});
}
function StatusPill({ s }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] font-mono border", {
			Signed: "bg-carbon/10 text-carbon border-carbon/30",
			"Needs input": "bg-warning/10 text-warning border-warning/40"
		}[s] ?? "bg-muted text-muted-foreground border-border"),
		children: [
			s === "Signed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "h-3 w-3" }),
			s === "Needs input" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-3 w-3" }),
			s
		]
	});
}
function Dashboard() {
	const routeIcon = (r) => r === "Loan" ? Banknote : r === "Grant" ? Leaf : Ship;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		crumb: "Dashboard",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				n: "02",
				zh: "总览",
				title: "One glance across all three routes",
				subtitle: "Loan, grant, and CBAM read the same way — plus a live pull from the factory that generates the data.",
				right: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/entry",
					className: "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary text-primary-foreground text-[13px] font-medium teal-glow hover:brightness-110 transition",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Ask GreenGru"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid md:grid-cols-3 gap-4",
				children: routeGrades.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GradeCard, { r }, r.key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid lg:grid-cols-3 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleDot, { className: "h-3.5 w-3.5 text-gold" }), " Distance to next tier"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TierGauge, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 text-[11.5px] text-muted-foreground text-center",
								children: [
									"32 pts to unlock ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-carbon",
										children: "Tier B — 深绿"
									}),
									" on the grant rubric."
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel p-5 space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "h-3.5 w-3.5 text-teal" }), " Grant rubric levers"]
							}),
							ratioSliders.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RatioSlider, { s }, s.key)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "pt-1 text-[11px] text-muted-foreground",
								children: "Solid marker = current · thin line = rubric floor. Only two levers stand between C and B."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5 text-carbon" }), " Emissions source split"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 h-[140px]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PieChart, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
									data: emissionsBreakdown,
									dataKey: "value",
									innerRadius: 40,
									outerRadius: 62,
									paddingAngle: 2,
									strokeWidth: 0,
									children: emissionsBreakdown.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: e.color }, e.key))
								}) }) })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 space-y-1 text-[11.5px] font-mono",
								children: emissionsBreakdown.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "h-2 w-2 rounded-sm",
											style: { background: e.color }
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: e.label
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [e.value, "%"] })]
								}, e.key))
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid lg:grid-cols-[1.15fr_1fr] gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5 text-teal" }), " Process-stage matrix · 工序审计"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10.5px] font-mono text-muted-foreground",
								children: "CISA · Operational Process Boundary"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-[12.5px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 pr-3 text-left",
											children: "Stage"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 px-2 text-center",
											children: "Energy"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 px-2 text-center",
											children: "Intensity"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 px-2 text-center",
											children: "Metering"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 px-2 text-center",
											children: "Audit"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: processMatrix.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border last:border-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "py-2.5 pr-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-medium",
												children: row.stage
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[10px] font-mono text-muted-foreground",
												children: row.zh
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2.5 px-2 text-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatrixCell, { s: row.energy })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2.5 px-2 text-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatrixCell, { s: row.intensity })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2.5 px-2 text-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatrixCell, { s: row.metering })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2.5 px-2 text-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatrixCell, { s: row.audit })
										})
									]
								}, row.stage)) })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex items-center gap-3 text-[10.5px] font-mono text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2.5 w-2.5 rounded-sm bg-carbon/70" }), " ok"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2.5 w-2.5 rounded-sm bg-warning/80" }), " attention"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2.5 w-2.5 rounded-sm bg-danger/80" }), " hotspot"]
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Factory, { className: "h-3.5 w-3.5 text-teal" }), " Simulated factory floor · 工厂实时"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1 text-[10.5px] font-mono text-carbon",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-carbon pulse-dot" }), " live"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, { fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactorySceneFallback, {}) })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 pt-3 border-t border-border text-[11px] font-mono text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								"Last sync ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-foreground",
									children: factorySync.lastSync
								}),
								" · deterministic threshold-watch, no model call."
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1",
								children: ["Feeds → ", factorySync.downstream.join(" · ")]
							})]
						})
					]
				})]
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
				transition: {
					delay: .1,
					duration: .4
				},
				className: "panel p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5 text-teal" }), " Your submissions"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-1 text-base font-semibold tracking-tight",
							children: "One page per confirmed route"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[11px] font-mono text-muted-foreground",
							children: [submissions.length, " of 47"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto -mx-5 px-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-[13px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "text-left text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3",
										children: "Route"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3",
										children: "Descriptor"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3 text-right",
										children: "Tonnes"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3",
										children: "Tier"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3",
										children: "Grade"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3",
										children: "Status"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3",
										children: "Date"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "py-2 pr-0" })
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "font-mono",
								children: submissions.map((s) => {
									const RIcon = routeIcon(s.route);
									const href = s.route === "Loan" ? "/loan" : s.route === "Grant" ? "/grant" : "/passport";
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-b border-border last:border-0 hover:bg-surface-2/60 transition group cursor-pointer",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-3 pr-3",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "inline-flex items-center gap-1.5 text-[11.5px] px-1.5 py-0.5 rounded border border-border bg-surface",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RIcon, { className: "h-3 w-3 text-teal" }),
														" ",
														s.route
													]
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-3 pr-3 text-muted-foreground font-sans",
												children: [s.desc, s.cn !== "—" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "ml-2 text-[10.5px] font-mono text-muted-foreground/70",
													children: ["CN ", s.cn]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-3 pr-3 text-right",
												children: s.tons ? s.tons.toLocaleString() : "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-3 pr-3",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: cn("text-[10.5px] font-mono px-1.5 py-0.5 rounded border", s.tier === "Exposed" && "bg-warning/10 text-warning border-warning/30", s.tier === "High" && "bg-danger/10 text-danger border-danger/30", s.tier === "Marginal" && "bg-warning/10 text-warning border-warning/30", s.tier === "Low-risk" && "bg-carbon/10 text-carbon border-carbon/30", s.tier === "Tier 2" && "bg-teal/10 text-teal border-teal/30"),
													children: s.tier
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-3 pr-3",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: cn("inline-flex h-6 w-6 items-center justify-center rounded font-semibold text-[11px]", s.grade === "B" && "bg-carbon/15 text-carbon", s.grade === "C" && "bg-gold/15 text-gold", s.grade === "D" && "bg-danger/15 text-danger"),
													children: s.grade
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-3 pr-3",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: href,
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { s: s.status })
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-3 pr-3 text-muted-foreground",
												children: s.date
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-3 pr-0 text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4 text-muted-foreground group-hover:text-primary transition inline" })
											})
										]
									}, s.id);
								})
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-center justify-between text-[11px] font-mono text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["First time? ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/entry",
							className: "text-primary hover:underline",
							children: "Ask GreenGru →"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/pipeline",
							className: "flex items-center gap-1 hover:text-foreground transition",
							children: ["View live pipeline ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3 w-3" })]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CitationFooter, { extra: "PBOC 2025 Green Finance Catalogue · GB/T 36132" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pb-2 flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-3 w-3" }), " Distributed via Baowu / Ansteel supplier program"]
			})
		]
	});
}
var SplitComponent = Dashboard;
//#endregion
export { SplitComponent as component };
