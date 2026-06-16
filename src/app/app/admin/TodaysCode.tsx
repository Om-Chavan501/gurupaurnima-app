"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { useT } from "@/components/LocaleProvider";

export default function TodaysCode({ code, error }: { code: string | null; error: string | null }) {
  const t = useT();
  const [hidden, setHidden] = useState(true);

  if (error) {
    return (
      <div
        className="p-5 rounded-2xl"
        style={{ background: "color-mix(in oklab, #ff8585 8%, transparent)", border: "1px solid color-mix(in oklab, #ff8585 30%, var(--line))" }}
      >
        <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "#ff8585" }}>
          {t("admin.codeUnavailable")}
        </div>
        <p className="mt-2 text-sm" style={{ color: "var(--ink-0)" }}>
          {error}. Set <code>SHISHYA_CODE_SECRET</code> in env and restart.
        </p>
      </div>
    );
  }

  if (!code) return null;

  async function copy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      toast.success(t("common.copied"));
    } catch {
      toast.error("Couldn't copy");
    }
  }

  return (
    <div
      className="p-5 md:p-6 rounded-2xl flex items-center justify-between gap-4 flex-wrap"
      style={{
        background: "color-mix(in oklab, var(--accent) 8%, transparent)",
        border: "1px solid color-mix(in oklab, var(--accent) 30%, var(--line))",
      }}
    >
      <div>
        <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--accent-soft)" }}>
          {t("admin.todayKicker")}
        </div>
        <div
          className="mt-2 font-display tracking-[0.25em]"
          style={{
            fontSize: "clamp(36px, 6vw, 52px)",
            color: "var(--ink-0)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {hidden ? "● ● ● ● ● ●" : code}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setHidden((v) => !v)} className="btn btn-ghost text-sm py-2 px-4">
          {hidden ? t("admin.reveal") : t("admin.hide")}
        </button>
        <button onClick={copy} className="btn text-sm py-2 px-4 inline-flex items-center gap-2">
          <Copy size={14} /> {t("common.copy")}
        </button>
      </div>
    </div>
  );
}
