import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileSetupForm from "./ProfileSetupForm";
import PageTransition from "@/components/PageTransition";

export default async function ProfileSetup() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("profiles")
    .select("first_name, last_name, profile_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (existing?.profile_completed) redirect("/app");

  const meta = user.user_metadata ?? {};
  const initialFirst = existing?.first_name ?? meta.first_name ?? "";
  const initialLast = existing?.last_name ?? meta.last_name ?? "";

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto pt-6">
        <div className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>Step 2 of 2</div>
        <h1 className="font-display text-4xl md:text-5xl">Tell us a little more.</h1>
        <p className="mt-3" style={{ color: "var(--ink-1)" }}>
          So your guru and fellow shishyas know who&rsquo;s walking in.
        </p>
        <ProfileSetupForm
          userId={user.id}
          email={user.email ?? ""}
          initialFirst={initialFirst}
          initialLast={initialLast}
        />
      </div>
    </PageTransition>
  );
}
