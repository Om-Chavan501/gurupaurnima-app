"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { setVerified, setAdmin, removeProfile, setUserRole } from "@/lib/actions";
import type { Role } from "@/lib/types";

type Props = {
  targetId: string;
  isVerified: boolean;
  isAdmin: boolean;
  role: Role;
  viewerIsGuru: boolean;
};

export default function AdminActions({ targetId, isVerified, isAdmin, role, viewerIsGuru }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function toggleVerified() {
    start(async () => {
      const r = await setVerified(targetId, !isVerified);
      if (r.ok) { toast.success(`Marked ${!isVerified ? "verified" : "unverified"}`); router.refresh(); }
      else toast.error(r.error ?? "Failed");
    });
  }
  function toggleAdmin() {
    if (!isVerified && !isAdmin) {
      toast.error("Verify the user first — only verified users can be made admin");
      return;
    }
    start(async () => {
      const r = await setAdmin(targetId, !isAdmin);
      if (r.ok) { toast.success(`Set admin: ${!isAdmin}`); router.refresh(); }
      else toast.error(r.error ?? "Failed");
    });
  }
  function changeRole(to: "shishya" | "audience") {
    start(async () => {
      const r = await setUserRole(targetId, to);
      if (r.ok) { toast.success(`Moved to ${to}`); router.refresh(); }
      else toast.error(r.error ?? "Failed");
    });
  }
  function remove() {
    start(async () => {
      const r = await removeProfile(targetId);
      if (r.ok) { toast.success("Profile removed"); router.push("/app/shishyas"); }
      else toast.error(r.error ?? "Failed");
    });
  }

  return (
    <>
      <Link href={`/app/performances/edit/${targetId}`} className="btn btn-ghost">Edit composition</Link>
      <Link href={`/app/poll/edit/${targetId}`} className="btn btn-ghost">Edit dates</Link>
      <button className="btn btn-ghost" disabled={pending} onClick={toggleVerified}>
        {isVerified ? "Revoke verified" : "Mark verified"}
      </button>
      {viewerIsGuru && (
        <button
          className="btn btn-ghost"
          disabled={pending || (!isVerified && !isAdmin)}
          onClick={toggleAdmin}
          title={!isVerified && !isAdmin ? "User must be verified first" : ""}
        >
          {isAdmin ? "Revoke admin" : "Make admin"}
        </button>
      )}
      {role === "audience" && (
        <button className="btn btn-ghost" disabled={pending} onClick={() => changeRole("shishya")}>
          Move to shishya
        </button>
      )}
      {role === "shishya" && (
        <button className="btn btn-ghost" disabled={pending} onClick={() => changeRole("audience")}>
          Move to audience
        </button>
      )}
      {!confirming ? (
        <button className="btn btn-ghost" onClick={() => setConfirming(true)}>Remove…</button>
      ) : (
        <>
          <button className="btn" disabled={pending} onClick={remove}>Confirm remove</button>
          <button className="btn btn-ghost" onClick={() => setConfirming(false)}>Cancel</button>
        </>
      )}
    </>
  );
}
