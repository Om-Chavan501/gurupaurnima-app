import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import { EVENT_DATES } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <PageTransition>
      {/* ===== Hero ===== */}
      <section className="pt-6 md:pt-14">
        <div className="grid md:grid-cols-12 gap-y-8 md:gap-x-10 items-end">
          <div className="md:col-span-8">
            <p className="text-[11px] tracking-[0.32em] uppercase mb-5" style={{ color: "var(--ink-2)" }}>
              An invitation
            </p>
            <h1
              className="font-display"
              style={{ fontSize: "clamp(40px, 7vw, 76px)", color: "var(--ink-0)", lineHeight: 1.02 }}
            >
              A quiet place to plan<br />the evening together.
            </h1>
            <p className="mt-6 max-w-xl text-[15px] md:text-base" style={{ color: "var(--ink-1)" }}>
              This site is for Saurabh Dada and his shishyas to coordinate Gurupaurnima 2026 — which night
              suits each of us, what we&rsquo;d like to perform, and who&rsquo;ll be there. Three small things.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              {user ? (
                <Link href="/app" className="btn">Continue</Link>
              ) : (
                <>
                  <Link href="/signup" className="btn">Join as a shishya</Link>
                  <Link href="/login" className="btn btn-ghost">I&rsquo;ve been here before</Link>
                </>
              )}
            </div>
          </div>

          <aside className="md:col-span-4 md:pl-6 md:border-l" style={{ borderColor: "var(--line)" }}>
            <div className="text-[11px] tracking-[0.32em] uppercase mb-4" style={{ color: "var(--ink-2)" }}>
              Possible dates
            </div>
            <ul className="space-y-3">
              {EVENT_DATES.map((d) => (
                <li key={d.value} className="font-display-soft text-lg" style={{ color: "var(--ink-0)" }}>
                  {d.label}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs" style={{ color: "var(--ink-2)" }}>
              You&rsquo;ll pick the one(s) that suit you after signing in.
            </p>
          </aside>
        </div>
      </section>

      <div className="rule mt-16 md:mt-24" />

      {/* ===== How this works ===== */}
      <section className="pt-12 md:pt-16">
        <div className="grid md:grid-cols-12 gap-y-8 md:gap-x-10">
          <div className="md:col-span-3">
            <div className="text-[11px] tracking-[0.32em] uppercase" style={{ color: "var(--ink-2)" }}>
              How it works
            </div>
            <p className="mt-2 text-sm" style={{ color: "var(--ink-2)" }}>Three short steps.</p>
          </div>
          <div className="md:col-span-9">
            <ol className="space-y-7">
              {[
                {
                  n: "01",
                  title: "Sign in",
                  body: "Make an account with your email — you only do this once. Saurabh Dada or any senior shishya can later mark you verified.",
                },
                {
                  n: "02",
                  title: "Tell us which night suits you",
                  body: "Three possible dates. Pick one or more, or let us know none of them work.",
                },
                {
                  n: "03",
                  title: "If you&rsquo;re performing, share your piece",
                  body: "The composition, the scale, and what you'll need on stage. So we don't pick the same piece twice.",
                },
              ].map((s) => (
                <li key={s.n} className="grid grid-cols-[auto_1fr] gap-x-5 items-baseline">
                  <span className="section-index">{s.n}</span>
                  <div>
                    <div className="font-display text-2xl md:text-3xl">
                      <span dangerouslySetInnerHTML={{ __html: s.title }} />
                    </div>
                    <p className="mt-1.5 text-[15px]" style={{ color: "var(--ink-1)" }}>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <div className="rule mt-16 md:mt-24" />

      {/* ===== Footnote ===== */}
      <section className="pt-12 pb-8">
        <div className="grid md:grid-cols-12 gap-y-6 md:gap-x-10 items-baseline">
          <div className="md:col-span-7">
            <p className="font-display-soft text-xl md:text-2xl" style={{ color: "var(--ink-1)" }}>
              &ldquo;गुरु बिन ज्ञान न उपजै, गुरु बिन मिले न मोक्ष.&rdquo;
            </p>
            <p className="mt-1 text-xs tracking-widest uppercase" style={{ color: "var(--ink-2)" }}>
              Kabir
            </p>
          </div>
          <div className="md:col-span-5 md:text-right">
            <p className="text-xs" style={{ color: "var(--ink-2)" }}>
              Made by shishyas, for the program.
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--ink-2)" }}>
              Choose a raag from the menu for a different mood.
            </p>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
