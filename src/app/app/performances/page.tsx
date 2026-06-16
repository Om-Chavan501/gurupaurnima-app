import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/server";
import { INSTRUMENTS, SCALES, type Instrument, type Profile, type Scale } from "@/lib/types";
import { getT } from "@/lib/i18n-server";

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
  const t = await getT();
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
      <section className="pt-2 md:pt-6">
        <div className="text-[11px] tracking-[0.32em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>
          {t("perf.kicker")}
        </div>
        <h1
          className="font-display"
          style={{ fontSize: "clamp(34px, 5.5vw, 54px)", lineHeight: 1.05 }}
        >
          {t("perf.h1")}
        </h1>
        <p className="mt-3 max-w-xl text-[15px]" style={{ color: "var(--ink-1)" }}>
          {t("perf.intro")}
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/app/performances/mine" className="btn">{t("perf.yourPerformance")}</Link>
        </div>
      </section>

      <div className="rule mt-12" />

      {/* ===== Performing ===== */}
      <section className="pt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl md:text-3xl">{t("perf.performing")}</h2>
          <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>
            {performing.length}
          </span>
        </div>

        <ul className="mt-5 divide-y" style={{ borderColor: "var(--line)" }}>
          {performing.map((p) => (
            <li key={p.id} className="border-t first:border-t-0 py-4" style={{ borderColor: "var(--line)" }}>
              <Link href={`/app/shishyas/${p.user_id}`} className="block group">
                <div className="font-display-soft text-lg md:text-xl" style={{ color: "var(--ink-0)" }}>
                  {p.composition_name ?? <span style={{ color: "var(--ink-2)" }}>(unnamed piece)</span>}
                </div>
                <div className="text-sm mt-1" style={{ color: "var(--ink-1)" }}>
                  {p.profiles?.first_name} {p.profiles?.last_name}
                  {p.scale && (
                    <>
                      {" · "}
                      <span style={{ color: "var(--ink-2)" }}>
                        {p.scale} ({SCALES.find(s => s.value === p.scale)?.marathi})
                      </span>
                    </>
                  )}
                </div>
                {p.instruments.length > 0 && (
                  <div className="text-xs mt-1" style={{ color: "var(--ink-2)" }}>
                    Needs: {p.instruments.map(i => INSTRUMENTS.find(x => x.value === i)?.label).filter(Boolean).join(", ")}
                  </div>
                )}
              </Link>
            </li>
          ))}
          {performing.length === 0 && (
            <li className="py-6 text-sm" style={{ color: "var(--ink-2)" }}>{t("perf.noneYet")}</li>
          )}
        </ul>
      </section>

      {/* ===== Not performing ===== */}
      <section className="pt-12">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl md:text-3xl">{t("perf.notPerforming")}</h2>
          <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>
            {notPerforming.length}
          </span>
        </div>
        <ul className="mt-5 space-y-1.5 text-sm" style={{ color: "var(--ink-1)" }}>
          {notPerforming.map((p) => (
            <li key={p.id}>{p.profiles?.first_name} {p.profiles?.last_name}</li>
          ))}
          {notPerforming.length === 0 && <li style={{ color: "var(--ink-2)" }}>—</li>}
        </ul>
      </section>

      {/* ===== Yet to decide ===== */}
      <section className="pt-12">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl md:text-3xl">{t("perf.yetToDecide")}</h2>
          <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>
            {pending.length}
          </span>
        </div>
        <ul className="mt-5 space-y-2 text-sm" style={{ color: "var(--ink-1)" }}>
          {pending.map((p) => (
            <li key={p.id}>
              <Link href={`/app/shishyas/${p.id}`} className="inline-flex items-center gap-2">
                {p.first_name} {p.last_name}
                <span className="text-[11px]" style={{ color: "var(--ink-2)" }}>view →</span>
              </Link>
            </li>
          ))}
          {pending.length === 0 && <li style={{ color: "var(--ink-2)" }}>{t("perf.everyoneChimed")}</li>}
        </ul>
      </section>

      <div className="rule mt-16" />

      {/* ===== Reach the guru ===== */}
      <section className="pt-10 pb-6">
        <div className="text-[11px] tracking-[0.32em] uppercase mb-4" style={{ color: "var(--ink-2)" }}>
          {t("perf.finaliseWithGuru")}
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            className="btn"
            target="_blank"
            href={`https://wa.me/${(process.env.NEXT_PUBLIC_GURU_WHATSAPP ?? "").replace(/\D/g, "")}`}
          >
            {t("perf.waGuru")}
          </a>
          <a
            className="btn btn-ghost"
            href={`tel:${process.env.NEXT_PUBLIC_GURU_PHONE ?? ""}`}
          >
            {t("perf.callGuru")} · {process.env.NEXT_PUBLIC_GURU_PHONE ?? "—"}
          </a>
        </div>
      </section>
    </PageTransition>
  );
}
