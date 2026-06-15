import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/server";
import { EVENT_DATES } from "@/lib/types";

export default async function AppHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: poll }, { data: perf }, { count: shishyaCount }, { count: pollCount }, { count: perfCount }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("attendance_poll").select("date").eq("user_id", user.id),
    supabase.from("performances").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("attendance_poll").select("*", { count: "exact", head: true }),
    supabase.from("performances").select("*", { count: "exact", head: true }).eq("will_perform", true),
  ]);

  const picked = (poll ?? []).map((p) => p.date);
  const pollDone = picked.length > 0;
  const perfDone = perf !== null;

  return (
    <PageTransition>
      <section className="pt-8">
        <p className="text-xs tracking-[0.4em] uppercase" style={{ color: "var(--ink-2)" }}>
          Namaskar
        </p>
        <h1 className="font-display text-4xl md:text-6xl mt-2">
          {profile?.first_name},<br />the aangan awaits.
        </h1>

        <div className="mt-12 grid md:grid-cols-2 gap-10">
          <StepRow
            n={1}
            title="Tell us which evening suits you."
            done={pollDone}
            doneNote={pollDone ? `You picked ${picked.length} night${picked.length>1?"s":""}.` : "Three options — pick one or many."}
            href="/app/poll"
            cta={pollDone ? "Edit your choice" : "Open the poll"}
          />
          <StepRow
            n={2}
            title="Will you offer something?"
            done={perfDone}
            doneNote={perfDone ? (perf!.will_perform ? `Yes — ${perf!.composition_name ?? "details pending"}.` : "You marked: not performing.") : "Composition, scale, instruments needed on stage."}
            href="/app/performances/mine"
            cta={perfDone ? "Edit details" : "Begin"}
          />
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <Stat label="Shishyas signed in" value={shishyaCount ?? 0} href="/app/shishyas" />
          <Stat label="Date picks recorded" value={pollCount ?? 0} href="/app/poll" />
          <Stat label="Compositions pledged" value={perfCount ?? 0} href="/app/performances" />
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-6">
          <p className="md:col-span-2 font-display text-3xl leading-tight" style={{ color: "var(--ink-0)" }}>
            &ldquo;गुरु बिन ज्ञान न उपजै, गुरु बिन मिले न मोक्ष.&rdquo;
          </p>
          <div>
            <div className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: "var(--ink-2)" }}>The dates</div>
            <ul className="space-y-1" style={{ color: "var(--ink-1)" }}>
              {EVENT_DATES.map((d) => <li key={d.value}>· {d.label}</li>)}
            </ul>
            <Link href="/app/whatsapp" className="btn btn-ghost mt-6">WhatsApp group →</Link>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}

function StepRow({ n, title, done, doneNote, href, cta }: {
  n: number; title: string; done: boolean; doneNote: string; href: string; cta: string;
}) {
  return (
    <Link href={href} className="block group">
      <div className="flex items-baseline gap-4">
        <span className="font-display text-5xl" style={{ color: done ? "var(--accent)" : "var(--ink-2)" }}>
          {n.toString().padStart(2, "0")}
        </span>
        <div className="flex-1">
          <div className="font-display text-2xl">{title}</div>
          <div className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>{doneNote}</div>
        </div>
      </div>
      <div className="mt-4 h-px transition-all" style={{ background: "var(--line)" }} />
      <div className="mt-3 text-sm flex justify-between" style={{ color: "var(--ink-1)" }}>
        <span>{done ? "✓ Done" : "Pending"}</span>
        <span className="group-hover:translate-x-1 transition-transform" style={{ color: "var(--accent-soft)" }}>{cta} →</span>
      </div>
    </Link>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="block">
      <div className="text-xs tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>{label}</div>
      <div className="font-display text-5xl mt-1">{value}</div>
    </Link>
  );
}
