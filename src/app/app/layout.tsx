import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("profile_completed")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.profile_completed) redirect("/signup/profile");

  return <>{children}</>;
}
