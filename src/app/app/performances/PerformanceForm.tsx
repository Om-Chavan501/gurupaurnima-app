"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { INSTRUMENTS, SCALES, type Instrument, type Scale } from "@/lib/types";
import { savePerformance, savePerformanceFor, deletePerformance } from "@/lib/actions";

type Props = {
  targetUserId?: string; // when admin edits on behalf
  initial: {
    will_perform: boolean;
    composition_name: string | null;
    composition_notes: string | null;
    scale: Scale | null;
    instruments: Instrument[];
  } | null;
};

export default function PerformanceForm({ initial, targetUserId }: Props) {
  const router = useRouter();
  const [willPerform, setWillPerform] = useState<boolean | null>(initial?.will_perform ?? null);
  const [name, setName] = useState(initial?.composition_name ?? "");
  const [notes, setNotes] = useState(initial?.composition_notes ?? "");
  const [scale, setScale] = useState<Scale | "">(initial?.scale ?? "");
  const [instr, setInstr] = useState<Set<Instrument>>(new Set(initial?.instruments ?? []));
  const [pending, start] = useTransition();

  function toggleInstr(i: Instrument) {
    setInstr((cur) => { const n = new Set(cur); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  }

  function save() {
    if (willPerform === null) { toast.error("Choose first: performing or not"); return; }
    const payload = {
      will_perform: willPerform,
      composition_name: willPerform ? (name || null) : null,
      composition_notes: willPerform ? (notes || null) : null,
      scale: willPerform ? (scale || null) as Scale | null : null,
      instruments: willPerform ? Array.from(instr) : [],
    };
    start(async () => {
      const r = targetUserId ? await savePerformanceFor(targetUserId, payload) : await savePerformance(payload);
      if (r.ok) { toast.success("Saved."); router.refresh(); }
      else toast.error(r.error);
    });
  }

  function remove() {
    start(async () => {
      const r = await deletePerformance(targetUserId);
      if (r.ok) { toast.success("Removed."); router.refresh(); }
      else toast.error(r.error);
    });
  }

  return (
    <div className="mt-10 space-y-10">
      <div>
        <div className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>Will you perform?</div>
        <div className="flex gap-3">
          {[
            { v: true,  label: "Yes, I'll perform something" },
            { v: false, label: "Not this time" },
          ].map((opt) => (
            <button
              key={String(opt.v)}
              onClick={() => setWillPerform(opt.v)}
              className="px-5 py-3 rounded-full text-sm transition"
              style={{
                border: "1px solid var(--line)",
                background: willPerform === opt.v ? "var(--accent)" : "transparent",
                color: willPerform === opt.v ? "var(--bg-0)" : "var(--ink-1)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {willPerform === true && (
          <motion.div
            initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-10"
          >
            <div className="field-group">
              <label>Composition / song</label>
              <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Raag, bandish, abhang…" />
            </div>

            <div className="field-group">
              <label>Notes (optional)</label>
              <textarea className="field" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="A line about the piece, taal, tempo…" />
            </div>

            <div>
              <div className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>Scale</div>
              <div className="flex flex-wrap gap-2">
                {SCALES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setScale(s.value)}
                    className="px-3 py-2 rounded-full text-sm transition"
                    style={{
                      border: "1px solid var(--line)",
                      background: scale === s.value ? "var(--accent)" : "transparent",
                      color: scale === s.value ? "var(--bg-0)" : "var(--ink-1)",
                    }}
                  >
                    {s.value} <span style={{ opacity: 0.7 }}>· {s.marathi}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>Instruments needed on stage</div>
              <div className="flex flex-wrap gap-2">
                {INSTRUMENTS.map((i) => (
                  <button
                    key={i.value}
                    onClick={() => toggleInstr(i.value)}
                    className="px-3 py-2 rounded-full text-sm transition"
                    style={{
                      border: "1px solid var(--line)",
                      background: instr.has(i.value) ? "var(--accent)" : "transparent",
                      color: instr.has(i.value) ? "var(--bg-0)" : "var(--ink-1)",
                    }}
                  >
                    {i.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between pt-4">
        {initial ? (
          <button onClick={remove} disabled={pending} className="btn-link text-sm" style={{ color: "#ff8585" }}>
            Remove entry
          </button>
        ) : <span />}
        <button onClick={save} disabled={pending} className="btn">
          {pending ? "…" : "Save"}
        </button>
      </div>
    </div>
  );
}
