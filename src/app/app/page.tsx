import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/server";
import { EVENT_DATES } from "@/lib/types";
import { getT } from "@/lib/i18n-server";

export default async function AppHome() {
  const t = await getT();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [
    { data: profile },
    { data: poll },
    { data: perf },
    { count: shishyaCount },
    { count: pollCount },
    { count: perfCount },
    { data: allPoll },
    { data: finalised },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("attendance_poll").select("date").eq("user_id", user.id),
    supabase.from("performances").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "shishya"),
    supabase.from("attendance_poll").select("*", { count: "exact", head: true }),
    supabase.from("performances").select("*", { count: "exact", head: true }).eq("will_perform", true),
    supabase.from("attendance_poll").select("date"),
    supabase
      .from("performances")
      .select("composition_name, scale, profiles!inner(first_name, last_name)")
      .eq("will_perform", true)
      .not("composition_name", "is", null)
      .order("updated_at", { ascending: false }),
  ]);

  const picked = (poll ?? []).map((p) => p.date);
  const pollSubmitted = picked.length > 0;

  // Tally votes per date for the bar chart
  type ED = "2026-07-31" | "2026-08-01" | "2026-08-02";
  const tally: Record<ED, number> = { "2026-07-31": 0, "2026-08-01": 0, "2026-08-02": 0 };
  (allPoll ?? []).forEach((r) => { if (r.date in tally) tally[r.date as ED]++; });
  const maxVotes = Math.max(...Object.values(tally), 1);
  const perfDone = perf !== null;
  const audience = profile?.role === "audience";

  // Compute primary "next step"
  let nextStep: { href: string; label: string; sub: string } | null = null;
  if (!pollSubmitted) {
    nextStep = { href: "/app/poll", label: t("app.home.step1"), sub: t("app.home.stepOf2_1") };
  } else if (!audience && !perfDone) {
    nextStep = { href: "/app/performances/mine", label: t("app.home.step2"), sub: t("app.home.stepOf2_2") };
  }

  const pollDetail = pollSubmitted
    ? t(picked.length === 1 ? "app.home.nightMarked" : "app.home.nightsMarked", { n: picked.length })
    : t("app.home.pickOneOrMany");
  const perfDetail = !perfDone
    ? t("app.home.notDecided")
    : (perf!.will_perform ? (perf!.composition_name ?? t("app.home.detailsPending")) : t("app.home.notPerforming"));

  return (
    <PageTransition>
      {/* ===== Greeting + status cards (above the fold) ===== */}
      <section className="pt-1 md:pt-4">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] tracking-[0.32em] uppercase" style={{ color: "var(--ink-2)" }}>
              {t("app.home.namaskar")}
            </p>
            <h1
              className="font-display mt-1.5"
              style={{ fontSize: "clamp(30px, 5vw, 48px)", color: "var(--ink-0)" }}
            >
              {profile?.first_name}.
            </h1>
          </div>
          {nextStep && (
            <Link
              href={nextStep.href}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm group"
              style={{
                background: "color-mix(in oklab, var(--accent) 12%, transparent)",
                border: "1px solid color-mix(in oklab, var(--accent) 35%, var(--line))",
                color: "var(--ink-0)",
              }}
            >
              <span className="text-[10px] tracking-[0.25em] uppercase" style={{ color: "var(--accent-soft)" }}>
                {t("app.home.next")}
              </span>
              <span>{nextStep.label}</span>
              <span className="transition-transform group-hover:translate-x-0.5" style={{ color: "var(--accent-soft)" }}>→</span>
            </Link>
          )}
        </div>

        {/* Two status cards */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatusCard
            label={t("app.home.yourDatePick")}
            value={pollDetail}
            done={pollSubmitted}
            href="/app/poll"
            cta={pollSubmitted ? t("common.edit") : t("common.open")}
          />
          {audience ? (
            <StatusCard
              label={t("app.home.performance")}
              value={t("app.home.audienceDontPerform")}
              done
              href="/app/performances"
              cta={t("app.home.seeList")}
            />
          ) : (
            <StatusCard
              label={t("app.home.yourPerformance")}
              value={perfDetail}
              done={perfDone}
              href="/app/performances/mine"
              cta={perfDone ? t("common.edit") : t("common.open")}
            />
          )}
        </div>

        {/* Mobile next-step CTA — small */}
        {nextStep && (
          <Link
            href={nextStep.href}
            className="sm:hidden mt-3 flex items-center justify-between px-4 py-3 rounded-xl text-sm"
            style={{
              background: "color-mix(in oklab, var(--accent) 12%, transparent)",
              border: "1px solid color-mix(in oklab, var(--accent) 35%, var(--line))",
              color: "var(--ink-0)",
            }}
          >
            <span><span className="text-[10px] tracking-[0.25em] uppercase mr-2" style={{ color: "var(--accent-soft)" }}>{t("app.home.next")}</span>{nextStep.label}</span>
            <span style={{ color: "var(--accent-soft)" }}>→</span>
          </Link>
        )}
      </section>

      {/* ===== Group counts row ===== */}
      <section className="mt-6">
        <div className="grid grid-cols-3 gap-3">
          <CountTile n={shishyaCount ?? 0} label={t("app.home.countShishyas")} href="/app/shishyas" />
          <CountTile n={pollCount ?? 0} label={t("app.home.countDateVotes")} href="/app/poll" />
          <CountTile n={perfCount ?? 0} label={t("app.home.countPerforming")} href="/app/performances" />
        </div>
      </section>

      {/* ===== Poll chart + Compositions (side by side on md+) ===== */}
      <div className="mt-5 grid md:grid-cols-2 gap-4">

        {/* Date poll bars */}
        <Link
          href="/app/poll"
          className="block p-4 md:p-5 rounded-2xl"
          style={{ background: "color-mix(in oklab, var(--ink-0) 3%, transparent)", border: "1px solid var(--line)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>
              {t("app.home.datePoll")}
            </span>
            <span className="text-[10px]" style={{ color: "var(--accent-soft)" }}>{t("app.home.viewAll")} →</span>
          </div>
          <div className="space-y-3">
            {EVENT_DATES.map((d) => {
              const v = tally[d.value as ED];
              const pct = Math.round((v / maxVotes) * 100);
              return (
                <div key={d.value}>
                  <div className="flex items-center justify-between mb-1 text-xs" style={{ color: "var(--ink-1)" }}>
                    <span>{t(`date.${d.value}`)}</span>
                    <span style={{ color: "var(--ink-2)" }}>{v}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-2)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: "var(--accent)" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Link>

        {/* Finalised compositions */}
        <Link
          href="/app/performances"
          className="block p-4 md:p-5 rounded-2xl"
          style={{ background: "color-mix(in oklab, var(--ink-0) 3%, transparent)", border: "1px solid var(--line)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>
              {t("app.home.compositions")} · {finalised?.length ?? 0}
            </span>
            <span className="text-[10px]" style={{ color: "var(--accent-soft)" }}>{t("app.home.viewAll")} →</span>
          </div>
          {finalised && finalised.length > 0 ? (
            <ul className="space-y-2.5">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(finalised as any[]).slice(0, 5).map((f, i) => (
                <li key={i} className="flex items-baseline justify-between gap-3">
                  <span className="text-sm truncate" style={{ color: "var(--ink-0)" }}>
                    {f.composition_name}
                  </span>
                  <span className="text-xs shrink-0" style={{ color: "var(--ink-2)" }}>
                    {f.profiles?.first_name} {f.profiles?.last_name?.[0]}.
                  </span>
                </li>
              ))}
              {finalised.length > 5 && (
                <li className="text-xs" style={{ color: "var(--ink-2)" }}>
                  {t("app.home.moreSuffix", { n: finalised.length - 5 })}
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm" style={{ color: "var(--ink-2)" }}>
              {t("app.home.noCompositions")}
            </p>
          )}
        </Link>
      </div>
    </PageTransition>
  );
}

function StatusCard({ label, value, done, href, cta }: {
  label: string; value: string; done: boolean; href: string; cta: string;
}) {
  return (
    <Link
      href={href}
      className="block p-4 md:p-5 rounded-2xl transition group"
      style={{
        background: "color-mix(in oklab, var(--ink-0) 3%, transparent)",
        border: "1px solid var(--line)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>
          {label}
        </span>
        <span
          className="text-[10px] tracking-[0.25em] uppercase"
          style={{ color: done ? "var(--accent-soft)" : "var(--ink-2)" }}
        >
          {done ? "✓" : ""} {done ? "done" : "pending"}
        </span>
      </div>
      <div className="mt-2 font-display-soft text-lg md:text-xl truncate" style={{ color: "var(--ink-0)" }}>
        {value}
      </div>
      <div className="mt-3 text-xs flex justify-end" style={{ color: "var(--accent-soft)" }}>
        <span className="group-hover:translate-x-0.5 transition-transform inline-block">{cta} →</span>
      </div>
    </Link>
  );
}

function CountTile({ n, label, href }: { n: number; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="block p-3 md:p-4 rounded-2xl text-center transition"
      style={{
        background: "color-mix(in oklab, var(--ink-0) 3%, transparent)",
        border: "1px solid var(--line)",
      }}
    >
      <div className="font-display" style={{ fontSize: "clamp(26px, 4vw, 36px)", color: "var(--ink-0)", lineHeight: 1 }}>
        {n}
      </div>
      <div className="mt-1 text-[10px] tracking-[0.25em] uppercase" style={{ color: "var(--ink-2)" }}>
        {label}
      </div>
    </Link>
  );
}
