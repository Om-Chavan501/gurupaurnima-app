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
      <div className="pt-2 md:pt-6 max-w-2xl">
        <div className="text-[11px] tracking-[0.32em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>Your performance</div>
        <h1 className="font-display" style={{ fontSize: "clamp(34px, 5.5vw, 50px)", lineHeight: 1.05 }}>
          What will you sing or play?
        </h1>
        <p className="mt-3 text-[15px]" style={{ color: "var(--ink-1)" }}>
          You can come back and change this any time.
        </p>
        <PerformanceForm initial={initial} />
      </div>
    </PageTransition>
  );
}
