"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RAAGS } from "@/lib/raag";
import { useRaag } from "./RaagProvider";

export default function RaagSwitcher() {
  const { raag, setRaag } = useRaag();
  const [open, setOpen] = useState(false);
  const current = RAAGS.find((r) => r.id === raag) ?? RAAGS[0];

  return (
    <div className="relative">
      <button
        aria-label="Change raag theme"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-full text-xs tracking-widest uppercase border"
        style={{ borderColor: "var(--line)", color: "var(--ink-1)" }}
      >
        <span className="inline-block w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
        Raag · {current.name}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-30"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ opacity: 0, y: -4, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -4, filter: "blur(6px)" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 mt-2 w-72 rounded-2xl p-2 z-40"
              style={{ background: "var(--bg-1)", border: "1px solid var(--line)", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)" }}
            >
              {RAAGS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setRaag(r.id); setOpen(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl flex items-baseline justify-between gap-2 transition"
                  style={{
                    background: r.id === raag ? "rgba(255,255,255,0.04)" : "transparent",
                  }}
                >
                  <span className="font-display text-base" style={{ color: "var(--ink-0)" }}>{r.name}</span>
                  <span className="text-xs" style={{ color: "var(--ink-2)" }}>{r.samay} · {r.tagline}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
