import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/server";
import type { Instrument, Scale } from "@/lib/types";
import PerformanceForm from "../PerformanceForm";

export default async function MyPerformance() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: perf } = await supabase.from("performances").select("*").eq("user_id", user.id).maybeSingle();

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
        <div className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>Your offering</div>
        <h1 className="font-display text-4xl md:text-5xl">What will you sing?</h1>
        <PerformanceForm initial={initial} />
      </div>
    </PageTransition>
  );
}
