import { notFound, redirect } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/server";
import type { Instrument, Scale } from "@/lib/types";
import PerformanceForm from "../../PerformanceForm";

export default async function EditPerfFor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("role, is_admin").eq("id", user.id).single();
  if (!me || (me.role !== "guru" && !me.is_admin)) redirect("/app");

  const { data: target } = await supabase.from("profiles").select("first_name, last_name").eq("id", id).maybeSingle();
  if (!target) notFound();

  const { data: perf } = await supabase.from("performances").select("*").eq("user_id", id).maybeSingle();
  const initial = perf ? {
    will_perform: perf.will_perform as boolean,
    composition_name: perf.composition_name as string | null,
    composition_notes: perf.composition_notes as string | null,
    scale: perf.scale as Scale | null,
    instruments: (perf.instruments ?? []) as Instrument[],
  } : null;

  return (
    <PageTransition>
      <div className="pt-6 max-w-2xl">
        <div className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>Edit on behalf</div>
        <h1 className="font-display text-4xl">Composition for {target.first_name} {target.last_name}</h1>
        <PerformanceForm initial={initial} targetUserId={id} />
      </div>
    </PageTransition>
  );
}
