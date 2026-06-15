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
      <section className="pt-6">
        <div className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: "var(--ink-2)" }}>
          Sabha · {list.length}
        </div>
        <h1 className="font-display text-4xl md:text-5xl">All who have walked in.</h1>
        <ShishyaSearch list={list} />
      </section>
    </PageTransition>
  );
}
