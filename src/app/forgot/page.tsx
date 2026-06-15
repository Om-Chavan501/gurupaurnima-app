"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPage() {
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
        <div className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>Reset</div>
        <h1 className="font-display text-4xl md:text-5xl">{sent ? "Look in your inbox." : "Forgot password?"}</h1>
        {sent ? (
          <p className="mt-6" style={{ color: "var(--ink-1)" }}>
            We sent a link to <span style={{ color: "var(--accent-soft)" }}>{email}</span>. Open it to choose a new password.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-10 space-y-7">
            <div className="field-group">
              <label>Email</label>
              <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            </div>
            <div className="flex items-center justify-between">
              <Link href="/login" className="btn-link text-sm">← Sign in</Link>
              <button className="btn" disabled={busy}>{busy ? "…" : "Send link"}</button>
            </div>
          </form>
        )}
      </div>
    </PageTransition>
  );
}
