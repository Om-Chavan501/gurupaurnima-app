"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/client";
import { checkShishyaCode } from "@/lib/actions";
import { useT } from "@/components/LocaleProvider";

type Step = "role" | "code" | "form" | "sent";
type Role = "shishya" | "audience";

export default function SignupPage() {
  const t = useT();
  const router = useRouter();
  const search = useSearchParams();
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Role>("shishya");
  const [code, setCode] = useState("");
  const [invitedBy, setInvitedBy] = useState<string | null>(null);

  // Deep link with ?code=XXXXXX → prefill audience invite path
  useEffect(() => {
    const c = search.get("code");
    if (c) {
      setRole("audience");
      setCode(c.toUpperCase());
      setStep("code");
    }
  }, [search]);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  function pickRole(r: Role) {
    setRole(r);
    setCode("");
    setInvitedBy(null);
    setStep("code");
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      toast.error(t("signup.code.pleaseEnter"));
      return;
    }
    setBusy(true);
    if (role === "shishya") {
      const r = await checkShishyaCode(code.trim());
      setBusy(false);
      if (!r.ok) {
        toast.error(t("signup.code.invalidShishya"));
        return;
      }
    } else {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("resolve_invite_code", {
        p_code: code.trim().toUpperCase(),
      });
      setBusy(false);
      if (error || !data) {
        toast.error(t("signup.code.invalidInvite"));
        return;
      }
      setInvitedBy(data as string);
    }
    setStep("form");
  }

  async function submitDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!first || !last || !email || !password || !confirm) {
      toast.error(t("common.required"));
      return;
    }
    if (password.length < 8) {
      toast.error(t("signup.form.passwordShort"));
      return;
    }
    if (password !== confirm) {
      toast.error(t("signup.form.passwordsDiffer"));
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/signup/profile`,
        data: {
          first_name: first,
          last_name: last,
          intended_role: role,
          invited_by: invitedBy,
          invite_code: role === "audience" ? code.trim().toUpperCase() : null,
        },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setStep("sent");
  }

  const adminName = process.env.NEXT_PUBLIC_ADMIN_NAME || "an admin";
  const adminWa = (process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "").replace(/\D/g, "");
  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE || "";
  const waMessage =
    role === "shishya"
      ? "Namaskar, I am trying to sign up as a shishya for Saurabh Dada's Gurupaurnima 2026 but I don't have today's code. Could you share it with me?"
      : "Namaskar, I would like to attend Saurabh Dada's Gurupaurnima 2026 as audience. Could you share an invite code with me?";

  return (
    <PageTransition>
      <div className="max-w-md mx-auto pt-4 md:pt-8">
        <AnimatePresence mode="wait">
          {/* ===================================================== ROLE */}
          {step === "role" && (
            <motion.div
              key="role"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-[11px] tracking-[0.32em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>
                {t("signup.stepOf3", { n: 1 })}
              </div>
              <h1 className="font-display" style={{ fontSize: "clamp(34px, 5.5vw, 50px)", lineHeight: 1.05 }}>
                {t("signup.role.h1")}
              </h1>
              <p className="mt-3 text-[15px]" style={{ color: "var(--ink-1)" }}>
                {t("signup.role.intro")}
              </p>

              <div className="mt-8 space-y-3">
                <button
                  onClick={() => pickRole("shishya")}
                  className="w-full text-left p-5 rounded-2xl transition group"
                  style={{ background: "color-mix(in oklab, var(--ink-0) 3%, transparent)", border: "1px solid var(--line)" }}
                >
                  <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>
                    {t("signup.role.shishyaKicker")}
                  </div>
                  <div className="font-display text-2xl mt-1">{t("role.shishya")}</div>
                  <p className="mt-1.5 text-sm" style={{ color: "var(--ink-1)" }}>
                    {t("signup.role.shishyaBody")}
                  </p>
                </button>

                <button
                  onClick={() => pickRole("audience")}
                  className="w-full text-left p-5 rounded-2xl transition group"
                  style={{ background: "color-mix(in oklab, var(--ink-0) 3%, transparent)", border: "1px solid var(--line)" }}
                >
                  <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>
                    {t("signup.role.audienceKicker")}
                  </div>
                  <div className="font-display text-2xl mt-1">{t("role.audience")}</div>
                  <p className="mt-1.5 text-sm" style={{ color: "var(--ink-1)" }}>
                    {t("signup.role.audienceBody")}
                  </p>
                </button>
              </div>

              <p className="mt-8 text-sm" style={{ color: "var(--ink-2)" }}>
                {t("common.alreadyWithUs")} <Link href="/login" className="btn-link">{t("common.signIn")}</Link>
              </p>
              <Link href="/" className="mt-4 inline-block btn-link text-sm">{t("authError.home")}</Link>
            </motion.div>
          )}

          {/* ===================================================== CODE */}
          {step === "code" && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-[11px] tracking-[0.32em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>
                {t("signup.stepOf3", { n: 2 })} · {role === "shishya" ? t("role.shishya") : t("role.audience")}
              </div>
              <h1 className="font-display" style={{ fontSize: "clamp(34px, 5.5vw, 50px)", lineHeight: 1.05 }}>
                {role === "shishya" ? t("signup.code.h1.shishya") : t("signup.code.h1.audience")}
              </h1>
              <p className="mt-3 text-[15px]" style={{ color: "var(--ink-1)" }}>
                {role === "shishya" ? t("signup.code.intro.shishya") : t("signup.code.intro.audience")}
              </p>

              <form onSubmit={submitCode} className="mt-8 space-y-6">
                <div className="field-group">
                  <label>{role === "shishya" ? t("signup.code.label.shishya") : t("signup.code.label.audience")}</label>
                  <input
                    className="field"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    autoFocus
                    inputMode={role === "shishya" ? "numeric" : "text"}
                    placeholder={role === "shishya" ? "● ● ● ● ● ●" : "X X X X X X"}
                    style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)", letterSpacing: "0.3em" }}
                    maxLength={role === "shishya" ? 6 : 6}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={() => setStep("role")} className="btn-link text-sm">← {t("common.back")}</button>
                  <button className="btn" disabled={busy}>{busy ? "…" : t("common.continue")}</button>
                </div>
              </form>

              {/* No-code escape hatch */}
              <div
                className="mt-10 p-4 rounded-2xl"
                style={{ background: "color-mix(in oklab, var(--ink-0) 3%, transparent)", border: "1px solid var(--line)" }}
              >
                <div className="text-[10px] tracking-[0.3em] uppercase mb-1.5" style={{ color: "var(--ink-2)" }}>
                  {t("signup.code.noCode")}
                </div>
                <p className="text-sm" style={{ color: "var(--ink-1)" }}>
                  {t("signup.code.noCodeBody", { name: adminName })}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {adminWa && (
                    <a
                      href={`https://wa.me/${adminWa}?text=${encodeURIComponent(waMessage)}`}
                      target="_blank"
                      className="btn text-sm py-2 px-4"
                    >
                      WhatsApp {adminName}
                    </a>
                  )}
                  {adminPhone && (
                    <a href={`tel:${adminPhone}`} className="btn btn-ghost text-sm py-2 px-4">
                      {t("perf.callGuru")} · {adminPhone}
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================================================== FORM */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-[11px] tracking-[0.32em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>
                {t("signup.stepOf3", { n: 3 })} · {role === "shishya" ? t("role.shishya") : t("role.audience")}
              </div>
              <h1 className="font-display" style={{ fontSize: "clamp(34px, 5.5vw, 50px)", lineHeight: 1.05 }}>
                {t("signup.form.h1")}
              </h1>
              <p className="mt-3 text-[15px]" style={{ color: "var(--ink-1)" }}>
                {t("signup.form.intro")}
              </p>

              <form onSubmit={submitDetails} className="mt-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="field-group">
                    <label>{t("signup.form.firstName")}</label>
                    <input className="field" value={first} onChange={(e) => setFirst(e.target.value)} autoFocus />
                  </div>
                  <div className="field-group">
                    <label>{t("signup.form.lastName")}</label>
                    <input className="field" value={last} onChange={(e) => setLast(e.target.value)} />
                  </div>
                </div>
                <div className="field-group">
                  <label>{t("signup.form.email")}</label>
                  <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="field-group">
                  <label>{t("signup.form.password")}</label>
                  <div className="relative">
                    <input className="field pr-10" type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1" aria-label="Show password" style={{ color: "var(--ink-2)" }}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="field-group">
                  <label>{t("signup.form.confirmPassword")}</label>
                  <div className="relative">
                    <input className="field pr-10" type={showConfirm ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                    <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1" aria-label="Show password" style={{ color: "var(--ink-2)" }}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button type="button" onClick={() => setStep("code")} className="btn-link text-sm">← {t("common.back")}</button>
                  <button className="btn" type="submit" disabled={busy}>
                    {busy ? t("signup.form.sending") : `${t("signup.form.send")} →`}
                  </button>
                </div>

                <p className="text-sm" style={{ color: "var(--ink-2)" }}>
                  {t("common.alreadyWithUs")} <Link href="/login" className="btn-link">{t("common.signIn")}</Link>
                </p>
              </form>
            </motion.div>
          )}

          {/* ===================================================== SENT */}
          {step === "sent" && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-[11px] tracking-[0.32em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>{t("signup.sent.kicker")}</div>
              <h1 className="font-display" style={{ fontSize: "clamp(34px, 5.5vw, 50px)", lineHeight: 1.05 }}>
                {t("signup.sent.h1")}
              </h1>
              <p className="mt-4 text-[15px] md:text-base" style={{ color: "var(--ink-1)" }}>
                {t("signup.sent.body", { email })}
              </p>
              <div className="mt-10 flex items-center gap-4">
                <button onClick={() => setStep("form")} className="btn btn-ghost">← {t("signup.sent.wrongEmail")}</button>
                <button
                  onClick={async () => {
                    const supabase = createClient();
                    const { error } = await supabase.auth.resend({ type: "signup", email });
                    if (error) toast.error(error.message); else toast.success(t("signup.sent.resent"));
                  }}
                  className="btn-link text-sm"
                >
                  {t("signup.sent.resend")}
                </button>
              </div>
              <button
                onClick={() => router.push("/login")}
                className="mt-10 btn-link text-sm"
              >
                {t("signup.sent.alreadyVerified")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
