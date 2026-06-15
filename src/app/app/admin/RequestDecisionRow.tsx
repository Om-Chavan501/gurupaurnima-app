"use client";
import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { decideAdminRequest } from "@/lib/actions";
import type { AdminRequest, Profile } from "@/lib/types";

type RequestWithUser = AdminRequest & {
  user: Pick<Profile, "id" | "first_name" | "last_name" | "email" | "role" | "is_verified"> | null;
};

const TYPE_LABEL: Record<AdminRequest["request_type"], string> = {
  verify: "asks to be verified",
  change_to_shishya: "asks to be reclassified as shishya",
  change_to_audience: "asks to be reclassified as audience",
};

export default function RequestDecisionRow({ request }: { request: RequestWithUser }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function decide(decision: "accepted" | "rejected" | "ignored") {
    start(async () => {
      const r = await decideAdminRequest(request.id, decision);
      if (r.ok) {
        toast.success(`Marked ${decision}`);
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
            <span style={{ color: "var(--ink-2)" }}>Someone</span>
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
        <button disabled={pending} onClick={() => decide("accepted")} className="btn text-sm py-2 px-4">Accept</button>
        <button disabled={pending} onClick={() => decide("rejected")} className="btn btn-ghost text-sm py-2 px-4">Reject</button>
        <button disabled={pending} onClick={() => decide("ignored")} className="btn-link text-sm">Ignore</button>
      </div>
    </div>
  );
}
