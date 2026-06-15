import { redirect } from "next/navigation";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/server";
import { labelForAction } from "@/lib/activityLabels";
import MarkRead from "./MarkRead";

type Row = {
  id: number;
  actor_id: string | null;
  action: string;
  target_table: string | null;
  target_id: string | null;
  created_at: string;
};

type ProfileLite = { id: string; first_name: string; last_name: string; profile_pic_url: string | null };

export default async function ActivityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("role, is_admin, notifications_read_at")
    .eq("id", user.id)
    .single();
  if (!me || (me.role !== "guru" && !me.is_admin)) redirect("/app");

  const { data: rowsRaw } = await supabase
    .from("activity_log")
    .select("id, actor_id, action, target_table, target_id, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (rowsRaw ?? []) as Row[];

  const userIds = new Set<string>();
  rows.forEach((r) => {
    if (r.actor_id) userIds.add(r.actor_id);
    if (r.target_table === "profiles" && r.target_id) userIds.add(r.target_id);
  });

  const { data: profs } = userIds.size > 0
    ? await supabase.from("profiles").select("id, first_name, last_name, profile_pic_url").in("id", Array.from(userIds))
    : { data: [] as ProfileLite[] };
  const pmap = new Map<string, ProfileLite>();
  (profs ?? []).forEach((p) => pmap.set(p.id, p as ProfileLite));

  const lastRead = me.notifications_read_at ? new Date(me.notifications_read_at).getTime() : 0;

  return (
    <PageTransition>
      <section className="pt-6">
        <div className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>Activity</div>
        <h1 className="font-display text-4xl md:text-5xl">What changed in the aangan.</h1>
        <p className="mt-3" style={{ color: "var(--ink-1)" }}>
          Visible to gurus &amp; admin shishyas only. Most recent first.
        </p>

        <MarkRead />

        <ul className="mt-10 divide-y" style={{ borderColor: "var(--line)" }}>
          {rows.map((r) => {
            const actor = r.actor_id ? pmap.get(r.actor_id) ?? null : null;
            const targetIsProfile = r.target_table === "profiles" && r.target_id ? pmap.get(r.target_id) ?? null : null;
            const isUnread = new Date(r.created_at).getTime() > lastRead;
            return (
              <li
                key={r.id}
                className="border-t first:border-t-0 py-4 flex items-start gap-4"
                style={{ borderColor: "var(--line)" }}
              >
                <span
                  className="mt-2 w-2 h-2 rounded-full shrink-0"
                  style={{ background: isUnread ? "var(--accent)" : "transparent", border: isUnread ? "none" : "1px solid var(--ink-2)" }}
                  aria-label={isUnread ? "unread" : "read"}
                />
                <div className="flex-1">
                  <div className="text-sm" style={{ color: "var(--ink-0)" }}>
                    {actor ? (
                      <Link href={`/app/shishyas/${actor.id}`} className="font-medium">
                        {actor.first_name} {actor.last_name}
                      </Link>
                    ) : <span style={{ color: "var(--ink-2)" }}>Someone</span>}{" "}
                    <span style={{ color: "var(--ink-1)" }}>{labelForAction(r.action)}</span>
                    {targetIsProfile && targetIsProfile.id !== r.actor_id && (
                      <>
                        {" — "}
                        <Link href={`/app/shishyas/${targetIsProfile.id}`} className="underline" style={{ textUnderlineOffset: 3, color: "var(--ink-1)" }}>
                          {targetIsProfile.first_name} {targetIsProfile.last_name}
                        </Link>
                      </>
                    )}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--ink-2)" }}>
                    {new Date(r.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true })}
                  </div>
                </div>
              </li>
            );
          })}
          {rows.length === 0 && (
            <li className="py-8 text-center" style={{ color: "var(--ink-2)" }}>Nothing has stirred yet.</li>
          )}
        </ul>
      </section>
    </PageTransition>
  );
}
