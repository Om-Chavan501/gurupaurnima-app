import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function WhatsappPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("is_verified, role, first_name").eq("id", user!.id).single();

  const link = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL ?? "";
  const isVerified = profile?.is_verified || profile?.role === "guru";

  return (
    <PageTransition>
      <div className="pt-10 max-w-xl">
        <div className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>The group</div>
        {isVerified ? (
          <>
            <h1 className="font-display text-4xl md:text-5xl">Welcome in, {profile?.first_name}.</h1>
            <p className="mt-6 text-lg" style={{ color: "var(--ink-1)" }}>
              The WhatsApp group is where rehearsal threads, last-minute changes, and Saurabh Dada&rsquo;s voice notes live.
            </p>
            {link ? (
              <a href={link} target="_blank" className="btn mt-10">Open WhatsApp group →</a>
            ) : (
              <p className="mt-10 text-sm" style={{ color: "var(--ink-2)" }}>(Group link not configured yet.)</p>
            )}
          </>
        ) : (
          <>
            <h1 className="font-display text-4xl md:text-5xl">A small pause.</h1>
            <p className="mt-6 text-lg" style={{ color: "var(--ink-1)" }}>
              The WhatsApp group is shared only with verified shishyas. Once a senior shishya or Saurabh Dada marks you verified, this page opens.
            </p>
            <Link href="/app" className="btn btn-ghost mt-10">← Home</Link>
          </>
        )}
      </div>
    </PageTransition>
  );
}
