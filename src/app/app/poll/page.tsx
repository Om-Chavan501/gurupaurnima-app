import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/server";
import { EVENT_DATES, type EventDate } from "@/lib/types";
import PollForm from "./PollForm";

export default async function PollPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: myPicks }, { data: all }] = await Promise.all([
    supabase.from("attendance_poll").select("date").eq("user_id", user.id),
    supabase.from("attendance_poll").select("date, user_id, profiles!inner(first_name, last_name)"),
  ]);

  const myPicked = (myPicks ?? []).map((p) => p.date as EventDate);
  const tally: Record<EventDate, { first_name: string; last_name: string; id: string }[]> = {
    "2026-07-31": [], "2026-08-01": [], "2026-08-02": [],
  };
  (all ?? []).forEach((row) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p: any = row.profiles;
    tally[row.date as EventDate].push({
      id: row.user_id as string,
      first_name: p.first_name,
      last_name: p.last_name,
    });
  });

  return (
    <PageTransition>
      <section className="pt-6">
        <div className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>The poll</div>
        <h1 className="font-display text-4xl md:text-5xl">Which evening will you grace?</h1>
        <p className="mt-3 max-w-xl" style={{ color: "var(--ink-1)" }}>
          Pick all the dates that suit. Leave empty if none can.
        </p>

        <PollForm initial={myPicked} />

        <div className="mt-20 grid md:grid-cols-3 gap-10">
          {EVENT_DATES.map((d) => (
            <div key={d.value}>
              <div className="text-xs tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>{d.label}</div>
              <div className="font-display text-3xl mt-1">{tally[d.value].length}</div>
              <ul className="mt-3 space-y-1 text-sm" style={{ color: "var(--ink-1)" }}>
                {tally[d.value].slice(0, 30).map((p) => (
                  <li key={p.id}>· {p.first_name} {p.last_name}</li>
                ))}
                {tally[d.value].length > 30 && (
                  <li style={{ color: "var(--ink-2)" }}>and {tally[d.value].length - 30} more</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
