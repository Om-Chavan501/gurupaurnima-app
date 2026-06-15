"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Profile } from "@/lib/types";

export default function ShishyaSearch({ list }: { list: Profile[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((p) =>
      `${p.first_name} ${p.last_name} ${p.email} ${p.whatsapp_number ?? ""}`
        .toLowerCase()
        .includes(term),
    );
  }, [q, list]);

  return (
    <>
      <div className="mt-8 field-group">
        <input className="field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email, number…" />
      </div>

      <ul className="mt-10 divide-y" style={{ borderColor: "var(--line)" }}>
        {filtered.map((p, i) => (
          <motion.li
            key={p.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: Math.min(i, 12) * 0.03 }}
            style={{ borderColor: "var(--line)" }}
            className="border-t first:border-t-0"
          >
            <Link href={`/app/shishyas/${p.id}`} className="flex items-center gap-4 py-4 group">
              <Avatar profile={p} />
              <div className="flex-1">
                <div className="font-display text-2xl">
                  {p.first_name} {p.last_name}
                </div>
                <div className="text-xs tracking-widest uppercase mt-1" style={{ color: "var(--ink-2)" }}>
                  {p.role}
                  {p.is_admin ? " · admin" : ""}
                  {p.is_verified ? " · verified" : ""}
                </div>
              </div>
              <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--accent-soft)" }}>view →</span>
            </Link>
          </motion.li>
        ))}
        {filtered.length === 0 && (
          <li className="py-6 text-center" style={{ color: "var(--ink-2)" }}>No one matches.</li>
        )}
      </ul>
    </>
  );
}

function Avatar({ profile }: { profile: Profile }) {
  const initials = `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase();
  if (profile.profile_pic_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={profile.profile_pic_url} alt="" className="w-12 h-12 rounded-full object-cover" />;
  }
  return (
    <div
      className="w-12 h-12 rounded-full grid place-items-center font-display text-lg"
      style={{ background: "var(--bg-2)", color: "var(--accent-soft)" }}
    >
      {initials}
    </div>
  );
}
