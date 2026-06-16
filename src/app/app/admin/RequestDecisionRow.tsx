"use client";
import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { decideAdminRequest } from "@/lib/actions";
import type { AdminRequest, Profile } from "@/lib/types";
import { useT } from "@/components/LocaleProvider";

type RequestWithUser = AdminRequest & {
  user: Pick<Profile, "id" | "first_name" | "last_name" | "email" | "role" | "is_verified"> | null;
};

export default function RequestDecisionRow({ request }: { request: RequestWithUser }) {
  const t = useT();
  const TYPE_LABEL: Record<AdminRequest["request_type"], string> = {
    verify: t("admin.reqVerify"),
    change_to_shishya: t("admin.reqToShishya"),
    change_to_audience: t("admin.reqToAudience"),
  };
  const router = useRouter();
  const [pending, start] = useTransition();

  function decide(decision: "accepted" | "rejected" | "ignored") {
    start(async () => {
      const r = await decideAdminRequest(request.id, decision);
      if (r.ok) {
        const map = {
          accepted: t("admin.markedAccepted"),
          rejected: t("admin.markedRejected"),
          ignored: t("admin.markedIgnored"),
        } as const;
        toast.success(map[decision]);
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          {request.user ? (
            <Link href={`/app/shishyas/${request.user.id}`} className="font-medium" style={{ color: "var(--ink-0)" }}>
              {request.user.first_name} {request.user.last_name}
            </Link>
          ) : (
            <span style={{ color: "var(--ink-2)" }}>—</span>
          )}
          <span className="ml-2 text-sm" style={{ color: "var(--ink-1)" }}>{TYPE_LABEL[request.request_type]}</span>
        </div>
        <div className="text-[10px] tracking-[0.25em] uppercase" style={{ color: "var(--ink-2)" }}>
          {request.user?.role}{request.user?.is_verified ? " · verified" : ""}
        </div>
      </div>
      {request.reason && (
        <div className="mt-1.5 text-xs italic" style={{ color: "var(--ink-2)" }}>
          &ldquo;{request.reason}&rdquo;
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button disabled={pending} onClick={() => decide("accepted")} className="btn text-sm py-2 px-4">{t("admin.accept")}</button>
        <button disabled={pending} onClick={() => decide("rejected")} className="btn btn-ghost text-sm py-2 px-4">{t("admin.reject")}</button>
        <button disabled={pending} onClick={() => decide("ignored")} className="btn-link text-sm">{t("admin.ignore")}</button>
      </div>
    </div>
  );
}
