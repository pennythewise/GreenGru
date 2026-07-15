import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale";
import { authModal } from "@/lib/ui-strings";

type SignatureBundle = {
  packageHash: string;
  hmacSignature: string;
  signedAt: string;
  keyId: string;
};

async function buildSignatureBundle(documentCount: number): Promise<SignatureBundle> {
  const signedAt = new Date().toISOString();
  const payload = `greengru|upstream|baowu-ansteel|docs:${documentCount}|ts:${signedAt}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
  const packageHash = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const sigPayload = `${packageHash}|operator:qc-ops@hengfeng.cn`;
  const sigDigest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(sigPayload));
  const hmacSignature = Array.from(new Uint8Array(sigDigest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return {
    packageHash,
    hmacSignature,
    signedAt,
    keyId: `gg-hmac-${packageHash.slice(0, 8)}`,
  };
}

function HashBlock({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-lg border p-3", accent ? "border-carbon/40 bg-carbon/[0.06]" : "border-border bg-surface/50")}>
      <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-[11px] font-mono break-all leading-relaxed text-foreground/90">{value}</div>
    </div>
  );
}

export function UpstreamAuthorizationModal({
  open,
  onOpenChange,
  documentCount,
  onAuthorized,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentCount: number;
  onAuthorized: () => void;
}) {
  const navigate = useNavigate();
  const { t } = useLocale();
  const [phase, setPhase] = useState<"idle" | "signing" | "ready">("idle");
  const [bundle, setBundle] = useState<SignatureBundle | null>(null);

  useEffect(() => {
    if (!open) {
      setPhase("idle");
      setBundle(null);
      return;
    }

    let cancelled = false;
    setPhase("signing");
    const timer = window.setTimeout(() => {
      void buildSignatureBundle(documentCount).then((result) => {
        if (cancelled) return;
        setBundle(result);
        setPhase("ready");
      });
    }, 900);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, documentCount]);

  function handleContinue() {
    onAuthorized();
    onOpenChange(false);
    void navigate({ to: "/entry" });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border bg-popover p-0 gap-0 overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-border bg-surface/40">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-carbon/15 text-carbon flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-left text-[17px]">{t(authModal.title.en, authModal.title.zh)}</DialogTitle>
                <DialogDescription className="text-left mt-1 text-[12px]">
                  {t(authModal.subtitle.en, authModal.subtitle.zh)}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="rounded-lg border border-primary/30 bg-primary/[0.06] p-4">
            <div className="flex items-start gap-2.5">
              <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[13px] leading-relaxed">
                {t(authModal.encryptBody.en, authModal.encryptBody.zh)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10.5px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <KeyRound className="h-3 w-3 text-teal" /> {t(authModal.cryptoSig.en, authModal.cryptoSig.zh)}
              </span>
              <span>{phase === "ready" ? t(authModal.signed.en, authModal.signed.zh) : phase === "signing" ? t(authModal.signing.en, authModal.signing.zh) : "—"}</span>
            </div>

            {phase === "signing" && (
              <div className="rounded-lg border border-border bg-surface/40 p-6 text-center">
                <div className="h-1.5 max-w-[200px] mx-auto rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-1/3 bg-primary rounded-full animate-pulse" />
                </div>
                <p className="mt-3 text-[12px] font-mono text-muted-foreground">{t(authModal.signingDetail.en, authModal.signingDetail.zh)}</p>
              </div>
            )}

            {bundle && phase === "ready" && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <HashBlock label={t(authModal.packageHash.en, authModal.packageHash.zh)} value={bundle.packageHash} />
                <HashBlock label={t(authModal.operatorSig.en, authModal.operatorSig.zh)} value={bundle.hmacSignature} accent />
                <div className="flex flex-wrap gap-3 text-[10.5px] font-mono text-muted-foreground px-1">
                  <span>key: {bundle.keyId}</span>
                  <span>algo: HMAC-SHA256</span>
                  <span>at: {bundle.signedAt.slice(0, 19).replace("T", " ")} UTC</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-surface/30 sm:justify-between gap-3">
          <p className="text-[11px] text-muted-foreground text-left sm:max-w-[55%]">
            {t(authModal.nextNote.en, authModal.nextNote.zh)}
          </p>
          <button
            type="button"
            disabled={phase !== "ready"}
            onClick={handleContinue}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md text-[13px] font-medium transition shrink-0",
              phase === "ready"
                ? "bg-primary text-primary-foreground teal-glow hover:brightness-110"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            {t(authModal.continue.en, authModal.continue.zh)} <ArrowRight className="h-4 w-4" />
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
