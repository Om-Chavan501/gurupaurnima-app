"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "sent">("form");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!first || !last || !email || !password || !confirm) {
      toast.error("All fields are required");
      return;
    }
    if (password.length < 8) {
      toast.error("Password should be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/signup/profile`,
        data: { first_name: first, last_name: last },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    sessionStorage.setItem("gp.signup.email", email);
    sessionStorage.setItem("gp.signup.first", first);
    sessionStorage.setItem("gp.signup.last", last);
    setStep("sent");
  }

  return (
    <PageTransition>
      <div className="max-w-md mx-auto pt-8">
        <AnimatePresence mode="wait">
          {step === "form" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-[11px] tracking-[0.32em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>Step 1 of 2</div>
              <h1 className="font-display" style={{ fontSize: "clamp(34px, 5.5vw, 50px)", lineHeight: 1.05 }}>
                A few details to begin.
              </h1>
              <p className="mt-3 text-[15px]" style={{ color: "var(--ink-1)" }}>
                We&rsquo;ll send a one-time link to your email to verify it&rsquo;s really you.
              </p>

              <form onSubmit={submit} className="mt-10 space-y-7">
                <div className="grid grid-cols-2 gap-4">
                  <div className="field-group">
                    <label>First name</label>
                    <input className="field" value={first} onChange={(e) => setFirst(e.target.value)} autoFocus />
                  </div>
                  <div className="field-group">
                    <label>Last name</label>
                    <input className="field" value={last} onChange={(e) => setLast(e.target.value)} />
                  </div>
                </div>
                <div className="field-group">
                  <label>Email</label>
                  <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="field-group">
                  <label>Password</label>
                  <div className="relative">
                    <input className="field pr-10" type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1" aria-label="Show password" style={{ color: "var(--ink-2)" }}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="field-group">
                  <label>Confirm password</label>
                  <div className="relative">
                    <input className="field pr-10" type={showConfirm ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                    <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1" aria-label="Show password" style={{ color: "var(--ink-2)" }}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Link href="/" className="btn-link text-sm">← Back</Link>
                  <button className="btn" type="submit" disabled={busy}>
                    {busy ? "Sending…" : "Send link →"}
                  </button>
                </div>

                <p className="text-sm" style={{ color: "var(--ink-2)" }}>
                  Already with us? <Link href="/login" className="btn-link">Sign in</Link>
                </p>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-[11px] tracking-[0.32em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>Almost there</div>
              <h1 className="font-display" style={{ fontSize: "clamp(34px, 5.5vw, 50px)", lineHeight: 1.05 }}>
                Check your inbox.
              </h1>
              <p className="mt-4 text-[15px] md:text-base" style={{ color: "var(--ink-1)" }}>
                A confirmation link is on its way to <span style={{ color: "var(--accent-soft)" }}>{email}</span>.
                Open it on this device to continue.
              </p>
              <div className="mt-10 flex items-center gap-4">
                <button onClick={() => setStep("form")} className="btn btn-ghost">← Wrong email?</button>
                <button
                  onClick={async () => {
                    const supabase = createClient();
                    const { error } = await supabase.auth.resend({ type: "signup", email });
                    if (error) toast.error(error.message); else toast.success("Sent again.");
                  }}
                  className="btn-link text-sm"
                >
                  Resend link
                </button>
              </div>
              <p className="mt-10 text-sm" style={{ color: "var(--ink-2)" }}>
                Once you click the link you&rsquo;ll land here automatically.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="mt-6 btn-link text-sm"
              >
                Already verified? Sign in →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
