"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";

export default function NotifBell({ count }: { count: number }) {
  return (
    <Link
      href="/app/activity"
      className="relative p-2 rounded-full"
      style={{ border: "1px solid var(--line)", color: "var(--ink-1)" }}
      aria-label={`Activity (${count} new)`}
    >
      <Bell size={16} />
      {count > 0 && (
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full grid place-items-center text-[10px] font-medium"
          style={{ background: "var(--accent)", color: "var(--bg-0)" }}
        >
          {count > 99 ? "99+" : count}
        </motion.span>
      )}
    </Link>
  );
}
