import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EVENT_DATES } from "@/lib/types";
import { getT } from "@/lib/i18n-server";

export default async function EventPage() {
  const t = await getT();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <PageTransition>
      <section className="pt-2 md:pt-6">
        <div className="text-[11px] tracking-[0.32em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>
          {t("event.kicker")}
        </div>
        <h1 className="font-display" style={{ fontSize: "clamp(34px, 5.5vw, 54px)", lineHeight: 1.05 }}>
          {t("event.h1")}
        </h1>
        <p className="mt-3 max-w-xl text-[15px]" style={{ color: "var(--ink-1)" }}>
          {t("event.intro")}
        </p>
      </section>

      <div className="rule mt-10" />

      <section className="pt-8">
        <dl className="grid md:grid-cols-2 gap-y-8 gap-x-12">
          <Row label={t("event.possibleDates")} value={
            <ul className="space-y-1">
              {EVENT_DATES.map((d) => (
                <li key={d.value} className="font-display-soft text-lg" style={{ color: "var(--ink-0)" }}>{t(`date.${d.value}`)}</li>
              ))}
            </ul>
          } note={t("event.datesNote")} />

          <Row label={t("event.venue")} value={<TBD label={t("common.tbd")} />} note={t("event.venueNote")} />
          <Row label={t("event.time")} value={<TBD label={t("common.tbd")} />} note={t("event.timeNote")} />
          <Row label={t("event.format")} value={<TBD label={t("common.tbd")} />} note={t("event.formatNote")} />
          <Row label={t("event.dress")} value={<TBD label={t("common.tbd")} />} note={t("event.dressNote")} />
          <Row label={t("event.entry")} value={t("event.entryValue")} note={t("event.entryNote")} />
        </dl>
      </section>

      <div className="rule mt-12" />

      <section className="pt-8 pb-6">
        <p className="text-sm" style={{ color: "var(--ink-2)" }}>
          {t("event.footer")}
        </p>
      </section>
    </PageTransition>
  );
}

function TBD({ label }: { label: string }) {
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-xs tracking-[0.25em] uppercase"
      style={{ background: "var(--bg-2)", color: "var(--ink-2)", border: "1px solid var(--line)" }}
    >
      {label}
    </span>
  );
}

function Row({ label, value, note }: { label: string; value: React.ReactNode; note?: string }) {
  return (
    <div>
      <dt className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>{label}</dt>
      <dd className="mt-2 font-display-soft text-lg" style={{ color: "var(--ink-0)" }}>{value}</dd>
      {note && <p className="mt-1.5 text-xs" style={{ color: "var(--ink-2)" }}>{note}</p>}
    </div>
  );
}
