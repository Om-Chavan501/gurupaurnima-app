"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    router.push("/app");
    router.refresh();
  }

  return (
    <PageTransition>
      <div className="max-w-md mx-auto pt-10">
        <div className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>Welcome back</div>
        <h1 className="font-display" style={{ fontSize: "clamp(34px, 5.5vw, 50px)", lineHeight: 1.05 }}>
          Sign in.
        </h1>

        <form onSubmit={submit} className="mt-10 space-y-7">
          <div className="field-group">
            <label>Email</label>
            <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          </div>
          <div className="field-group">
            <label>Password</label>
            <div className="relative">
              <input className="field pr-10" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1" style={{ color: "var(--ink-2)" }} aria-label="Show password">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link href="/forgot" className="btn-link text-sm">Forgot password?</Link>
            <button className="btn" disabled={busy}>{busy ? "…" : "Sign in →"}</button>
          </div>

          <p className="text-sm" style={{ color: "var(--ink-2)" }}>
            New here? <Link href="/signup" className="btn-link">Join</Link>
          </p>
        </form>
      </div>
    </PageTransition>
  );
}
