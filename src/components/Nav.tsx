"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Lotus from "./Lotus";
import RaagSwitcher from "./RaagSwitcher";
import NotifBell from "./NotifBell";

type Props = {
  signedIn: boolean;
  firstName?: string | null;
  showBell?: boolean;
  unreadCount?: number;
};

export default function Nav({ signedIn, firstName, showBell, unreadCount = 0 }: Props) {
  const path = usePathname();
  const inApp = path?.startsWith("/app");

  const links = inApp
    ? [
        { href: "/app", label: "Home" },
        { href: "/app/shishyas", label: "Shishyas" },
        { href: "/app/performances", label: "Compositions" },
        { href: "/app/poll", label: "Dates" },
      ]
    : [];

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-20 backdrop-blur-md"
      style={{ background: "color-mix(in oklab, var(--bg-0) 70%, transparent)", borderBottom: "1px solid var(--line)" }}
    >
      <div className="container-x flex items-center justify-between py-4">
        <Link href={signedIn ? "/app" : "/"} className="flex items-center gap-3">
          <Lotus />
          <span className="font-display text-lg leading-none">
            Guru<span className="mark">paurnima</span>
            <span className="block text-[10px] tracking-[0.3em] uppercase mt-0.5" style={{ color: "var(--ink-2)" }}>
              2026 · Saurabh Dada
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {links.map((l) => (
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

        <div className="flex items-center gap-3">
          {showBell && <NotifBell count={unreadCount} />}
          <RaagSwitcher />
          {signedIn ? (
            <Link href="/app/profile" className="text-sm" style={{ color: "var(--ink-1)" }}>
              {firstName ?? "Profile"}
            </Link>
          ) : (
            <Link href="/login" className="btn-ghost btn text-sm py-2 px-4">Sign in</Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
