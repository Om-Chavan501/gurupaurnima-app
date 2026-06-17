"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, CalendarDays, Music2, Users, MoreHorizontal, X, Ticket, Send, Shield, LogOut, Check } from "lucide-react";
import { useT } from "./LocaleProvider";
import { useRaag } from "./RaagProvider";
import { RAAGS } from "@/lib/raag";
import { useLocale } from "./LocaleProvider";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";

type Props = {
  signedIn: boolean;
  showAdmin?: boolean;
};

/**
 * Floating bottom nav for mobile inside /app. 4 primary tabs + More.
 * Active tab expands to show its label. More opens a slide-up sheet
 * that contains secondary destinations + theme + locale + sign-out.
 */
export default function BottomNav({ signedIn, showAdmin }: Props) {
  const path = usePathname();
  const t = useT();
  const [moreOpen, setMoreOpen] = useState(false);

  const inApp = path?.startsWith("/app");
  if (!signedIn || !inApp) return null;

  const tabs = [
    { href: "/app", icon: Home, label: t("nav.home") },
    { href: "/app/poll", icon: CalendarDays, label: t("nav.dates") },
    { href: "/app/performances", icon: Music2, label: t("nav.compositions") },
    { href: "/app/shishyas", icon: Users, label: t("nav.people") },
  ];

  // Match the most-specific active route
  const activeHref = tabs
    .map((tb) => tb.href)
    .filter((h) => path === h || path?.startsWith(h + "/"))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <>
      <nav
        className="md:hidden fixed left-1/2 -translate-x-1/2 z-30 bottom-nav-shell"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)",
        }}
        aria-label="Primary"
      >
        <div
          className="flex items-center gap-1 px-2 py-2 rounded-full"
          style={{
            background: "color-mix(in oklab, var(--bg-1) 88%, transparent)",
            border: "1px solid var(--line)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 18px 40px -18px rgba(0,0,0,0.55)",
          }}
        >
          {tabs.map((tb) => {
            const Icon = tb.icon;
            const active = activeHref === tb.href;
            return (
              <Link
                key={tb.href}
                href={tb.href}
                className="relative flex items-center gap-2 px-3 py-2 rounded-full transition-colors"
                style={{
                  color: active ? "var(--ink-0)" : "var(--ink-2)",
                  background: active
                    ? "color-mix(in oklab, var(--accent) 18%, transparent)"
                    : "transparent",
                }}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={18} strokeWidth={active ? 2 : 1.6} />
                <AnimatePresence initial={false}>
                  {active && (
                    <motion.span
                      key="label"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="text-[12px] whitespace-nowrap overflow-hidden"
                    >
                      {tb.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex items-center px-3 py-2 rounded-full"
            style={{ color: "var(--ink-2)" }}
            aria-label={t("nav.more")}
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </nav>

      <MoreSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        showAdmin={showAdmin}
      />
    </>
  );
}

function MoreSheet({
  open,
  onClose,
  showAdmin,
}: {
  open: boolean;
  onClose: () => void;
  showAdmin?: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const locale = useLocale();
  const { raag, setRaag } = useRaag();

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function setLocale(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365 * 5}; samesite=lax`;
    document.documentElement.setAttribute("data-locale", next);
    router.refresh();
  }

  const secondary = [
    { href: "/app/event", icon: Ticket, label: t("nav.concert") },
    { href: "/app/invite", icon: Send, label: t("nav.invite") },
    ...(showAdmin ? [{ href: "/app/admin", icon: Shield, label: t("nav.admin") }] : []),
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="md:hidden fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.45)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="md:hidden fixed left-0 right-0 bottom-0 z-50 rounded-t-3xl overflow-hidden"
            style={{
              background: "var(--bg-1)",
              borderTop: "1px solid var(--line)",
              maxHeight: "85vh",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-3"
                 style={{ borderBottom: "1px solid var(--line)" }}>
              <span className="text-[10px] tracking-[0.32em] uppercase" style={{ color: "var(--ink-2)" }}>
                {t("nav.more")}
              </span>
              <button onClick={onClose} className="p-2" aria-label="Close" style={{ color: "var(--ink-1)" }}>
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: "calc(85vh - 56px)" }}>
              <div className="px-5 py-4">
                <ul className="space-y-1">
                  {secondary.map((it) => {
                    const Icon = it.icon;
                    return (
                      <li key={it.href}>
                        <Link
                          href={it.href}
                          onClick={onClose}
                          className="flex items-center gap-3 px-3 py-3 rounded-xl"
                          style={{ color: "var(--ink-0)" }}
                        >
                          <Icon size={18} style={{ color: "var(--accent-soft)" }} />
                          <span className="font-display text-lg">{it.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Locale */}
              <div className="px-5 py-3" style={{ borderTop: "1px solid var(--line)" }}>
                <div className="text-[10px] tracking-[0.32em] uppercase mb-2" style={{ color: "var(--ink-2)" }}>
                  {t("common.language") ?? "Language"}
                </div>
                <div className="flex gap-2">
                  {(["en", "mr"] as Locale[]).map((lc) => (
                    <button
                      key={lc}
                      onClick={() => setLocale(lc)}
                      className="px-4 py-2 rounded-full text-xs tracking-widest uppercase"
                      style={{
                        border: "1px solid var(--line)",
                        color: locale === lc ? "var(--ink-0)" : "var(--ink-2)",
                        background: locale === lc
                          ? "color-mix(in oklab, var(--accent) 14%, transparent)"
                          : "transparent",
                      }}
                    >
                      {lc === "en" ? "EN" : "मराठी"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Raag */}
              <div className="px-5 py-3" style={{ borderTop: "1px solid var(--line)" }}>
                <div className="text-[10px] tracking-[0.32em] uppercase mb-2" style={{ color: "var(--ink-2)" }}>
                  Raag
                </div>
                <ul className="space-y-1">
                  {RAAGS.map((r) => {
                    const active = r.id === raag;
                    return (
                      <li key={r.id}>
                        <button
                          onClick={() => { setRaag(r.id); }}
                          className="w-full flex items-baseline justify-between gap-3 px-3 py-2.5 rounded-xl text-left"
                          style={{
                            background: active
                              ? "color-mix(in oklab, var(--accent) 12%, transparent)"
                              : "transparent",
                            border: `1px solid ${active ? "color-mix(in oklab, var(--accent) 30%, var(--line))" : "transparent"}`,
                          }}
                        >
                          <span className="flex items-center gap-2">
                            {active && <Check size={14} style={{ color: "var(--accent-soft)" }} />}
                            <span className="font-display text-base" style={{ color: "var(--ink-0)" }}>{r.name}</span>
                          </span>
                          <span className="text-[11px]" style={{ color: "var(--ink-2)" }}>
                            {r.samay} · {r.tagline}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Sign out */}
              <div className="px-5 py-4" style={{ borderTop: "1px solid var(--line)" }}>
                <form action="/logout" method="post">
                  <button
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm"
                    style={{ border: "1px solid var(--line)", color: "var(--ink-1)" }}
                  >
                    <LogOut size={16} />
                    {t("profile.signOut")}
                  </button>
                </form>
              </div>

              {/* safe-area pad */}
              <div style={{ height: "calc(env(safe-area-inset-bottom, 0px) + 8px)" }} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
