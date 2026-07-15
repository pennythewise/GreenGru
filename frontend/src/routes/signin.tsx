import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Flame, Lock, Mail, ShieldCheck } from "lucide-react";
import { LangToggle } from "@/components/AppShell";
import { useLocale } from "@/lib/locale";
import { signinPage } from "@/lib/ui-strings";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in · Carbon Passport" },
      { name: "description", content: "Authenticate as an SME operator to access your carbon passport workspace." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const { t, isZh } = useLocale();
  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_460px] text-foreground">
      {/* Left: brand story */}
      <div className="hidden lg:flex flex-col justify-between p-10 border-r border-border relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.35]"
             style={{ background: "radial-gradient(ellipse 60% 40% at 20% 10%, oklch(0.65 0.19 45 / 20%), transparent 60%), radial-gradient(ellipse 60% 40% at 80% 90%, oklch(0.55 0.15 155 / 15%), transparent 60%)" }} />
        <div className="relative flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-danger flex items-center justify-center ember-glow">
            <Flame className="h-5 w-5 text-primary-foreground" strokeWidth={2.4} />
          </div>
          <div>
            <div className="text-[14px] font-semibold tracking-tight leading-tight">Carbon Passport</div>
            <div className="text-[11px] text-muted-foreground font-mono">Steel SME MVP · v1.0</div>
          </div>
        </div>

        <div className="relative max-w-lg">
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">01 · {t(signinPage.signIn.en, signinPage.signIn.zh)}</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight leading-[1.05]">
            {isZh ? (
              <>将隐形排放转化为<span className="text-gradient-ember">碳护照</span>、融资报告与优先级行动方案。</>
            ) : (
              <>Turn invisible emissions into a <span className="text-gradient-ember">CBAM passport</span>, a financing report, and a ranked plan.</>
            )}
          </h1>
          <p className="mt-4 text-[14px] text-muted-foreground leading-relaxed">
            Distributed to Baowu downstream customers as a value-added service. Bilingual EN / 中文, every regulated number cited.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { k: "8", l: "supported CN codes", zh: "税则号" },
              { k: "6", l: "stage pipeline", zh: "流水线" },
              { k: "40×", l: "phase-in escalation", zh: "阶段递增" },
            ].map((s) => (
              <div key={s.l} className="panel p-3">
                <div className="font-mono text-2xl font-semibold text-primary">{s.k}</div>
                <div className="text-[11.5px] text-foreground mt-0.5">{s.l}</div>
                <div className="text-[10px] font-mono text-muted-foreground">{s.zh}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-[11px] font-mono text-muted-foreground">
          © 2026 · Baowu supplier program · MVP demo
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-sm space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="lg:hidden flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-danger flex items-center justify-center">
                <Flame className="h-4 w-4 text-primary-foreground" strokeWidth={2.4} />
              </div>
              <span className="text-[13px] font-semibold">Carbon Passport</span>
            </div>
            <div className="ml-auto"><LangToggle /></div>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">01 · {t(signinPage.signIn.en, signinPage.signIn.zh)}</div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">{t(signinPage.welcome.en, signinPage.welcome.zh)}</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              B2B access via Baowu referral. No open self-serve signup.
            </p>
          </div>

          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); window.location.href = "/"; }}>
            <label className="block">
              <span className="text-[11.5px] font-mono text-muted-foreground">{t(signinPage.workEmail.en, signinPage.workEmail.zh)}</span>
              <div className="mt-1 flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-card focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 transition">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input type="email" defaultValue="qc-ops@hengfeng.cn" className="flex-1 bg-transparent outline-none text-[13.5px] font-mono" />
              </div>
            </label>
            <label className="block">
              <span className="text-[11.5px] font-mono text-muted-foreground">{t(signinPage.password.en, signinPage.password.zh)}</span>
              <div className="mt-1 flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-card focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 transition">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input type="password" defaultValue="••••••••••••" className="flex-1 bg-transparent outline-none text-[13.5px] font-mono" />
              </div>
            </label>
            <button type="submit" className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-md bg-primary text-primary-foreground text-[13.5px] font-medium ember-glow hover:brightness-110 transition">
              {t(signinPage.signInBtn.en, signinPage.signInBtn.zh)}
            </button>
          </form>

          <div className="flex items-start gap-2 p-3 rounded-md border border-border bg-surface/60">
            <ShieldCheck className="h-4 w-4 text-carbon shrink-0 mt-0.5" />
            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
              {t(signinPage.residency.en, signinPage.residency.zh)}
            </p>
          </div>

          <div className="text-[11px] font-mono text-muted-foreground text-center">
            {t(signinPage.demoLink.en, signinPage.demoLink.zh)} <Link to="/" className="text-primary hover:underline">{t(signinPage.dashboard.en, signinPage.dashboard.zh)}</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
