"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { setVerified, setAdmin, removeProfile } from "@/lib/actions";

export default function AdminActions({ targetId, isVerified, isAdmin }: { targetId: string; isVerified: boolean; isAdmin: boolean }) {
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
    start(async () => {
      const r = await setAdmin(targetId, !isAdmin);
      if (r.ok) { toast.success(`Set admin: ${!isAdmin}`); router.refresh(); }
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
      <button className="btn btn-ghost" disabled={pending} onClick={toggleAdmin}>
        {isAdmin ? "Revoke admin" : "Make admin"}
      </button>
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
