import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/server";
import type { AdminRequest, AdminRequestType, Profile } from "@/lib/types";
import ProfileEditForm from "./ProfileEditForm";
import SelfServiceRequests from "./SelfServiceRequests";
import { getT } from "@/lib/i18n-server";

export default async function ProfilePage() {
  const t = await getT();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const profile = data as Profile;

  const { data: requestsRaw } = await supabase
    .from("admin_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const requests = (requestsRaw ?? []) as AdminRequest[];

  // Which request types are currently pending
  const pendingTypes = new Set<AdminRequestType>(
    requests.filter((r) => r.status === "pending").map((r) => r.request_type),
  );

  return (
    <PageTransition>
      <div className="pt-2 md:pt-6 max-w-2xl">
        <div className="text-[11px] tracking-[0.32em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>{t("profile.kicker")}</div>
        <h1 className="font-display" style={{ fontSize: "clamp(34px, 5.5vw, 50px)", lineHeight: 1.05 }}>
          {t("profile.h1")}
        </h1>

        <ProfileEditForm profile={profile} />

        <div className="rule mt-12" />

        <SelfServiceRequests
          role={profile.role}
          isVerified={profile.is_verified}
          pendingTypes={Array.from(pendingTypes)}
          recentRequests={requests.slice(0, 6)}
        />
      </div>
    </PageTransition>
  );
}
