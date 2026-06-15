"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { raiseAdminRequest } from "@/lib/actions";
import type { AdminRequest, AdminRequestType, Role } from "@/lib/types";

type Props = {
  role: Role;
  isVerified: boolean;
  pendingTypes: AdminRequestType[];
  recentRequests: AdminRequest[];
};

const TYPE_LABEL: Record<AdminRequestType, string> = {
  verify: "Be marked verified",
  change_to_shishya: "Move me to shishya",
  change_to_audience: "Move me to audience",
};

export default function SelfServiceRequests({ role, isVerified, pendingTypes, recentRequests }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [active, setActive] = useState<AdminRequestType | null>(null);
  const [reason, setReason] = useState("");

  const has = (t: AdminRequestType) => pendingTypes.includes(t);

  const adminName = process.env.NEXT_PUBLIC_ADMIN_NAME || "an admin";
  const adminWa = (process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "").replace(/\D/g, "");
  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE || "";

  function submit(t: AdminRequestType) {
    start(async () => {
      const r = await raiseAdminRequest(t, reason);
      if (r.ok) {
        toast.success("Request sent — admins will see it");
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
        Need something changed?
      </div>
      <h2 className="font-display text-2xl md:text-3xl">Ask the admins.</h2>
      <p className="mt-2 text-[15px]" style={{ color: "var(--ink-1)" }}>
        Send a request and an admin will accept, reject, or hold it.
        {!isVerified && " You currently aren't verified — until you are, you can't generate invite codes or be made admin."}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {offers.map((t) => (
          <button
            key={t}
            onClick={() => setActive(active === t ? null : t)}
            disabled={has(t)}
            className="btn btn-ghost text-sm py-2 px-4"
            title={has(t) ? "Already pending" : ""}
          >
            {TYPE_LABEL[t]}{has(t) ? " · pending" : ""}
          </button>
        ))}
      </div>

      {active && !has(active) && (
        <div
          className="mt-5 p-4 rounded-2xl"
          style={{ background: "color-mix(in oklab, var(--ink-0) 3%, transparent)", border: "1px solid var(--line)" }}
        >
          <div className="field-group">
            <label>Reason (optional)</label>
            <input
              className="field"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="A short line for the admin"
              autoFocus
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => submit(active)} disabled={pending} className="btn">
              {pending ? "Sending…" : "Send request"}
            </button>
            <button onClick={() => setActive(null)} className="btn btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {/* Admin escape hatch */}
      <div
        className="mt-8 p-4 rounded-2xl"
        style={{ background: "color-mix(in oklab, var(--ink-0) 3%, transparent)", border: "1px solid var(--line)" }}
      >
        <div className="text-[10px] tracking-[0.3em] uppercase mb-1.5" style={{ color: "var(--ink-2)" }}>
          Or talk to {adminName} directly
        </div>
        <div className="flex flex-wrap gap-2">
          {adminWa && (
            <a
              href={`https://wa.me/${adminWa}?text=${encodeURIComponent("Namaskar, I have a question about my Gurupaurnima 2026 account.")}`}
              target="_blank"
              className="btn text-sm py-2 px-4"
            >
              WhatsApp {adminName}
            </a>
          )}
          {adminPhone && (
            <a href={`tel:${adminPhone}`} className="btn btn-ghost text-sm py-2 px-4">
              Call · {adminPhone}
            </a>
          )}
        </div>
      </div>

      {/* History */}
      {recentRequests.length > 0 && (
        <div className="mt-10">
          <div className="text-[11px] tracking-[0.32em] uppercase mb-2" style={{ color: "var(--ink-2)" }}>
            Recent requests
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
