"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { setVerified, setAdmin, removeProfile, setUserRole } from "@/lib/actions";
import type { Role } from "@/lib/types";
import { useT } from "@/components/LocaleProvider";

type Props = {
  targetId: string;
  isVerified: boolean;
  isAdmin: boolean;
  role: Role;
  viewerIsGuru: boolean;
};

export default function AdminActions({ targetId, isVerified, isAdmin, role, viewerIsGuru }: Props) {
  const t = useT();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function toggleVerified() {
    start(async () => {
      const r = await setVerified(targetId, !isVerified);
      if (r.ok) { toast.success(!isVerified ? t("shishyaDetail.markVerified") : t("shishyaDetail.revokeVerified")); router.refresh(); }
      else toast.error(r.error ?? "Failed");
    });
  }
  function toggleAdmin() {
    if (!isVerified && !isAdmin) {
      toast.error(t("profile.askNotVerifiedAddendum"));
      return;
    }
    start(async () => {
      const r = await setAdmin(targetId, !isAdmin);
      if (r.ok) { toast.success(!isAdmin ? t("shishyaDetail.makeAdmin") : t("shishyaDetail.revokeAdmin")); router.refresh(); }
      else toast.error(r.error ?? "Failed");
    });
  }
  function changeRole(to: "shishya" | "audience") {
    start(async () => {
      const r = await setUserRole(targetId, to);
      if (r.ok) { toast.success(to === "shishya" ? t("shishyaDetail.moveToShishya") : t("shishyaDetail.moveToAudience")); router.refresh(); }
      else toast.error(r.error ?? "Failed");
    });
  }
  function remove() {
    start(async () => {
      const r = await removeProfile(targetId);
      if (r.ok) { toast.success(t("shishyaDetail.removeProfile")); router.push("/app/shishyas"); }
      else toast.error(r.error ?? "Failed");
    });
  }

  return (
    <>
      {role === "shishya" && <Link href={`/app/performances/edit/${targetId}`} className="btn btn-ghost">{t("shishyaDetail.editComp")}</Link>}
      <Link href={`/app/poll/edit/${targetId}`} className="btn btn-ghost">{t("shishyaDetail.editDates")}</Link>
      <button className="btn btn-ghost" disabled={pending} onClick={toggleVerified}>
        {isVerified ? t("shishyaDetail.revokeVerified") : t("shishyaDetail.markVerified")}
      </button>
      {viewerIsGuru && (
        <button
          className="btn btn-ghost"
          disabled={pending || (!isVerified && !isAdmin)}
          onClick={toggleAdmin}
          title={!isVerified && !isAdmin ? t("profile.askNotVerifiedAddendum") : ""}
        >
          {isAdmin ? t("shishyaDetail.revokeAdmin") : t("shishyaDetail.makeAdmin")}
        </button>
      )}
      {role === "audience" && (
        <button className="btn btn-ghost" disabled={pending} onClick={() => changeRole("shishya")}>
          {t("shishyaDetail.moveToShishya")}
        </button>
      )}
      {role === "shishya" && (
        <button className="btn btn-ghost" disabled={pending} onClick={() => changeRole("audience")}>
          {t("shishyaDetail.moveToAudience")}
        </button>
      )}
      {!confirming ? (
        <button className="btn btn-ghost" onClick={() => setConfirming(true)}>{t("shishyaDetail.removeProfile")}</button>
      ) : (
        <>
          <button className="btn" disabled={pending} onClick={remove}>{t("shishyaDetail.confirmRemove")}</button>
          <button className="btn btn-ghost" onClick={() => setConfirming(false)}>{t("common.cancel")}</button>
        </>
      )}
    </>
  );
}
