import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/server";
import { EVENT_DATES, type EventDate } from "@/lib/types";
import PollForm from "./PollForm";
import { getT } from "@/lib/i18n-server";

export default async function PollPage() {
  const t = await getT();
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
      <section className="pt-2 md:pt-6">
        <div className="text-[11px] tracking-[0.32em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>
          {t("poll.kicker")}
        </div>
        <h1
          className="font-display"
          style={{ fontSize: "clamp(34px, 5.5vw, 54px)", lineHeight: 1.05 }}
        >
          {t("poll.h1")}
        </h1>
        <p className="mt-3 max-w-xl text-[15px]" style={{ color: "var(--ink-1)" }}>
          {t("poll.intro")}
        </p>

        <PollForm initial={myPicked} />
      </section>

      <div className="rule mt-16" />

      <section className="pt-10 pb-6">
        <div className="text-[11px] tracking-[0.32em] uppercase mb-6" style={{ color: "var(--ink-2)" }}>
          {t("poll.whereStands")}
        </div>
        <div className="grid md:grid-cols-3 gap-y-10 md:gap-x-10">
          {EVENT_DATES.map((d) => (
            <div key={d.value}>
              <div className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>
                {t(`date.${d.value}`)}
              </div>
              <div
                className="font-display mt-1"
                style={{ fontSize: "clamp(36px, 5vw, 48px)", color: "var(--ink-0)", lineHeight: 1 }}
              >
                {tally[d.value].length}
              </div>
              <p className="mt-1 text-[11px] tracking-[0.18em] uppercase" style={{ color: "var(--ink-2)" }}>
                {t("poll.available")}
              </p>
              <ul className="mt-4 space-y-1 text-sm" style={{ color: "var(--ink-1)" }}>
                {tally[d.value].slice(0, 30).map((p) => (
                  <li key={p.id} className="truncate">{p.first_name} {p.last_name}</li>
                ))}
                {tally[d.value].length > 30 && (
                  <li style={{ color: "var(--ink-2)" }}>and {tally[d.value].length - 30} more</li>
                )}
                {tally[d.value].length === 0 && (
                  <li style={{ color: "var(--ink-2)" }}>—</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
