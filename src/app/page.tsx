import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import { EVENT_DATES } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <PageTransition>
      <section className="pt-10 md:pt-20">
        <p className="text-xs tracking-[0.4em] uppercase mb-6" style={{ color: "var(--ink-2)" }}>
          A digital aangan
        </p>
        <h1 className="font-display text-5xl md:text-7xl leading-[1.05]">
          for the <span className="mark">guru</span><br />
          and his <span className="mark">shishyas</span>.
        </h1>
        <p className="mt-8 max-w-xl text-lg" style={{ color: "var(--ink-1)" }}>
          Gurupaurnima 2026 — an evening of compositions offered at Saurabh Dada&rsquo;s feet.
          One of three nights, the one your heart can be present for.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          {user ? (
            <Link href="/app" className="btn">Enter the aangan →</Link>
          ) : (
            <>
              <Link href="/signup" className="btn">Join as a shishya →</Link>
              <Link href="/login" className="btn btn-ghost">I&rsquo;ve been here before</Link>
            </>
          )}
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-8">
          {EVENT_DATES.map((d, i) => (
            <div key={d.value} className="relative">
              <div className="text-xs tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>
                Night {i + 1}
              </div>
              <div className="font-display text-3xl mt-2">{d.label}</div>
              <div className="mt-2 text-sm" style={{ color: "var(--ink-1)" }}>
                Pick one or many — your guru will know which evening to keep for you.
              </div>
              <div className="mt-6 h-px" style={{ background: "var(--line)" }} />
            </div>
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
