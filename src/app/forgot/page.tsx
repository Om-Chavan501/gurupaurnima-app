"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/components/LocaleProvider";

export default function ForgotPage() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset`,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
  }

  return (
    <PageTransition>
      <div className="max-w-md mx-auto pt-10">
        <div className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>{t("forgot.kicker")}</div>
        <h1 className="font-display text-4xl md:text-5xl">{sent ? t("forgot.sentH1") : t("forgot.h1")}</h1>
        {sent ? (
          <p className="mt-6" style={{ color: "var(--ink-1)" }}>
            {t("forgot.sentBody", { email })}
          </p>
        ) : (
          <form onSubmit={submit} className="mt-10 space-y-7">
            <div className="field-group">
              <label>{t("signup.form.email")}</label>
              <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            </div>
            <div className="flex items-center justify-between">
              <Link href="/login" className="btn-link text-sm">{t("forgot.backLogin")}</Link>
              <button className="btn" disabled={busy}>{busy ? "…" : t("forgot.sendBtn")}</button>
            </div>
          </form>
        )}
      </div>
    </PageTransition>
  );
}
