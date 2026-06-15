"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/components/LocaleProvider";

export default function ResetPage() {
  const t = useT();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("At least 8 characters"); return; }
    if (password !== confirm) { toast.error("Passwords don't match"); return; }
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    router.push("/app");
  }

  return (
    <PageTransition>
      <div className="max-w-md mx-auto pt-10">
        <div className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>{t("reset.kicker")}</div>
        <h1 className="font-display text-4xl md:text-5xl">{t("reset.h1")}</h1>
        <form onSubmit={submit} className="mt-10 space-y-7">
          <div className="field-group">
            <label>{t("reset.newPwd")}</label>
            <div className="relative">
              <input className="field pr-10" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1" style={{ color: "var(--ink-2)" }} aria-label="Show password">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="field-group">
            <label>{t("reset.confirm")}</label>
            <input className="field" type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <button className="btn" disabled={busy}>{busy ? "…" : t("reset.save")}</button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}
