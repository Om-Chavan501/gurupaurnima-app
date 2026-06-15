"use server";
import { createClient } from "@/lib/supabase/server";
import type { EventDate, Instrument, Scale } from "@/lib/types";

type Result = { ok: true } | { ok: false; error: string };

async function requireAdminOrGuru(): Promise<{ user: { id: string } } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "not authenticated" };
  const { data } = await supabase.from("profiles").select("role, is_admin").eq("id", user.id).single();
  if (!data || (data.role !== "guru" && !data.is_admin)) return { error: "forbidden" };
  return { user };
}

async function logActivity(action: string, target_table: string | null, target_id: string | null, payload: object = {}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("activity_log").insert({
    actor_id: user?.id ?? null,
    action,
    target_table,
    target_id,
    payload,
  });
}

export async function savePoll(picks: EventDate[]): Promise<Result> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not authenticated" };
  await supabase.from("attendance_poll").delete().eq("user_id", user.id);
  if (picks.length > 0) {
    const { error } = await supabase.from("attendance_poll").insert(
      picks.map((d) => ({ user_id: user.id, date: d })),
    );
    if (error) return { ok: false, error: error.message };
  }
  await logActivity("poll.update", "attendance_poll", user.id, { picks });
  return { ok: true };
}

export async function savePollFor(targetId: string, picks: EventDate[]): Promise<Result> {
  const auth = await requireAdminOrGuru();
  if ("error" in auth) return { ok: false, error: auth.error };
  const supabase = await createClient();
  await supabase.from("attendance_poll").delete().eq("user_id", targetId);
  if (picks.length > 0) {
    const { error } = await supabase.from("attendance_poll").insert(
      picks.map((d) => ({ user_id: targetId, date: d })),
    );
    if (error) return { ok: false, error: error.message };
  }
  await logActivity("poll.update.admin", "attendance_poll", targetId, { picks });
  return { ok: true };
}

export type PerfInput = {
  will_perform: boolean;
  composition_name: string | null;
  composition_notes: string | null;
  scale: Scale | null;
  instruments: Instrument[];
};

export async function savePerformance(input: PerfInput): Promise<Result> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not authenticated" };
  const { error } = await supabase.from("performances").upsert({
    user_id: user.id,
    ...input,
  }, { onConflict: "user_id" });
  if (error) return { ok: false, error: error.message };
  await logActivity("performance.update", "performances", user.id, input);
  return { ok: true };
}

export async function savePerformanceFor(targetId: string, input: PerfInput): Promise<Result> {
  const auth = await requireAdminOrGuru();
  if ("error" in auth) return { ok: false, error: auth.error };
  const supabase = await createClient();
  const { error } = await supabase.from("performances").upsert({
    user_id: targetId,
    ...input,
  }, { onConflict: "user_id" });
  if (error) return { ok: false, error: error.message };
  await logActivity("performance.update.admin", "performances", targetId, input);
  return { ok: true };
}

export async function deletePerformance(targetId?: string): Promise<Result> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not authenticated" };
  const uid = targetId ?? user.id;
  if (uid !== user.id) {
    const auth = await requireAdminOrGuru();
    if ("error" in auth) return { ok: false, error: auth.error };
  }
  const { error } = await supabase.from("performances").delete().eq("user_id", uid);
  if (error) return { ok: false, error: error.message };
  await logActivity("performance.delete", "performances", uid, {});
  return { ok: true };
}

export async function setVerified(targetId: string, value: boolean): Promise<Result> {
  const auth = await requireAdminOrGuru();
  if ("error" in auth) return { ok: false, error: auth.error };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ is_verified: value }).eq("id", targetId);
  if (error) return { ok: false, error: error.message };
  await logActivity("profile.verify", "profiles", targetId, { value });
  return { ok: true };
}

export async function setAdmin(targetId: string, value: boolean): Promise<Result> {
  // Only the guru can hand out admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not authenticated" };
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "guru") return { ok: false, error: "only the guru can set admins" };
  const { error } = await supabase.from("profiles").update({ is_admin: value }).eq("id", targetId);
  if (error) return { ok: false, error: error.message };
  await logActivity("profile.admin", "profiles", targetId, { value });
  return { ok: true };
}

export async function removeProfile(targetId: string): Promise<Result> {
  const auth = await requireAdminOrGuru();
  if ("error" in auth) return { ok: false, error: auth.error };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").delete().eq("id", targetId);
  if (error) return { ok: false, error: error.message };
  await logActivity("profile.delete", "profiles", targetId, {});
  return { ok: true };
}

export async function markActivityRead(): Promise<Result> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not authenticated" };
  const { error } = await supabase
    .from("profiles")
    .update({ notifications_read_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateProfileBasics(input: {
  first_name: string;
  last_name: string;
  dob: string | null;
  gender: string | null;
  whatsapp_country_code: string | null;
  whatsapp_number: string | null;
  years_with_guru: number | null;
  months_with_guru: number | null;
  profile_pic_url?: string | null;
}): Promise<Result> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not authenticated" };
  const { error } = await supabase.from("profiles").update(input).eq("id", user.id);
  if (error) return { ok: false, error: error.message };
  await logActivity("profile.update", "profiles", user.id, {});
  return { ok: true };
}
