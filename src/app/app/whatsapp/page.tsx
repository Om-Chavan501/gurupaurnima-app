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
      <div className="pt-6 md:pt-10 max-w-xl">
        <div className="text-[11px] tracking-[0.32em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>
          The group chat
        </div>
        {isVerified ? (
          <>
            <h1 className="font-display" style={{ fontSize: "clamp(34px, 5.5vw, 50px)", lineHeight: 1.05 }}>
              Step in, {profile?.first_name}.
            </h1>
            <p className="mt-5 text-[15px] md:text-base" style={{ color: "var(--ink-1)" }}>
              Rehearsal threads, last-minute updates, and Saurabh Dada&rsquo;s voice notes live here.
            </p>
            {link ? (
              <a href={link} target="_blank" className="btn mt-9">Open WhatsApp group</a>
            ) : (
              <p className="mt-8 text-sm" style={{ color: "var(--ink-2)" }}>(Group link not configured yet.)</p>
            )}
          </>
        ) : (
          <>
            <h1 className="font-display" style={{ fontSize: "clamp(34px, 5.5vw, 50px)", lineHeight: 1.05 }}>
              Almost.
            </h1>
            <p className="mt-5 text-[15px]" style={{ color: "var(--ink-1)" }}>
              The WhatsApp group is shared only with verified shishyas. Once Saurabh Dada or a senior shishya marks you verified, this page opens up.
            </p>
            <Link href="/app" className="btn btn-ghost mt-9">← Home</Link>
          </>
        )}
      </div>
    </PageTransition>
  );
}
