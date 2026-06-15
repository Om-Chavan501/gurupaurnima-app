"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Profile } from "@/lib/types";

export default function ShishyaSearch({ list }: { list: Profile[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "shishya" | "itar" | "guru">("all");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return list.filter((p) => {
      if (filter !== "all" && p.role !== filter) return false;
      if (!term) return true;
      return `${p.first_name} ${p.last_name} ${p.email} ${p.whatsapp_number ?? ""}`
        .toLowerCase()
        .includes(term);
    });
  }, [q, list, filter]);

  return (
    <>
      <div className="mt-8 field-group">
        <input
          className="field"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email, number…"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {(["all", "shishya", "itar", "guru"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3.5 py-1.5 rounded-full text-xs capitalize transition"
            style={{
              border: "1px solid var(--line)",
              background: filter === f ? "color-mix(in oklab, var(--accent) 14%, transparent)" : "transparent",
              color: filter === f ? "var(--ink-0)" : "var(--ink-2)",
            }}
          >
            {f === "all" ? "Everyone" : f}
          </button>
        ))}
      </div>

      <ul className="mt-8 divide-y" style={{ borderColor: "var(--line)" }}>
        {filtered.map((p, i) => (
          <motion.li
            key={p.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i, 10) * 0.025 }}
            style={{ borderColor: "var(--line)" }}
            className="border-t first:border-t-0"
          >
            <Link href={`/app/shishyas/${p.id}`} className="flex items-center gap-4 py-3.5 group">
              <Avatar profile={p} />
              <div className="flex-1 min-w-0">
                <div className="font-display-soft text-lg md:text-xl truncate" style={{ color: "var(--ink-0)" }}>
                  {p.first_name} {p.last_name}
                </div>
                <div className="text-[10px] tracking-[0.25em] uppercase mt-0.5" style={{ color: "var(--ink-2)" }}>
                  {p.role}
                  {p.is_admin ? " · admin" : ""}
                  {p.is_verified ? " · verified" : ""}
                </div>
              </div>
              <span
                className="text-sm opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline"
                style={{ color: "var(--accent-soft)" }}
              >
                view →
              </span>
            </Link>
          </motion.li>
        ))}
        {filtered.length === 0 && (
          <li className="py-8 text-center text-sm" style={{ color: "var(--ink-2)" }}>
            No one matches.
          </li>
        )}
      </ul>
    </>
  );
}

function Avatar({ profile }: { profile: Profile }) {
  const initials = `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase();
  if (profile.profile_pic_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={profile.profile_pic_url} alt="" className="w-11 h-11 rounded-full object-cover shrink-0" />;
  }
  return (
    <div
      className="w-11 h-11 rounded-full grid place-items-center font-display-soft text-base shrink-0"
      style={{ background: "var(--bg-2)", color: "var(--accent-soft)" }}
    >
      {initials || "·"}
    </div>
  );
}
