import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  Copy,
  ExternalLink,
  Loader2,
  Play,
  Radio,
  Shield,
} from "lucide-react";
import {
  INTEGRATION_BASE_URL,
  INTEGRATION_DEMO_API_KEY,
  tryIntegrationEndpoint,
  type IntegrationTryResult,
} from "@/lib/integration-api";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "intro", label: "简介" },
  { id: "getting-started", label: "快速开始" },
  { id: "concepts", label: "核心概念" },
  { id: "endpoints", label: "接口参考" },
  { id: "webhooks", label: "Webhooks" },
  { id: "scope-mapping", label: "Scope 映射" },
] as const;

type EndpointDef = {
  id: string;
  method: "GET" | "POST";
  path: string;
  title: string;
  titleEn: string;
  description: string;
  curl: string;
  tryPath: string;
  tryMethod?: "GET" | "POST";
  tryBody?: object;
};

const ENDPOINTS: EndpointDef[] = [
  {
    id: "portfolio-summary",
    method: "GET",
    path: "/portfolio/summary",
    title: "组合汇总",
    titleEn: "Portfolio summary",
    description: "宝武/鞍钢租户下所有已接入下游 SME 的 Scope 3 Category 10 汇总（只读聚合）。",
    curl: `curl -X GET "${INTEGRATION_BASE_URL}/portfolio/summary?api_key=${INTEGRATION_DEMO_API_KEY}"`,
    tryPath: "/portfolio/summary",
  },
  {
    id: "list-suppliers",
    method: "GET",
    path: "/suppliers",
    title: "供应商列表",
    titleEn: "List suppliers",
    description: "列出所有下游紧固件/型钢 SME，含 Scope 1+2 摘要与 CBAM 风险分层。",
    curl: `curl -X GET "${INTEGRATION_BASE_URL}/suppliers?api_key=${INTEGRATION_DEMO_API_KEY}"`,
    tryPath: "/suppliers",
  },
  {
    id: "supplier-detail",
    method: "GET",
    path: "/suppliers/{supplier_id}",
    title: "供应商详情",
    titleEn: "Supplier detail",
    description: "单个供应商档案 + 已核验排放明细。示例 ID：SUP-014（宁波恒峰）。",
    curl: `curl -X GET "${INTEGRATION_BASE_URL}/suppliers/SUP-014?api_key=${INTEGRATION_DEMO_API_KEY}"`,
    tryPath: "/suppliers/SUP-014",
  },
  {
    id: "supplier-emissions",
    method: "GET",
    path: "/suppliers/{supplier_id}/emissions",
    title: "Scope 1+2 排放",
    titleEn: "Scope 1+2 emissions",
    description: "按宝武采购吨位核算的 Scope 1（直接）与 Scope 2（间接电力）tCO2e — 用于 Scope 3 盘查。",
    curl: `curl -X GET "${INTEGRATION_BASE_URL}/suppliers/SUP-014/emissions?api_key=${INTEGRATION_DEMO_API_KEY}"`,
    tryPath: "/suppliers/SUP-014/emissions",
  },
  {
    id: "supplier-passport",
    method: "GET",
    path: "/suppliers/{supplier_id}/passport",
    title: "CBAM 护照摘要",
    titleEn: "CBAM passport summary",
    description: "欧盟出口关税暴露与 CISA 等级 — 不含原始发票/装置文件（PRD §10 只读聚合）。",
    curl: `curl -X GET "${INTEGRATION_BASE_URL}/suppliers/SUP-014/passport?api_key=${INTEGRATION_DEMO_API_KEY}"`,
    tryPath: "/suppliers/SUP-014/passport",
  },
  {
    id: "scope3-trend",
    method: "GET",
    path: "/scope3/trend",
    title: "Scope 3 月度趋势",
    titleEn: "Scope 3 monthly trend",
    description: "Category 10 已核验排放年化运行率（tCO2e/yr），对接 ESG 报表系统。",
    curl: `curl -X GET "${INTEGRATION_BASE_URL}/scope3/trend?api_key=${INTEGRATION_DEMO_API_KEY}"`,
    tryPath: "/scope3/trend",
  },
  {
    id: "webhooks",
    method: "POST",
    path: "/webhooks",
    title: "注册 Webhook",
    titleEn: "Register webhook",
    description: "护照核验完成、排放更新、等级变更时推送至宝武内部系统。",
    curl: `curl -X POST "${INTEGRATION_BASE_URL}/webhooks?api_key=${INTEGRATION_DEMO_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://esg.baowu-partners.cn/hooks/greengru","events":["passport.verified","emissions.updated"]}'`,
    tryPath: "/webhooks",
    tryMethod: "POST",
    tryBody: {
      url: "https://esg.baowu-partners.cn/hooks/greengru",
      events: ["passport.verified", "emissions.updated", "supplier.grade_changed"],
    },
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-primary"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "已复制" : "复制"}
    </button>
  );
}

function EndpointCard({ ep }: { ep: EndpointDef }) {
  const [result, setResult] = useState<IntegrationTryResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleTry() {
    setLoading(true);
    const res = await tryIntegrationEndpoint(ep.tryPath, {
      method: ep.tryMethod,
      body: ep.tryBody,
    });
    setResult(res);
    setLoading(false);
  }

  return (
    <div id={ep.id} className="rounded-xl border border-border bg-surface/30 overflow-hidden scroll-mt-24">
      <div className="px-4 py-3 border-b border-border flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "text-[10px] font-mono font-bold px-2 py-0.5 rounded",
            ep.method === "GET" ? "bg-carbon/15 text-carbon" : "bg-gold/15 text-gold",
          )}
        >
          {ep.method}
        </span>
        <code className="text-[12px] font-mono text-teal">{ep.path}</code>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h4 className="text-[15px] font-semibold">{ep.title}</h4>
          <p className="text-[11px] font-mono text-muted-foreground">{ep.titleEn}</p>
          <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">{ep.description}</p>
        </div>
        <div className="rounded-lg border border-border bg-background/60 p-3 relative">
          <div className="absolute top-2 right-2">
            <CopyButton text={ep.curl} />
          </div>
          <pre className="text-[11px] font-mono text-foreground/90 overflow-x-auto whitespace-pre-wrap pr-16">{ep.curl}</pre>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => void handleTry()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-primary/40 bg-primary/10 text-[11px] font-mono text-primary hover:brightness-110 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          试运行（模拟）
        </button>
        {result && (
          <div
            className={cn(
              "rounded-lg border p-3 text-[11px] font-mono",
              result.ok ? "border-carbon/30 bg-carbon/5" : "border-danger/30 bg-danger/5",
            )}
          >
            <div className="text-muted-foreground mb-1">
              HTTP {result.status || "—"} · {result.url}
            </div>
            {result.error && <p className="text-danger mb-2">{result.error}</p>}
            <pre className="overflow-x-auto whitespace-pre-wrap text-foreground/90 max-h-[280px] overflow-y-auto">
              {JSON.stringify(result.body, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiDocumentationArticle() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface/40 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/upstream"
              className="inline-flex items-center gap-1 text-[12px] font-mono text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> 上游总览
            </Link>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-teal" />
              <span className="text-[13px] font-semibold">GreenGru Integration API</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">v1</span>
            </div>
          </div>
          <a
            href={`${INTEGRATION_BASE_URL}/portfolio/summary?api_key=${INTEGRATION_DEMO_API_KEY}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-mono text-teal hover:underline"
          >
            OpenAPI 试运行 <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
        <nav className="hidden lg:block w-44 shrink-0 sticky top-20 self-start">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">目录</p>
          <ul className="space-y-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-[12px] font-mono text-muted-foreground hover:text-primary flex items-center gap-1 py-1"
                >
                  <ChevronRight className="h-3 w-3" /> {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 min-w-0 space-y-10"
        >
          <section id="intro" className="scroll-mt-24">
            <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-teal">Full API Documentation</p>
            <h1 className="mt-2 text-[28px] font-bold tracking-tight leading-tight">
              宝武 / 鞍钢集成 API 完整参考
            </h1>
            <p className="mt-1 text-[14px] text-muted-foreground font-mono">GreenGru Carbon Passport · Scope 3 downstream feed</p>
            <div className="mt-4 rounded-xl border border-primary/25 bg-primary/[0.06] p-4 text-[13.5px] leading-relaxed">
              <p>
                GreenGru Integration API 是一套 <strong>REST API</strong>，供宝武、鞍钢等企业开发者以程序化方式获取
                <strong>下游钢铁加工 SME</strong> 的已核验 <strong>Scope 1 + Scope 2</strong> 排放数据，用于锚定企业的
                <strong> Scope 3 Category 10</strong>（售出产品的加工）温室气体盘查。
              </p>
              <p className="mt-2 text-muted-foreground">
                数据经六阶段确定性流水线计算（非 LLM 生成数值），通过只读聚合接口输出 — 不暴露原始发票、装置级上传文件。
              </p>
            </div>
          </section>

          <section id="getting-started" className="scroll-mt-24 space-y-4">
            <h2 className="text-[18px] font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-teal" /> 快速开始
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-4">
                <p className="text-[10px] font-mono uppercase text-muted-foreground">Base URL</p>
                <code className="mt-1 block text-[12px] font-mono text-teal break-all">{INTEGRATION_BASE_URL}</code>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-[10px] font-mono uppercase text-muted-foreground">Demo API Key</p>
                <code className="mt-1 block text-[12px] font-mono text-gold">{INTEGRATION_DEMO_API_KEY}</code>
              </div>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              认证方式：每个请求通过查询参数传递 <code className="text-teal">api_key</code>（与常见自动化平台模式一致）。
              生产环境由宝武 IT 分配租户密钥，数据留存于 <strong>北京地区</strong> 基础设施。
            </p>
            <div className="rounded-lg border border-border bg-surface/40 p-3">
              <CopyButton
                text={`curl -X GET "${INTEGRATION_BASE_URL}/portfolio/summary?api_key=${INTEGRATION_DEMO_API_KEY}"`}
              />
              <pre className="mt-2 text-[11px] font-mono overflow-x-auto">{`curl -X GET "${INTEGRATION_BASE_URL}/portfolio/summary?api_key=${INTEGRATION_DEMO_API_KEY}"`}</pre>
            </div>
          </section>

          <section id="concepts" className="scroll-mt-24 space-y-4">
            <h2 className="text-[18px] font-semibold flex items-center gap-2">
              <Radio className="h-4 w-4 text-teal" /> 核心概念
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 text-[13px]">
              {[
                ["下游 SME", "螺栓、紧固件、型钢等钢铁深加工企业 — GreenGru 护照服务对象。"],
                ["Scope 1", "直接排放：燃烧、工艺反应（tCO2e）。"],
                ["Scope 2", "间接排放：购入电力，位置法（tCO2e）。"],
                ["Scope 3 Cat.10", "宝武采购并再加工的下游产品排放 — 本 API 的输出目标。"],
                ["碳护照", "CBAM 就绪报告 + 确定性 SEE / 关税暴露。"],
                ["只读聚合", "API 不返回 OCR 原文、发票影像 — 仅核验后的数字与等级。"],
              ].map(([term, def]) => (
                <div key={term} className="rounded-lg border border-border p-3">
                  <span className="font-mono text-[11px] text-primary">{term}</span>
                  <p className="mt-1 text-muted-foreground leading-snug">{def}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="endpoints" className="scroll-mt-24 space-y-4">
            <h2 className="text-[18px] font-semibold flex items-center gap-2">
              <Code2 className="h-4 w-4 text-teal" /> 接口参考（模拟端点）
            </h2>
            <p className="text-[13px] text-muted-foreground">
              以下端点已在本地后端实现。点击「试运行」可获取 JSON 响应，供 ERP / ESG 系统对接开发。
            </p>
            <div className="space-y-4">
              {ENDPOINTS.map((ep) => (
                <EndpointCard key={ep.id} ep={ep} />
              ))}
            </div>
          </section>

          <section id="webhooks" className="scroll-mt-24 space-y-3">
            <h2 className="text-[18px] font-semibold">Webhooks</h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              当 SME 完成护照签署、排放因子更新或 CISA 等级变更时，向宝武注册的 HTTPS 端点推送事件。
              事件类型：<code className="text-teal">passport.verified</code>、
              <code className="text-teal">emissions.updated</code>、
              <code className="text-teal">supplier.grade_changed</code>。
            </p>
          </section>

          <section id="scope-mapping" className="scroll-mt-24 space-y-4">
            <h2 className="text-[18px] font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-carbon" /> Scope 1+2 → Scope 3 映射
            </h2>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-[12px]">
                <thead className="bg-surface/60 border-b border-border">
                  <tr className="text-[10px] font-mono uppercase text-muted-foreground">
                    <th className="py-2 px-3 text-left">SME 报告</th>
                    <th className="py-2 px-3 text-left">宝武 Scope 3</th>
                    <th className="py-2 px-3 text-left">API 字段</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono">
                  <tr><td className="py-2 px-3">Scope 1 直接</td><td className="py-2 px-3 text-muted-foreground">Cat.10 加工排放（直接部分）</td><td className="py-2 px-3 text-teal">scope1_tco2e</td></tr>
                  <tr><td className="py-2 px-3">Scope 2 电力</td><td className="py-2 px-3 text-muted-foreground">Cat.10 加工排放（间接部分）</td><td className="py-2 px-3 text-teal">scope2_tco2e</td></tr>
                  <tr><td className="py-2 px-3">Scope 1+2 合计</td><td className="py-2 px-3 text-muted-foreground">按宝武采购吨位归因</td><td className="py-2 px-3 text-teal">scope1_plus_2_tco2e</td></tr>
                  <tr><td className="py-2 px-3">单位强度</td><td className="py-2 px-3 text-muted-foreground">质量法分配因子</td><td className="py-2 px-3 text-teal">intensity_tco2e_per_tonne</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-[12px] text-muted-foreground italic">
              速率限制因租户套餐而异；超限返回 HTTP 429，请实现指数退避。联系 GreenGru 运营获取生产密钥与 SLA。
            </p>
          </section>

          <footer className="pt-6 border-t border-border text-[11px] font-mono text-muted-foreground flex flex-wrap gap-4">
            <Link to="/upstream" className="hover:text-primary">← 上游供应商总览</Link>
            <Link to="/" className="hover:text-primary">Dashboard</Link>
            <span>数据主权 · cn-beijing · 只读聚合</span>
          </footer>
        </motion.article>
      </div>
    </div>
  );
}
