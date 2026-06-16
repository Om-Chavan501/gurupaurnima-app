"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { raiseAdminRequest } from "@/lib/actions";
import type { AdminRequest, AdminRequestType, Role } from "@/lib/types";
import { useT } from "@/components/LocaleProvider";

type Props = {
  role: Role;
  isVerified: boolean;
  pendingTypes: AdminRequestType[];
  recentRequests: AdminRequest[];
};

export default function SelfServiceRequests({ role, isVerified, pendingTypes, recentRequests }: Props) {
  const t = useT();
  const TYPE_LABEL: Record<AdminRequestType, string> = {
    verify: t("profile.reqVerify"),
    change_to_shishya: t("profile.reqToShishya"),
    change_to_audience: t("profile.reqToAudience"),
  };
  const router = useRouter();
  const [pending, start] = useTransition();
  const [active, setActive] = useState<AdminRequestType | null>(null);
  const [reason, setReason] = useState("");

  const has = (kind: AdminRequestType) => pendingTypes.includes(kind);

  const adminName = process.env.NEXT_PUBLIC_ADMIN_NAME || "an admin";
  const adminWa = (process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "").replace(/\D/g, "");
  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE || "";

  function submit(kind: AdminRequestType) {
    start(async () => {
      const r = await raiseAdminRequest(kind, reason);
      if (r.ok) {
        toast.success(t("profile.requestSent"));
        setActive(null);
        setReason("");
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  // Which buttons to show based on current state
  const offers: AdminRequestType[] = [];
  if (!isVerified) offers.push("verify");
  if (role === "audience") offers.push("change_to_shishya");
  if (role === "shishya") offers.push("change_to_audience");

  return (
    <section className="pt-10">
      <div className="text-[11px] tracking-[0.32em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>
        {t("profile.askKicker")}
      </div>
      <h2 className="font-display text-2xl md:text-3xl">{t("profile.askH1")}</h2>
      <p className="mt-2 text-[15px]" style={{ color: "var(--ink-1)" }}>
        {t("profile.askIntro")}{!isVerified && ` ${t("profile.askNotVerifiedAddendum")}`}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {offers.map((opt) => (
          <button
            key={opt}
            onClick={() => setActive(active === opt ? null : opt)}
            disabled={has(opt)}
            className="btn btn-ghost text-sm py-2 px-4"
            title={has(opt) ? t("profile.alreadyPending") : ""}
          >
            {TYPE_LABEL[opt]}{has(opt) ? ` · ${t("common.pending").toLowerCase()}` : ""}
          </button>
        ))}
      </div>

      {active && !has(active) && (
        <div
          className="mt-5 p-4 rounded-2xl"
          style={{ background: "color-mix(in oklab, var(--ink-0) 3%, transparent)", border: "1px solid var(--line)" }}
        >
          <div className="field-group">
            <label>{t("profile.reasonLabel")}</label>
            <input
              className="field"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("profile.reasonPlaceholder")}
              autoFocus
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => submit(active)} disabled={pending} className="btn">
              {pending ? t("profile.sending") : t("profile.sendRequest")}
            </button>
            <button onClick={() => setActive(null)} className="btn btn-ghost">{t("common.cancel")}</button>
          </div>
        </div>
      )}

      {/* Admin escape hatch */}
      <div
        className="mt-8 p-4 rounded-2xl"
        style={{ background: "color-mix(in oklab, var(--ink-0) 3%, transparent)", border: "1px solid var(--line)" }}
      >
        <div className="text-[10px] tracking-[0.3em] uppercase mb-1.5" style={{ color: "var(--ink-2)" }}>
          {t("profile.orTalk", { name: adminName })}
        </div>
        <div className="flex flex-wrap gap-2">
          {adminWa && (
            <a
              href={`https://wa.me/${adminWa}?text=${encodeURIComponent("Namaskar, I have a question about my Gurupaurnima 2026 account.")}`}
              target="_blank"
              className="btn text-sm py-2 px-4"
            >
              {`WhatsApp ${adminName}`}
            </a>
          )}
          {adminPhone && (
            <a href={`tel:${adminPhone}`} className="btn btn-ghost text-sm py-2 px-4">
              {t("perf.callGuru")} · {adminPhone}
            </a>
          )}
        </div>
      </div>

      {/* History */}
      {recentRequests.length > 0 && (
        <div className="mt-10">
          <div className="text-[11px] tracking-[0.32em] uppercase mb-2" style={{ color: "var(--ink-2)" }}>
            {t("profile.recentRequests")}
          </div>
          <ul className="divide-y" style={{ borderColor: "var(--line)" }}>
            {recentRequests.map((r) => (
              <li key={r.id} className="border-t first:border-t-0 py-3 flex items-baseline justify-between gap-3" style={{ borderColor: "var(--line)" }}>
                <span className="text-sm" style={{ color: "var(--ink-1)" }}>
                  {TYPE_LABEL[r.request_type]}
                </span>
                <span
                  className="text-[10px] tracking-[0.25em] uppercase"
                  style={{
                    color: r.status === "accepted" ? "var(--accent-soft)"
                      : r.status === "rejected" ? "#ff8585"
                      : r.status === "ignored" ? "var(--ink-2)"
                      : "var(--accent)",
                  }}
                >
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
