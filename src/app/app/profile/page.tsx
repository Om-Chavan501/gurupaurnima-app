import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import ProfileEditForm from "./ProfileEditForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const profile = data as Profile;

  return (
    <PageTransition>
      <div className="pt-2 md:pt-6 max-w-2xl">
        <div className="text-[11px] tracking-[0.32em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>Your details</div>
        <h1 className="font-display" style={{ fontSize: "clamp(34px, 5.5vw, 50px)", lineHeight: 1.05 }}>
          Edit your profile.
        </h1>
        <ProfileEditForm profile={profile} />
      </div>
    </PageTransition>
  );
}
