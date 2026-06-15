"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";
import { useLocale } from "./LocaleProvider";

export default function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const locale = useLocale();
  const [pending, start] = useTransition();

  function set(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365 * 5}; samesite=lax`;
    document.documentElement.setAttribute("data-locale", next);
    start(() => router.refresh());
  }

  const toggle = () => set(locale === "mr" ? "en" : "mr");
  const label = locale === "mr" ? "EN" : "मराठी";

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`rounded-full text-xs tracking-widest uppercase ${compact ? "px-2.5 py-1.5" : "px-3 py-2"}`}
      style={{ border: "1px solid var(--line)", color: "var(--ink-1)" }}
      aria-label="Toggle language"
    >
      {label}
    </button>
  );
}
