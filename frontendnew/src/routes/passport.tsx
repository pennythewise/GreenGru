import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { BadgeCheck, Download, FileCheck2, QrCode, ShieldAlert } from "lucide-react";
import { AppShell, LangToggle, PageHeader } from "@/components/AppShell";
import { company, passportFields } from "@/lib/dashboard-data";

export const Route = createFileRoute("/passport")({
  head: () => ({
    meta: [
      { title: "CBAM Passport · Carbon Passport" },
      { name: "description", content: "Bilingual EN/中文 CBAM export passport — defensible evidence for your EU importer." },
    ],
  }),
  component: Passport,
});

function Passport() {
  return (
    <AppShell crumb="CBAM Passport">
      <PageHeader
        n="06"
        zh="碳护照"
        title="CBAM export passport"
        subtitle="A bilingual, defensible document you hand to your EU importer — not a filing you make yourself."
        right={
          <div className="flex items-center gap-2">
            <LangToggle />
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary text-primary-foreground text-[13px] font-medium ember-glow hover:brightness-110 transition">
              <Download className="h-4 w-4" /> Download PDF
            </button>
          </div>
        }
      />

      {/* Importer callout — the "SME misses this" thing */}
      <div className="rounded-xl border border-signal/30 bg-signal/[0.06] p-4 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-signal shrink-0 mt-0.5" />
        <div>
          <div className="text-[13.5px] font-medium">Your EU importer holds Authorized CBAM Declarant status — not you.</div>
          <div className="mt-0.5 text-[12.5px] text-muted-foreground">This document is the evidence you give them. Surfaced in-product because SMEs miss it in the PDF footnote.</div>
        </div>
      </div>

      {/* Document preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="panel-lift overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface/60">
          <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
            <FileCheck2 className="h-3.5 w-3.5 text-primary" />
            passport-{company.id}.pdf · A4 · bilingual
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-carbon">
            <BadgeCheck className="h-3.5 w-3.5" /> content hash verified
          </div>
        </div>

        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* EN column */}
          <div className="p-8 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-primary">EN</div>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">CBAM Export Passport</h2>
                <div className="mt-1 text-[11px] font-mono text-muted-foreground">ID {company.id} · issued 2026-03-14</div>
              </div>
              <div className="h-14 w-14 rounded-md border border-border bg-card flex items-center justify-center">
                <QrCode className="h-8 w-8 text-foreground" strokeWidth={1.2} />
              </div>
            </div>

            <Section title="Exporter">
              <KV k="Company" v={passportFields.exporter.name} />
              <KV k="Registration" v={passportFields.exporter.id} mono />
              <KV k="Location" v={passportFields.exporter.addr} />
            </Section>

            <Section title="Product & route">
              <KV k="CN code" v={passportFields.cn} mono />
              <KV k="Production route" v={passportFields.route} />
              <KV k="Reporting tonnage" v={`${passportFields.tonnage.toLocaleString()} t / yr`} mono />
            </Section>

            <Section title="Emissions intensity">
              <KV k="Verified intensity" v={`${passportFields.intensity} tCO₂e / t`} mono strong />
              <KV k="Data source" v={passportFields.intensitySource} />
              <KV k="Taxable emissions" v={`${passportFields.taxable.toFixed(0)} tCO₂e / yr`} mono />
            </Section>

            <Section title="CBAM tariff exposure">
              <div className="grid grid-cols-2 gap-2">
                <TariffBox label="Net · this year" value={`€${passportFields.net}/t`} sub={`phase-in ${passportFields.phaseIn}%`} accent />
                <TariffBox label="Gross · 2034" value={`€${passportFields.gross}/t`} sub="fully phased in" />
              </div>
              <KV k="Certificate price" v={`€${passportFields.certPrice} · ${passportFields.certQuarter}`} mono />
            </Section>
          </div>

          {/* 中文 column */}
          <div className="p-8 space-y-5 bg-surface/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-primary">中文</div>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">CBAM 出口碳护照</h2>
                <div className="mt-1 text-[11px] font-mono text-muted-foreground">编号 {company.id} · 签发 2026-03-14</div>
              </div>
            </div>

            <Section title="出口企业">
              <KV k="企业名称" v={passportFields.exporter.nameZh} />
              <KV k="统一社会信用代码" v={passportFields.exporter.id} mono />
              <KV k="所在地" v={passportFields.exporter.addr} />
            </Section>

            <Section title="产品与工艺">
              <KV k="税则号 (CN)" v={passportFields.cn} mono />
              <KV k="生产路线" v="长流程 · 高炉—转炉" />
              <KV k="申报吨数" v={`${passportFields.tonnage.toLocaleString()} 吨 / 年`} mono />
            </Section>

            <Section title="碳排放强度">
              <KV k="核验强度" v={`${passportFields.intensity} tCO₂e / 吨`} mono strong />
              <KV k="数据来源" v="实测 — 认证CT钳表 + 发票核对(12个月)" />
              <KV k="应税排放" v={`${passportFields.taxable.toFixed(0)} tCO₂e / 年`} mono />
            </Section>

            <Section title="CBAM 关税敞口">
              <div className="grid grid-cols-2 gap-2">
                <TariffBox label="净额 · 本年" value={`€${passportFields.net}/吨`} sub={`阶段系数 ${passportFields.phaseIn}%`} accent />
                <TariffBox label="毛额 · 2034" value={`€${passportFields.gross}/吨`} sub="全面适用" />
              </div>
              <KV k="证书价格" v={`€${passportFields.certPrice} · ${passportFields.certQuarter}`} mono />
            </Section>
          </div>
        </div>

        {/* Footer disclaimer */}
        <div className="border-t border-border px-8 py-5 bg-surface/40 space-y-2">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-mono uppercase tracking-wider text-foreground">Disclaimer:</span> Not legal or tax advice. Regulated numbers computed deterministically from cited sources (IR (EU) 2025/2621, Reg (EU) 2023/956). Bilingual EN/中文 halves generated in one pass and validated to contain identical numbers.
          </p>
          <p className="text-[11px] font-mono text-muted-foreground">
            {passportFields.hash} · issuer signature: 3045-0221-00b7-fc9e…
          </p>
        </div>
      </motion.div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground border-b border-border pb-1.5">{title}</div>
      <dl className="mt-2 space-y-1.5">{children}</dl>
    </div>
  );
}

function KV({ k, v, mono, strong }: { k: string; v: string; mono?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
      <dt className="text-muted-foreground shrink-0">{k}</dt>
      <dd className={`text-right ${mono ? "font-mono" : ""} ${strong ? "font-semibold text-foreground" : ""}`}>{v}</dd>
    </div>
  );
}

function TariffBox({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={`rounded-md border p-2.5 ${accent ? "border-primary/30 bg-primary/[0.06]" : "border-border bg-card"}`}>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-0.5 font-mono text-[18px] font-semibold ${accent ? "text-primary" : "text-muted-foreground"}`}>{value}</div>
      <div className="text-[10.5px] font-mono text-muted-foreground">{sub}</div>
    </div>
  );
}
