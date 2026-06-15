"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { createInviteCode, revokeInviteCode, raiseAdminRequest } from "@/lib/actions";
import type { InviteCode } from "@/lib/types";

type Props = {
  canCreate: boolean;
  mine: InviteCode[];
  userId: string;
};

export default function InvitePanel({ canCreate, mine, userId: _userId }: Props) {
  void _userId;
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [pending, start] = useTransition();
  const [justCreated, setJustCreated] = useState<string | null>(null);

  function create() {
    start(async () => {
      const r = await createInviteCode(label);
      if (r.ok) {
        setJustCreated(r.code ?? null);
        setLabel("");
        toast.success("Invite created");
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  function revoke(code: string) {
    start(async () => {
      const r = await revokeInviteCode(code);
      if (r.ok) { toast.success("Revoked"); router.refresh(); }
      else toast.error(r.error);
    });
  }

  function askVerify() {
    start(async () => {
      const r = await raiseAdminRequest("verify");
      if (r.ok) toast.success("Request sent");
      else toast.error(r.error);
    });
  }

  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); toast.success("Copied"); }
    catch { toast.error("Couldn't copy"); }
  }

  function shareUrl(code: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/signup?code=${code}`;
  }

  if (!canCreate) {
    return (
      <div
        className="p-5 md:p-6 rounded-2xl"
        style={{
          background: "color-mix(in oklab, var(--ink-0) 3%, transparent)",
          border: "1px solid var(--line)",
        }}
      >
        <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>
          You&rsquo;re not verified yet
        </div>
        <p className="mt-2 text-[15px]" style={{ color: "var(--ink-1)" }}>
          Only verified shishyas (and the guru) can generate invite codes. Ask an admin to verify you, or
          send a request now.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={askVerify} disabled={pending} className="btn">Request verification</button>
          <Link href="/app/profile" className="btn btn-ghost">Or contact an admin →</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Create form */}
      <div
        className="p-5 md:p-6 rounded-2xl"
        style={{
          background: "color-mix(in oklab, var(--ink-0) 3%, transparent)",
          border: "1px solid var(--line)",
        }}
      >
        <div className="field-group">
          <label>Label (optional)</label>
          <input
            className="field"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder='e.g. "for Anita’s parents"'
            maxLength={80}
          />
        </div>
        <button onClick={create} disabled={pending} className="btn mt-4">
          {pending ? "Creating…" : "Generate code"}
        </button>
      </div>

      {/* Just-created code highlight */}
      {justCreated && (
        <div
          className="mt-6 p-5 rounded-2xl"
          style={{
            background: "color-mix(in oklab, var(--accent) 10%, transparent)",
            border: "1px solid color-mix(in oklab, var(--accent) 30%, var(--line))",
          }}
        >
          <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--accent-soft)" }}>
            New code
          </div>
          <div className="mt-2 font-display tracking-[0.25em]" style={{ fontSize: "clamp(36px, 6vw, 52px)", color: "var(--ink-0)" }}>
            {justCreated}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => copy(justCreated)} className="btn text-sm py-2 px-4 inline-flex items-center gap-2">
              <Copy size={14} /> Copy code
            </button>
            <button onClick={() => copy(shareUrl(justCreated))} className="btn btn-ghost text-sm py-2 px-4 inline-flex items-center gap-2">
              <Copy size={14} /> Copy signup link
            </button>
          </div>
          <p className="mt-3 text-xs" style={{ color: "var(--ink-2)" }}>
            Share it via WhatsApp. Whoever signs up with it joins as audience; you&rsquo;ll be listed as their inviter.
          </p>
        </div>
      )}

      {/* Mine */}
      <div className="mt-10">
        <h2 className="font-display text-2xl md:text-3xl">Your codes</h2>
        {mine.length === 0 ? (
          <p className="mt-4 text-sm" style={{ color: "var(--ink-2)" }}>You haven&rsquo;t made any yet.</p>
        ) : (
          <ul className="mt-5 divide-y" style={{ borderColor: "var(--line)" }}>
            {mine.map((c) => {
              const expired = new Date(c.expires_at).getTime() < Date.now();
              const revoked = !!c.revoked_at;
              const inactive = expired || revoked;
              return (
                <li key={c.code} className="border-t first:border-t-0 py-3" style={{ borderColor: "var(--line)" }}>
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <div>
                      <span className="font-mono tracking-[0.2em]" style={{ color: inactive ? "var(--ink-2)" : "var(--ink-0)" }}>
                        {c.code}
                      </span>
                      {c.label && (
                        <span className="ml-3 text-xs" style={{ color: "var(--ink-2)" }}>{c.label}</span>
                      )}
                    </div>
                    <div className="text-xs" style={{ color: revoked ? "#ff8585" : expired ? "var(--ink-2)" : "var(--accent-soft)" }}>
                      {revoked ? "revoked" : expired ? "expired" : `${c.redeemed_count} used`}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button onClick={() => copy(c.code)} className="btn btn-ghost text-xs py-1.5 px-3">Copy</button>
                    <button onClick={() => copy(shareUrl(c.code))} className="btn btn-ghost text-xs py-1.5 px-3">Copy link</button>
                    {!inactive && (
                      <button onClick={() => revoke(c.code)} disabled={pending} className="btn-link text-xs" style={{ color: "#ff8585" }}>
                        Revoke
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
