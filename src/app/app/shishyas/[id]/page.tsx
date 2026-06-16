import { notFound } from "next/navigation";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Instrument, Scale } from "@/lib/types";
import { INSTRUMENTS, SCALES } from "@/lib/types";
import AdminActions from "./AdminActions";
import { getT } from "@/lib/i18n-server";

export default async function ShishyaDetail({ params }: { params: Promise<{ id: string }> }) {
  const t = await getT();
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: profileRaw }, { data: { user } }, { data: poll }, { data: perf }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
    supabase.auth.getUser(),
    supabase.from("attendance_poll").select("date").eq("user_id", id),
    supabase.from("performances").select("*").eq("user_id", id).maybeSingle(),
  ]);
  const profile = profileRaw as Profile | null;
  if (!profile) notFound();

  const { data: viewerRaw } = await supabase.from("profiles").select("role,is_admin").eq("id", user!.id).single();
  const viewer = viewerRaw as { role: string; is_admin: boolean };
  const isAdminOrGuru = viewer.role === "guru" || viewer.is_admin;
  const viewerIsGuru = viewer.role === "guru";
  const isSelf = user!.id === profile.id;

  // Inviter (for lineage display) — fetch only if there is one
  let inviter: { id: string; first_name: string; last_name: string } | null = null;
  if (profile.invited_by) {
    const { data: invRaw } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("id", profile.invited_by)
      .maybeSingle();
    inviter = invRaw ?? null;
  }
  const isInviter = !!inviter && user!.id === inviter.id;
  const canSeeLineage = isAdminOrGuru || isSelf || isInviter;

  const phone = profile.whatsapp_number ? `${profile.whatsapp_country_code ?? ""}${profile.whatsapp_number}` : null;
  const waUrl = phone ? `https://wa.me/${phone.replace(/\D/g, "")}` : null;
  const telUrl = phone ? `tel:${phone}` : null;

  return (
    <PageTransition>
      <div className="pt-6">
        <Link href="/app/shishyas" className="btn-link text-sm">{t("shishyaDetail.allShishyas")}</Link>

        <div className="mt-8 flex items-center gap-6">
          {profile.profile_pic_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.profile_pic_url} alt="" className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full grid place-items-center font-display text-3xl" style={{ background: "var(--bg-2)", color: "var(--accent-soft)" }}>
              {(profile.first_name[0] ?? "") + (profile.last_name[0] ?? "")}
            </div>
          )}
          <div>
            <div className="text-xs tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>
              {profile.role === "guru" ? t("role.guru") : profile.role === "shishya" ? t("role.shishya") : t("role.audience")}
              {profile.is_admin ? ` · ${t("role.admin")}` : ""}
              {profile.is_verified ? ` · ${t("role.verified")}` : ""}
            </div>
            <h1 className="font-display text-4xl mt-1">{profile.first_name} {profile.last_name}</h1>
          </div>
        </div>

        <dl className="mt-12 grid md:grid-cols-2 gap-y-6 gap-x-12 text-sm">
          <Row label={t("shishyaDetail.email")} value={profile.email} />
          <Row label={t("shishyaDetail.whatsapp")} value={phone ?? "—"} />
          <Row label={t("shishyaDetail.dob")} value={profile.dob ?? "—"} />
          <Row label={t("shishyaDetail.gender")} value={profile.gender?.replace(/_/g, " ") ?? "—"} />
          {profile.role === "shishya" && (
            <Row label={t("shishyaDetail.withGuru")} value={
              profile.years_with_guru || profile.months_with_guru
                ? `${profile.years_with_guru ?? 0}y ${profile.months_with_guru ?? 0}m`
                : "—"
            } />
          )}
          {canSeeLineage && inviter && (
            <Row
              label={t("shishyaDetail.invitedBy")}
              value={`${inviter.first_name} ${inviter.last_name}${profile.invited_as ? ` · ${profile.invited_as === "shishya" ? t("role.shishya") : t("role.audience")}` : ""}`}
            />
          )}
        </dl>

        <div className="mt-10 flex gap-3">
          {waUrl && <a className="btn" href={waUrl} target="_blank">{t("shishyaDetail.whatsapp")} →</a>}
          {telUrl && <a className="btn btn-ghost" href={telUrl}>{t("perf.callGuru")}</a>}
        </div>

        <div className={`mt-16 grid gap-10 ${profile.role === "shishya" ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
          <div>
            <div className="text-xs tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>{t("shishyaDetail.suitableNights")}</div>
            <div className="mt-3 font-display text-2xl">
              {poll && poll.length > 0
                ? poll.map((p) => t(`date.${p.date}`)).join(", ")
                : <span style={{ color: "var(--ink-2)" }}>{t("shishyaDetail.notChosen")}</span>}
            </div>
          </div>
          {profile.role === "shishya" && (
          <div>
            <div className="text-xs tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>{t("shishyaDetail.compositionLabel")}</div>
            {perf?.will_perform ? (
              <div className="mt-3">
                <div className="font-display text-2xl">{perf.composition_name ?? "—"}</div>
                <div className="text-sm mt-1" style={{ color: "var(--ink-1)" }}>
                  Scale: {SCALES.find(s => s.value === perf.scale as Scale)?.value ?? "—"}
                  {SCALES.find(s => s.value === perf.scale as Scale) ? ` · ${SCALES.find(s => s.value === perf.scale as Scale)!.marathi}` : ""}
                </div>
                <div className="text-sm mt-1" style={{ color: "var(--ink-1)" }}>
                  Instruments: {(perf.instruments as Instrument[] | null ?? []).map(i => INSTRUMENTS.find(x => x.value === i)?.label).filter(Boolean).join(", ") || "—"}
                </div>
                {perf.composition_notes && <div className="text-sm mt-2" style={{ color: "var(--ink-2)" }}>{perf.composition_notes}</div>}
              </div>
            ) : (
              <div className="mt-3 font-display text-2xl" style={{ color: "var(--ink-2)" }}>
                {perf ? t("shishyaDetail.notPerforming") : t("shishyaDetail.hasntDecided")}
              </div>
            )}
          </div>
          )}
        </div>

        {(isAdminOrGuru || isSelf) && (
          <div className="mt-16">
            <div className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>{t("shishyaDetail.actions")}</div>
            <div className="flex flex-wrap gap-3">
              {isSelf && <Link href="/app/profile" className="btn btn-ghost">{t("shishyaDetail.editMine")}</Link>}
              {isSelf && profile.role === "shishya" && <Link href="/app/performances/mine" className="btn btn-ghost">{t("shishyaDetail.editMyComp")}</Link>}
              {isAdminOrGuru && (
                <AdminActions
                  targetId={profile.id}
                  isVerified={profile.is_verified}
                  isAdmin={profile.is_admin}
                  role={profile.role}
                  viewerIsGuru={viewerIsGuru}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>{label}</dt>
      <dd className="mt-1" style={{ color: "var(--ink-0)" }}>{value}</dd>
    </div>
  );
}
