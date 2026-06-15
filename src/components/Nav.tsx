"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Lotus from "./Lotus";
import RaagSwitcher from "./RaagSwitcher";
import NotifBell from "./NotifBell";
import LocaleSwitcher from "./LocaleSwitcher";
import { useT } from "./LocaleProvider";

type Props = {
  signedIn: boolean;
  firstName?: string | null;
  profilePicUrl?: string | null;
  showBell?: boolean;
  unreadCount?: number;
  showAdmin?: boolean;
};

export default function Nav({ signedIn, firstName, profilePicUrl, showBell, unreadCount = 0, showAdmin }: Props) {
  const path = usePathname();
  const inApp = path?.startsWith("/app");
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useT();

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Close drawer on route change
  useEffect(() => { setMenuOpen(false); }, [path]);

  const appLinks = [
    { href: "/app", label: t("nav.home") },
    { href: "/app/event", label: t("nav.concert") },
    { href: "/app/poll", label: t("nav.dates") },
    { href: "/app/performances", label: t("nav.compositions") },
    { href: "/app/shishyas", label: t("nav.people") },
    { href: "/app/invite", label: t("nav.invite") },
    ...(showAdmin ? [{ href: "/app/admin", label: t("nav.admin") }] : []),
  ];

  const publicLinks = [
    { href: "/signup", label: t("common.join") },
    { href: "/login", label: t("common.signIn") },
  ];

  const desktopLinks = inApp ? appLinks : [];
  const drawerLinks = signedIn ? appLinks : publicLinks;

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-30"
        style={{
          background: "color-mix(in oklab, var(--bg-0) 82%, transparent)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div className="container-x flex items-center justify-between gap-3 py-3">
          {/* Logo — stacked */}
          <Link href={signedIn ? "/app" : "/"} className="flex items-center gap-3 min-w-0 group">
            <Lotus size={30} />
            <span className="leading-[1.05] min-w-0">
              <span
                className="block text-[9px] tracking-[0.32em] uppercase opacity-80"
                style={{ color: "var(--ink-2)" }}
              >
                {t("nav.logoTop")}
              </span>
              <span
                className="block font-display tracking-tight"
                style={{ color: "var(--ink-0)", fontSize: "18px", letterSpacing: "-0.01em" }}
              >
                Guru<span className="mark">paurnima</span>
              </span>
              <span
                className="block text-[9px] tracking-[0.32em] uppercase opacity-80"
                style={{ color: "var(--ink-2)" }}
              >
                {t("nav.logoYear")}
              </span>
            </span>
          </Link>

          {/* Desktop links */}
          {desktopLinks.length > 0 && (
            <nav className="hidden md:flex items-center gap-7 text-[13px]">
              {desktopLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="relative py-1"
                  style={{ color: path === l.href ? "var(--ink-0)" : "var(--ink-2)" }}
                >
                  {l.label}
                  {path === l.href && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute left-0 right-0 -bottom-0.5 h-px"
                      style={{ background: "var(--accent)" }}
                    />
                  )}
                </Link>
              ))}
            </nav>
          )}

          {/* Right cluster */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {showBell && <NotifBell count={unreadCount} />}
            <div className="hidden md:block">
              <LocaleSwitcher compact />
            </div>
            <div className="hidden md:block">
              <RaagSwitcher />
            </div>
            {signedIn ? (
              <Link
                href="/app/profile"
                className="flex items-center gap-2 pl-1 pr-1 sm:pr-3 py-1 rounded-full"
                style={{ border: "1px solid var(--line)", color: "var(--ink-1)" }}
              >
                {profilePicUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profilePicUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <span
                    className="w-7 h-7 rounded-full grid place-items-center text-[11px] font-medium"
                    style={{ background: "var(--bg-2)", color: "var(--accent-soft)" }}
                  >
                    {(firstName?.[0] ?? "·").toUpperCase()}
                  </span>
                )}
                <span className="text-sm hidden sm:inline">{firstName ?? "Profile"}</span>
              </Link>
            ) : (
              <Link href="/login" className="hidden sm:inline text-sm px-3 py-2 rounded-full"
                    style={{ border: "1px solid var(--line)", color: "var(--ink-1)" }}>
                Sign in
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2 rounded-full"
              style={{ border: "1px solid var(--line)", color: "var(--ink-1)" }}
              aria-label="Menu"
            >
              <Menu size={16} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="drawer flex flex-col"
          >
            <div className="container-x flex items-center justify-between py-3"
                 style={{ borderBottom: "1px solid var(--line)" }}>
              <span className="text-xs tracking-[0.32em] uppercase" style={{ color: "var(--ink-2)" }}>{t("common.menu")}</span>
              <button onClick={() => setMenuOpen(false)} className="p-2" aria-label="Close" style={{ color: "var(--ink-1)" }}>
                <X size={20} />
              </button>
            </div>
            <div className="container-x flex-1 overflow-y-auto pt-8 pb-12">
              <ul>
                {drawerLinks.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={l.href}
                      className="flex items-baseline justify-between py-4"
                      style={{ borderBottom: "1px solid var(--line)" }}
                    >
                      <span
                        className="font-display"
                        style={{
                          fontSize: "30px",
                          color: path === l.href ? "var(--accent)" : "var(--ink-0)",
                        }}
                      >
                        {l.label}
                      </span>
                      <span className="text-xs tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-10 flex gap-3 flex-wrap">
                <LocaleSwitcher />
                <RaagSwitcher />
              </div>
              {signedIn && (
                <form action="/logout" method="post" className="mt-12">
                  <button className="btn-link text-sm">{t("profile.signOut")}</button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
