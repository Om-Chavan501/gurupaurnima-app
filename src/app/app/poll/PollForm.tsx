"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { EVENT_DATES, type EventDate } from "@/lib/types";
import { savePoll, savePollFor } from "@/lib/actions";

export default function PollForm({ initial, targetUserId }: { initial: EventDate[]; targetUserId?: string }) {
  const router = useRouter();
  const [picked, setPicked] = useState<Set<EventDate>>(new Set(initial));
  const [pending, start] = useTransition();

  function toggle(d: EventDate) {
    setPicked((cur) => {
      const next = new Set(cur);
      if (next.has(d)) next.delete(d); else next.add(d);
      return next;
    });
  }

  function save() {
    const arr = Array.from(picked);
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
      <div className="mt-8 flex justify-end">
        <button onClick={save} disabled={pending} className="btn">
          {pending ? "…" : "Save my choice"}
        </button>
      </div>
    </div>
  );
}
