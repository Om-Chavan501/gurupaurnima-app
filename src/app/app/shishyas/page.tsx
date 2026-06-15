import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import ShishyaSearch from "./ShishyaSearch";

export default async function ShishyasPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("role", { ascending: true })
    .order("first_name", { ascending: true });

  const list = (data ?? []) as Profile[];

  return (
    <PageTransition>
      <section className="pt-2 md:pt-6">
        <div className="text-[11px] tracking-[0.32em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>
          The gathering · {list.length}
        </div>
        <h1
          className="font-display"
          style={{ fontSize: "clamp(34px, 5.5vw, 54px)", lineHeight: 1.05 }}
        >
          Everyone who&rsquo;s signed in.
        </h1>
        <p className="mt-3 max-w-xl text-[15px]" style={{ color: "var(--ink-1)" }}>
          Tap anyone to see details, WhatsApp them, or place a call.
        </p>

        <ShishyaSearch list={list} />
      </section>
    </PageTransition>
  );
}
