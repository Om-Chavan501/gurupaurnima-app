import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import { EVENT_DATES } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n-server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getT();

  const steps = [
    { n: "01", title: t("landing.how.step1.title"), body: t("landing.how.step1.body") },
    { n: "02", title: t("landing.how.step2.title"), body: t("landing.how.step2.body") },
    { n: "03", title: t("landing.how.step3.title"), body: t("landing.how.step3.body") },
  ];

  return (
    <PageTransition>
      {/* ===== Hero ===== */}
      <section className="pt-6 md:pt-14">
        <div className="grid md:grid-cols-12 gap-y-8 md:gap-x-10 items-end">
          <div className="md:col-span-8">
            <p className="text-[11px] tracking-[0.32em] uppercase mb-5" style={{ color: "var(--ink-2)" }}>
              {t("landing.kicker")}
            </p>
            <h1
              className="font-display"
              style={{ fontSize: "clamp(40px, 7vw, 76px)", color: "var(--ink-0)", lineHeight: 1.02 }}
            >
              {t("landing.h1.line1")}<br />{t("landing.h1.line2")}
            </h1>
            <p className="mt-6 max-w-xl text-[15px] md:text-base" style={{ color: "var(--ink-1)" }}>
              {t("landing.intro")}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              {user ? (
                <Link href="/app" className="btn">{t("common.continue")}</Link>
              ) : (
                <>
                  <Link href="/signup" className="btn">{t("common.join")}</Link>
                  <Link href="/login" className="btn btn-ghost">{t("common.alreadyHere")}</Link>
                </>
              )}
            </div>
          </div>

          <aside className="md:col-span-4 md:pl-6 md:border-l" style={{ borderColor: "var(--line)" }}>
            <div className="text-[11px] tracking-[0.32em] uppercase mb-4" style={{ color: "var(--ink-2)" }}>
              {t("landing.possibleDates")}
            </div>
            <ul className="space-y-3">
              {EVENT_DATES.map((d) => (
                <li key={d.value} className="font-display-soft text-lg" style={{ color: "var(--ink-0)" }}>
                  {t(`date.${d.value}`)}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs" style={{ color: "var(--ink-2)" }}>
              {t("landing.pickAfterSignin")}
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
              {t("landing.how.kicker")}
            </div>
            <p className="mt-2 text-sm" style={{ color: "var(--ink-2)" }}>{t("landing.how.sub")}</p>
          </div>
          <div className="md:col-span-9">
            <ol className="space-y-7">
              {steps.map((s) => (
                <li key={s.n} className="grid grid-cols-[auto_1fr] gap-x-5 items-baseline">
                  <span className="section-index">{s.n}</span>
                  <div>
                    <div className="font-display text-2xl md:text-3xl">{s.title}</div>
                    <p className="mt-1.5 text-[15px]" style={{ color: "var(--ink-1)" }}>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <div className="rule mt-16 md:mt-24" />

      {/* ===== Access — how the two doors work ===== */}
      <section className="pt-12 md:pt-16">
        <div className="grid md:grid-cols-12 gap-y-8 md:gap-x-10">
          <div className="md:col-span-3">
            <div className="text-[11px] tracking-[0.32em] uppercase" style={{ color: "var(--ink-2)" }}>
              {t("landing.access.kicker")}
            </div>
            <p className="mt-2 text-sm" style={{ color: "var(--ink-2)" }}>{t("landing.access.sub")}</p>
          </div>
          <div className="md:col-span-9 grid md:grid-cols-2 gap-5">
            <div
              className="p-5 rounded-2xl"
              style={{ background: "color-mix(in oklab, var(--ink-0) 3%, transparent)", border: "1px solid var(--line)" }}
            >
              <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>
                {t("landing.access.shishya.kicker")}
              </div>
              <div className="font-display text-2xl mt-1">{t("landing.access.shishya.title")}</div>
              <p className="mt-2 text-[15px]" style={{ color: "var(--ink-1)" }}>
                {t("landing.access.shishya.body")}
              </p>
            </div>
            <div
              className="p-5 rounded-2xl"
              style={{ background: "color-mix(in oklab, var(--ink-0) 3%, transparent)", border: "1px solid var(--line)" }}
            >
              <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>
                {t("landing.access.audience.kicker")}
              </div>
              <div className="font-display text-2xl mt-1">{t("landing.access.audience.title")}</div>
              <p className="mt-2 text-[15px]" style={{ color: "var(--ink-1)" }}>
                {t("landing.access.audience.body")}
              </p>
            </div>
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
            <p className="text-xs" style={{ color: "var(--ink-2)" }}>{t("landing.footnoteMade")}</p>
            <p className="mt-1 text-xs" style={{ color: "var(--ink-2)" }}>{t("landing.footnoteRaag")}</p>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
