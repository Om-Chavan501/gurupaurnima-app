import { redirect } from "next/navigation";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/server";
import { todaysShishyaCode } from "@/lib/shishyaCode";
import type { AdminRequest, InviteCode, Profile } from "@/lib/types";
import RequestDecisionRow from "./RequestDecisionRow";
import TodaysCode from "./TodaysCode";
import { getT } from "@/lib/i18n-server";

type RequestWithUser = AdminRequest & {
  user: Pick<Profile, "id" | "first_name" | "last_name" | "email" | "role" | "is_verified"> | null;
};
type CodeWithCreator = InviteCode & {
  creator: Pick<Profile, "first_name" | "last_name"> | null;
};

export default async function AdminConsole() {
  const t = await getT();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase
    .from("profiles")
    .select("role, is_admin")
    .eq("id", user.id)
    .single();
  if (!me || (me.role !== "guru" && !me.is_admin)) redirect("/app");

  // Compute today's code on the server (HMAC) — safe to render directly.
  let code: string | null = null;
  let codeError: string | null = null;
  try {
    code = todaysShishyaCode();
  } catch (e) {
    codeError = e instanceof Error ? e.message : "code unavailable";
  }

  const [{ data: pendingReq }, { data: recentInvites }] = await Promise.all([
    supabase
      .from("admin_requests")
      .select("id, user_id, request_type, status, decided_by, decided_at, reason, created_at, user:profiles!admin_requests_user_id_fkey(id, first_name, last_name, email, role, is_verified)")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase
      .from("invite_codes")
      .select("code, creator_id, label, created_at, expires_at, redeemed_count, revoked_at, creator:profiles!invite_codes_creator_id_fkey(first_name, last_name)")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const pending = (pendingReq ?? []) as unknown as RequestWithUser[];
  const invites = (recentInvites ?? []) as unknown as CodeWithCreator[];

  return (
    <PageTransition>
      <section className="pt-2 md:pt-6">
        <div className="text-[11px] tracking-[0.32em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>
          {t("admin.kicker")}
        </div>
        <h1 className="font-display" style={{ fontSize: "clamp(34px, 5.5vw, 54px)", lineHeight: 1.05 }}>
          {t("admin.h1")}
        </h1>
        <p className="mt-3 max-w-xl text-[15px]" style={{ color: "var(--ink-1)" }}>
          {t("admin.intro")}
        </p>
      </section>

      <div className="rule mt-10" />

      {/* ===== Today's code ===== */}
      <section className="pt-8">
        <TodaysCode code={code} error={codeError} />
        <p className="mt-3 text-xs" style={{ color: "var(--ink-2)" }}>
          {t("admin.todayNote")}
        </p>
      </section>

      <div className="rule mt-10" />

      {/* ===== Pending requests ===== */}
      <section className="pt-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl md:text-3xl">{t("admin.pendingRequests")}</h2>
          <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>
            {pending.length}
          </span>
        </div>

        {pending.length === 0 ? (
          <p className="mt-5 text-sm" style={{ color: "var(--ink-2)" }}>{t("admin.nothingWaiting")}</p>
        ) : (
          <ul className="mt-5 divide-y" style={{ borderColor: "var(--line)" }}>
            {pending.map((r) => (
              <li key={r.id} className="border-t first:border-t-0 py-4" style={{ borderColor: "var(--line)" }}>
                <RequestDecisionRow request={r} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="rule mt-10" />

      {/* ===== Recent invites ===== */}
      <section className="pt-8 pb-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl md:text-3xl">{t("admin.recentInvites")}</h2>
          <Link href="/app/invite" className="btn btn-ghost text-sm py-2 px-4">{t("admin.createOne")}</Link>
        </div>

        {invites.length === 0 ? (
          <p className="mt-5 text-sm" style={{ color: "var(--ink-2)" }}>{t("admin.noInvites")}</p>
        ) : (
          <ul className="mt-5 divide-y" style={{ borderColor: "var(--line)" }}>
            {invites.map((inv) => {
              const expired = new Date(inv.expires_at).getTime() < Date.now();
              const revoked = !!inv.revoked_at;
              return (
                <li key={inv.code} className="border-t first:border-t-0 py-3" style={{ borderColor: "var(--line)" }}>
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <div>
                      <span className="font-mono tracking-[0.2em]" style={{ color: "var(--ink-0)" }}>{inv.code}</span>
                      <span className="ml-3 text-xs" style={{ color: "var(--ink-2)" }}>
                        by {inv.creator?.first_name} {inv.creator?.last_name}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: revoked ? "#ff8585" : expired ? "var(--ink-2)" : "var(--accent-soft)" }}>
                      {revoked ? t("common.revoked") : expired ? t("common.expired") : `${inv.redeemed_count} ${t("common.used")} · ${formatRemaining(inv.expires_at)}`}
                    </div>
                  </div>
                  {inv.label && (
                    <div className="text-xs mt-1" style={{ color: "var(--ink-2)" }}>{inv.label}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </PageTransition>
  );
}

function formatRemaining(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "expired";
  const hrs = Math.floor(ms / 3_600_000);
  if (hrs >= 1) return `${hrs}h left`;
  const mins = Math.max(1, Math.floor(ms / 60_000));
  return `${mins}m left`;
}
