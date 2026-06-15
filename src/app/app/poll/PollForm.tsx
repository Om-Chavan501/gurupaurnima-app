"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { EVENT_DATES, type EventDate } from "@/lib/types";
import { savePoll, savePollFor } from "@/lib/actions";

export default function PollForm({ initial, targetUserId }: { initial: EventDate[]; targetUserId?: string }) {
  const router = useRouter();
  // "none" = explicitly can't attend any. Stored as empty picks array.
  const [picked, setPicked] = useState<Set<EventDate>>(new Set(initial));
  const [none, setNone] = useState<boolean>(false);
  const [pending, start] = useTransition();

  function toggle(d: EventDate) {
    setNone(false);
    setPicked((cur) => {
      const next = new Set(cur);
      if (next.has(d)) next.delete(d); else next.add(d);
      return next;
    });
  }

  function chooseNone() {
    setPicked(new Set());
    setNone(true);
  }

  function save() {
    if (picked.size === 0 && !none) {
      toast.error("Pick at least one date, or mark \"Can't attend\".");
      return;
    }
    const arr = none ? [] : Array.from(picked);
    start(async () => {
      const r = targetUserId ? await savePollFor(targetUserId, arr) : await savePoll(arr);
      if (r.ok) { toast.success("Saved."); router.refresh(); }
      else toast.error(r.error);
    });
  }

  return (
    <div className="mt-10">
      <div className="grid md:grid-cols-3 gap-4">
        {EVENT_DATES.map((d) => {
          const on = picked.has(d.value);
          return (
            <motion.button
              key={d.value}
              type="button"
              onClick={() => toggle(d.value)}
              whileTap={{ scale: 0.98 }}
              className="text-left p-5 rounded-2xl transition relative overflow-hidden"
              style={{
                border: `1px solid ${on ? "var(--accent)" : "var(--line)"}`,
                background: on ? "color-mix(in oklab, var(--accent) 12%, transparent)" : "transparent",
              }}
            >
              <div className="text-xs tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>
                {on ? "Yes" : "Maybe?"}
              </div>
              <div className="font-display text-2xl mt-1">{d.label}</div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <span className="text-xs tracking-[0.3em] uppercase" style={{ color: "var(--ink-2)" }}>or</span>
        <motion.button
          type="button"
          onClick={chooseNone}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-3 rounded-full text-sm transition"
          style={{
            border: `1px solid ${none ? "var(--accent)" : "var(--line)"}`,
            background: none ? "color-mix(in oklab, var(--accent) 12%, transparent)" : "transparent",
            color: none ? "var(--ink-0)" : "var(--ink-1)",
          }}
        >
          I can&rsquo;t attend any of these
        </motion.button>
      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={save} disabled={pending} className="btn">
          {pending ? "…" : "Save my choice"}
        </button>
      </div>
    </div>
  );
}
