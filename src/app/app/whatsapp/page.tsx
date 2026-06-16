import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getT } from "@/lib/i18n-server";

export default async function WhatsappPage() {
  const t = await getT();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("is_verified, role, first_name").eq("id", user!.id).single();

  const link = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL ?? "";
  const isVerified = profile?.is_verified || profile?.role === "guru";

  return (
    <PageTransition>
      <div className="pt-6 md:pt-10 max-w-xl">
        <div className="text-[11px] tracking-[0.32em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>
          {t("whatsapp.kicker")}
        </div>
        {isVerified ? (
          <>
            <h1 className="font-display" style={{ fontSize: "clamp(34px, 5.5vw, 50px)", lineHeight: 1.05 }}>
              {t("whatsapp.welcomeH1", { name: profile?.first_name ?? "" })}
            </h1>
            <p className="mt-5 text-[15px] md:text-base" style={{ color: "var(--ink-1)" }}>
              {t("whatsapp.welcomeBody")}
            </p>
            {link ? (
              <a href={link} target="_blank" className="btn mt-9">{t("whatsapp.openBtn")}</a>
            ) : (
              <p className="mt-8 text-sm" style={{ color: "var(--ink-2)" }}>{t("whatsapp.linkNotConfigured")}</p>
            )}
          </>
        ) : (
          <>
            <h1 className="font-display" style={{ fontSize: "clamp(34px, 5.5vw, 50px)", lineHeight: 1.05 }}>
              {t("whatsapp.notReadyH1")}
            </h1>
            <p className="mt-5 text-[15px]" style={{ color: "var(--ink-1)" }}>
              {t("whatsapp.notReadyBody")}
            </p>
            <Link href="/app" className="btn btn-ghost mt-9">{t("authError.home")}</Link>
          </>
        )}
      </div>
    </PageTransition>
  );
}
