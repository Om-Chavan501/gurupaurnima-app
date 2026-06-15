import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/server";
import { INSTRUMENTS, SCALES, type Instrument, type Profile, type Scale } from "@/lib/types";

type Row = {
  id: string;
  user_id: string;
  will_perform: boolean;
  composition_name: string | null;
  scale: Scale | null;
  instruments: Instrument[];
  profiles: Pick<Profile, "first_name" | "last_name" | "profile_pic_url" | "role"> | null;
};

export default async function PerformancesPage() {
  const supabase = await createClient();

  const [{ data: perfRaw }, { data: shishyas }, { data: gp }] = await Promise.all([
    supabase
      .from("performances")
      .select("id, user_id, will_perform, composition_name, scale, instruments, profiles!inner(first_name, last_name, profile_pic_url, role)")
      .order("updated_at", { ascending: false }),
    supabase.from("profiles").select("id, first_name, last_name, role").in("role", ["shishya", "guru"]),
    supabase.from("performances").select("user_id"),
  ]);

  const perf = (perfRaw ?? []) as unknown as Row[];

  const performing = perf.filter((p) => p.will_perform);
  const notPerforming = perf.filter((p) => !p.will_perform);
  const decidedIds = new Set((gp ?? []).map((g) => g.user_id));
  const pending = (shishyas ?? []).filter((s) => !decidedIds.has(s.id));

  return (
    <PageTransition>
      <section className="pt-6">
        <div className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>Compositions</div>
        <h1 className="font-display text-4xl md:text-5xl">What will be offered.</h1>
        <p className="mt-3" style={{ color: "var(--ink-1)" }}>So no two souls pick the same.</p>

        <div className="mt-6 flex gap-3">
          <Link href="/app/performances/mine" className="btn">Mine →</Link>
        </div>

        <h2 className="font-display text-2xl mt-16">Pledged ({performing.length})</h2>
        <ul className="mt-6 divide-y" style={{ borderColor: "var(--line)" }}>
          {performing.map((p) => (
            <li key={p.id} className="border-t first:border-t-0 py-5" style={{ borderColor: "var(--line)" }}>
              <Link href={`/app/shishyas/${p.user_id}`} className="block">
                <div className="font-display text-2xl">{p.composition_name ?? <span style={{ color: "var(--ink-2)" }}>(unnamed)</span>}</div>
                <div className="text-sm mt-1" style={{ color: "var(--ink-1)" }}>
                  {p.profiles?.first_name} {p.profiles?.last_name}
                  {" · "}
                  {p.scale ? `${p.scale} (${SCALES.find(s => s.value === p.scale)?.marathi})` : "scale —"}
                </div>
                {p.instruments.length > 0 && (
                  <div className="text-xs mt-1" style={{ color: "var(--ink-2)" }}>
                    Needs: {p.instruments.map(i => INSTRUMENTS.find(x => x.value === i)?.label).filter(Boolean).join(", ")}
                  </div>
                )}
              </Link>
            </li>
          ))}
          {performing.length === 0 && <li className="py-6" style={{ color: "var(--ink-2)" }}>None yet.</li>}
        </ul>

        <h2 className="font-display text-2xl mt-16">Not performing ({notPerforming.length})</h2>
        <ul className="mt-4 space-y-1 text-sm" style={{ color: "var(--ink-1)" }}>
          {notPerforming.map((p) => (
            <li key={p.id}>· {p.profiles?.first_name} {p.profiles?.last_name}</li>
          ))}
          {notPerforming.length === 0 && <li style={{ color: "var(--ink-2)" }}>—</li>}
        </ul>

        <h2 className="font-display text-2xl mt-16">Yet to decide ({pending.length})</h2>
        <ul className="mt-4 space-y-1 text-sm" style={{ color: "var(--ink-1)" }}>
          {pending.map((p) => (
            <li key={p.id} className="flex items-center justify-between">
              <Link href={`/app/shishyas/${p.id}`}>· {p.first_name} {p.last_name}</Link>
              <NudgeLink id={p.id} />
            </li>
          ))}
          {pending.length === 0 && <li style={{ color: "var(--ink-2)" }}>Everyone has chimed in.</li>}
        </ul>

        <div className="mt-16 p-6 rounded-2xl" style={{ background: "var(--bg-1)", border: "1px solid var(--line)" }}>
          <div className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: "var(--ink-2)" }}>Need to finalise with the guru?</div>
          <a
            className="font-display text-2xl block"
            target="_blank"
            href={`https://wa.me/${(process.env.NEXT_PUBLIC_GURU_WHATSAPP ?? "").replace(/\D/g, "")}`}
          >
            Chat with Saurabh Dada on WhatsApp →
          </a>
          <a className="text-sm mt-2 inline-block" style={{ color: "var(--ink-1)" }}
             href={`tel:${process.env.NEXT_PUBLIC_GURU_PHONE ?? ""}`}>
            or call: {process.env.NEXT_PUBLIC_GURU_PHONE ?? "—"}
          </a>
        </div>
      </section>
    </PageTransition>
  );
}

function NudgeLink({ id }: { id: string }) {
  return <Link href={`/app/shishyas/${id}`} className="text-xs" style={{ color: "var(--ink-2)" }}>view →</Link>;
}
