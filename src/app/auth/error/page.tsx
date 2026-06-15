import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import { getT } from "@/lib/i18n-server";

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ code?: string; description?: string }> }) {
  const sp = await searchParams;
  const code = sp.code ?? "unknown";
  const t = await getT();

  let titleKey = "authError.unknown.title";
  let bodyKey = "authError.unknown.body";
  if (code === "otp_expired") {
    titleKey = "authError.otp.title";
    bodyKey = "authError.otp.body";
  } else if (code === "access_denied") {
    titleKey = "authError.denied.title";
    bodyKey = "authError.denied.body";
  }

  return (
    <PageTransition>
      <div className="max-w-md mx-auto pt-12">
        <div className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>
          {t("authError.kicker")}
        </div>
        <h1 className="font-display text-4xl md:text-5xl">{t(titleKey)}</h1>
        <p className="mt-6 text-lg" style={{ color: "var(--ink-1)" }}>{t(bodyKey)}</p>
        {sp.description && (
          <p className="mt-3 text-xs" style={{ color: "var(--ink-2)" }}>({sp.description})</p>
        )}
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/signup" className="btn">{t("authError.sendNew")}</Link>
          <Link href="/login" className="btn btn-ghost">{t("authError.signInPwd")}</Link>
        </div>
        <Link href="/" className="mt-10 btn-link text-sm inline-block">{t("authError.home")}</Link>
      </div>
    </PageTransition>
  );
}
