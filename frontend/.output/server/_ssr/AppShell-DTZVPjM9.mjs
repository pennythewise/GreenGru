import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { F as Building2, L as Banknote, T as FileCheckCorner, h as LogOut, i as Upload, n as Workflow, p as MessagesSquare, u as Radio, v as Leaf, x as Gauge } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AppShell-DTZVPjM9.js
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var nav = [
	{
		to: "/",
		icon: Gauge,
		label: "Dashboard",
		zh: "总览",
		n: "02"
	},
	{
		to: "/entry",
		icon: MessagesSquare,
		label: "Ask GreenGru",
		zh: "入口",
		n: "03"
	},
	{
		to: "/new",
		icon: Upload,
		label: "New submission",
		zh: "新建",
		n: "04"
	},
	{
		to: "/pipeline",
		icon: Workflow,
		label: "Pipeline",
		zh: "流水线",
		n: "05"
	},
	{
		to: "/passport",
		icon: FileCheckCorner,
		label: "EU license",
		zh: "碳护照",
		n: "06"
	},
	{
		to: "/loan",
		icon: Banknote,
		label: "Loan",
		zh: "贷款",
		n: "07"
	},
	{
		to: "/grant",
		icon: Leaf,
		label: "Grant",
		zh: "补贴",
		n: "08"
	}
];
function LangToggle() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "inline-flex items-center rounded-md border border-border bg-surface p-0.5 text-[11px] font-mono",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			className: "px-2 py-0.5 rounded-sm bg-foreground text-background",
			children: "EN"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			className: "px-2 py-0.5 rounded-sm text-muted-foreground hover:text-foreground",
			children: "中文"
		})]
	});
}
function Sidebar() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-surface/60 backdrop-blur-xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "px-5 py-5 border-b border-border block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-9 w-9 rounded-lg flex items-center justify-center teal-glow",
							style: { background: "var(--gradient-teal)" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-[18px] font-bold text-[oklch(0.14_0.02_220)]",
								children: "G"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-carbon pulse-dot" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[13px] font-semibold tracking-tight leading-tight",
						children: "GreenGru"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10.5px] text-muted-foreground font-mono tracking-wider",
						children: "MVP · v1.0"
					})] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex-1 px-3 py-4 space-y-0.5 overflow-y-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-2 pb-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-mono",
					children: "SME operator"
				}), nav.map((it) => {
					const active = it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: it.to,
						className: cn("w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors group", active ? "bg-primary/10 text-foreground border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-surface-2 border border-transparent"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("font-mono text-[10px] w-5 shrink-0", active ? "text-primary" : "text-muted-foreground/70"),
								children: it.n
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(it.icon, {
								className: "h-4 w-4",
								strokeWidth: 2
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 text-left",
								children: it.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-mono text-muted-foreground/70",
								children: it.zh
							})
						]
					}, it.to);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-3 border-t border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-[11px] font-mono text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-carbon pulse-dot" }), "BEIJING · DASHSCOPE"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1.5 text-[11.5px] text-muted-foreground leading-snug",
						children: "Your data stays on Beijing-region infrastructure."
					})]
				})
			})
		]
	});
}
function TopBar({ crumb }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex items-center justify-between gap-4 px-6 py-3.5 border-b border-border bg-background/70 backdrop-blur-xl sticky top-0 z-20",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-3 min-w-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hidden md:flex items-center gap-2 text-[11px] font-mono text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "BAOWU × HENGFENG" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-border",
						children: "/"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-foreground",
						children: crumb ?? "Command Center"
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LangToggle, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-surface text-[11px] font-mono text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "h-3 w-3 text-carbon" }), " qc-ops@hengfeng.cn"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-2 transition text-[12px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5" })
				})
			]
		})]
	});
}
function PageHeader({ n, title, zh, subtitle, right }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: {
			opacity: 0,
			y: 6
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: { duration: .35 },
		className: "flex items-start justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-primary",
							children: n
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-border",
							children: "·"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: zh })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 text-[26px] md:text-[30px] font-semibold tracking-tight leading-[1.1]",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1.5 text-[13.5px] text-muted-foreground max-w-2xl italic",
					children: subtitle
				})
			]
		}), right]
	});
}
function CitationFooter({ extra }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "pt-2 flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-mono text-muted-foreground border-t border-border/60",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Cited: IR (EU) 2025/2621 · Reg (EU) 2023/956 · CISA · PBOC · 工信部联节〔2026〕13号", extra ? ` · ${extra}` : ""] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "© GreenGru · Beijing-region infra" })]
	});
}
function AppShell({ crumb, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen flex text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 min-w-0 flex flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, { crumb }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 p-4 md:p-8 space-y-6 max-w-[1400px] w-full mx-auto",
				children
			})]
		})]
	});
}
//#endregion
export { cn as a, PageHeader as i, CitationFooter as n, LangToggle as r, AppShell as t };
