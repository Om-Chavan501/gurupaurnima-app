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
      <div className="pt-6 max-w-2xl">
        <div className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>You</div>
        <h1 className="font-display text-4xl md:text-5xl">Refine your name-plate.</h1>
        <ProfileEditForm profile={profile} />
      </div>
    </PageTransition>
  );
}
