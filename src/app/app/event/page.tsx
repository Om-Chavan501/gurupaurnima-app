import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EVENT_DATES } from "@/lib/types";

export default async function EventPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <PageTransition>
      <section className="pt-2 md:pt-6">
        <div className="text-[11px] tracking-[0.32em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>
          The concert
        </div>
        <h1 className="font-display" style={{ fontSize: "clamp(34px, 5.5vw, 54px)", lineHeight: 1.05 }}>
          Saurabh Dada&rsquo;s Gurupaurnima 2026.
        </h1>
        <p className="mt-3 max-w-xl text-[15px]" style={{ color: "var(--ink-1)" }}>
          An evening of compositions by his shishyas. Final details land closer to the date — bookmark this page.
        </p>
      </section>

      <div className="rule mt-10" />

      <section className="pt-8">
        <dl className="grid md:grid-cols-2 gap-y-8 gap-x-12">
          <Row label="Possible dates" value={
            <ul className="space-y-1">
              {EVENT_DATES.map((d) => (
                <li key={d.value} className="font-display-soft text-lg" style={{ color: "var(--ink-0)" }}>{d.label}</li>
              ))}
            </ul>
          } note="One will be picked based on the poll of shishyas." />

          <Row label="Venue" value={<TBD />} note="To be finalised. Will be in Pune." />
          <Row label="Time" value={<TBD />} note="Evening recital." />
          <Row label="Format" value={<TBD />} note="Brief introduction by the guru, followed by performances, closing remarks." />
          <Row label="Dress" value={<TBD />} note="Traditional preferred but not required." />
          <Row label="Entry" value="By invite only" note="Audience joins via an invite code from a verified shishya or the guru." />
        </dl>
      </section>

      <div className="rule mt-12" />

      <section className="pt-8 pb-6">
        <p className="text-sm" style={{ color: "var(--ink-2)" }}>
          The blanks above will fill in once they&rsquo;re confirmed. We&rsquo;ll let you know in the activity feed
          when something changes.
        </p>
      </section>
    </PageTransition>
  );
}

function TBD() {
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-xs tracking-[0.25em] uppercase"
      style={{ background: "var(--bg-2)", color: "var(--ink-2)", border: "1px solid var(--line)" }}
    >
      To be finalised
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
