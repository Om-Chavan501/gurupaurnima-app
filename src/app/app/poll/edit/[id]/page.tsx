import { notFound, redirect } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/server";
import type { EventDate } from "@/lib/types";
import PollForm from "../../PollForm";

export default async function EditPollFor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("role, is_admin").eq("id", user.id).single();
  if (!me || (me.role !== "guru" && !me.is_admin)) redirect("/app");

  const { data: target } = await supabase.from("profiles").select("first_name, last_name").eq("id", id).maybeSingle();
  if (!target) notFound();

  const { data: picks } = await supabase.from("attendance_poll").select("date").eq("user_id", id);
  const initial = (picks ?? []).map((p) => p.date as EventDate);

  return (
    <PageTransition>
      <div className="pt-6">
        <div className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>Edit on behalf</div>
        <h1 className="font-display text-4xl">Dates for {target.first_name} {target.last_name}</h1>
        <PollForm initial={initial} targetUserId={id} />
      </div>
    </PageTransition>
  );
}
