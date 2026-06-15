import { redirect } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/server";
import type { InviteCode } from "@/lib/types";
import InvitePanel from "./InvitePanel";

export default async function InvitePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("is_verified, role, first_name")
    .eq("id", user.id)
    .single();
  if (!me) redirect("/app");

  const canCreate = me.is_verified || me.role === "guru";

  const { data: mine } = await supabase
    .from("invite_codes")
    .select("*")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <PageTransition>
      <section className="pt-2 md:pt-6">
        <div className="text-[11px] tracking-[0.32em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>
          Invite someone
        </div>
        <h1 className="font-display" style={{ fontSize: "clamp(34px, 5.5vw, 54px)", lineHeight: 1.05 }}>
          Bring an audience.
        </h1>
        <p className="mt-3 max-w-xl text-[15px]" style={{ color: "var(--ink-1)" }}>
          Generate a 6-character code and share it with someone you&rsquo;d like to bring as audience.
          Each code is good for 24 hours and can be used by multiple people.
        </p>
      </section>

      <div className="rule mt-10" />

      <section className="pt-8">
        <InvitePanel
          canCreate={canCreate}
          mine={(mine ?? []) as InviteCode[]}
          userId={user.id}
        />
      </section>
    </PageTransition>
  );
}
