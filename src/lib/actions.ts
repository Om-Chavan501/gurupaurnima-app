"use server";
import { createClient } from "@/lib/supabase/server";
import type { EventDate, Instrument, Scale } from "@/lib/types";
import { todaysShishyaCode, isShishyaCodeValid } from "@/lib/shishyaCode";

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
  // Only the guru can hand out admin, and only to *verified* users
  // (shishya or audience — both first-class roles can now be admins).
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not authenticated" };
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "guru") return { ok: false, error: "only the guru can set admins" };

  if (value) {
    const { data: target } = await supabase
      .from("profiles")
      .select("is_verified")
      .eq("id", targetId)
      .single();
    if (!target?.is_verified) {
      return { ok: false, error: "user must be verified before being made admin" };
    }
  }

  const { error } = await supabase.from("profiles").update({ is_admin: value }).eq("id", targetId);
  if (error) return { ok: false, error: error.message };
  await logActivity("profile.admin", "profiles", targetId, { value });
  return { ok: true };
}

// ============================================================
// Role conversions (shishya <-> audience), admin-only.
// ============================================================
export async function setUserRole(targetId: string, role: "shishya" | "audience"): Promise<Result> {
  const auth = await requireAdminOrGuru();
  if ("error" in auth) return { ok: false, error: auth.error };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", targetId);
  if (error) return { ok: false, error: error.message };
  await logActivity(`profile.role.${role}`, "profiles", targetId, { role });
  return { ok: true };
}

// ============================================================
// Invite codes — verified users + guru can create. Anyone authed
// can resolve via SECURITY DEFINER RPC during signup.
// ============================================================
import { generateInviteToken } from "@/lib/shishyaCode";

export async function createInviteCode(label?: string): Promise<Result & { code?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not authenticated" };
  const { data: me } = await supabase
    .from("profiles")
    .select("is_verified, role")
    .eq("id", user.id)
    .single();
  if (!me || (!me.is_verified && me.role !== "guru")) {
    return { ok: false, error: "only verified users can create invite codes" };
  }

  // Try up to 5 times in case of collision
  const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateInviteToken();
    const { error } = await supabase.from("invite_codes").insert({
      code,
      creator_id: user.id,
      label: label?.trim() || null,
      expires_at,
    });
    if (!error) {
      await logActivity("invite.create", "invite_codes", code, { label, expires_at });
      return { ok: true, code };
    }
    // unique violation -> retry, anything else -> bail
    if (!error.message.includes("duplicate") && !error.message.includes("unique")) {
      return { ok: false, error: error.message };
    }
  }
  return { ok: false, error: "could not allocate a unique code, try again" };
}

export async function revokeInviteCode(code: string): Promise<Result> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not authenticated" };
  const { error } = await supabase
    .from("invite_codes")
    .update({ revoked_at: new Date().toISOString() })
    .eq("code", code.toUpperCase());
  if (error) return { ok: false, error: error.message };
  await logActivity("invite.revoke", "invite_codes", code, {});
  return { ok: true };
}

// ============================================================
// Admin requests — verify, change role
// ============================================================
export type RequestType = "verify" | "change_to_shishya" | "change_to_audience";

export async function raiseAdminRequest(request_type: RequestType, reason?: string): Promise<Result> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not authenticated" };

  // Guard: same-type already pending?
  const { data: existing } = await supabase
    .from("admin_requests")
    .select("id")
    .eq("user_id", user.id)
    .eq("request_type", request_type)
    .eq("status", "pending")
    .maybeSingle();
  if (existing) return { ok: false, error: "you already have a pending request of this kind" };

  const { error } = await supabase
    .from("admin_requests")
    .insert({ user_id: user.id, request_type, reason: reason?.trim() || null });
  if (error) return { ok: false, error: error.message };
  await logActivity(`request.raise.${request_type}`, "admin_requests", user.id, {});
  return { ok: true };
}

// ============================================================
// Daily shishya code — admins/guru can read; anyone can validate
// (validation is just an equality check, no DB).
// ============================================================
export async function getTodaysShishyaCode(): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  const auth = await requireAdminOrGuru();
  if ("error" in auth) return { ok: false, error: auth.error };
  try {
    return { ok: true, code: todaysShishyaCode() };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "code unavailable" };
  }
}

export async function checkShishyaCode(submitted: string): Promise<{ ok: boolean }> {
  return { ok: isShishyaCodeValid(submitted) };
}

export async function decideAdminRequest(
  id: number,
  decision: "accepted" | "rejected" | "ignored",
): Promise<Result> {
  const auth = await requireAdminOrGuru();
  if ("error" in auth) return { ok: false, error: auth.error };
  const supabase = await createClient();

  const { data: req } = await supabase
    .from("admin_requests")
    .select("id, user_id, request_type, status")
    .eq("id", id)
    .single();
  if (!req) return { ok: false, error: "request not found" };
  if (req.status !== "pending") return { ok: false, error: "already decided" };

  const { error: updErr } = await supabase
    .from("admin_requests")
    .update({
      status: decision,
      decided_by: auth.user.id,
      decided_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (updErr) return { ok: false, error: updErr.message };

  // Apply the effect if accepted
  if (decision === "accepted") {
    if (req.request_type === "verify") {
      await supabase.from("profiles").update({ is_verified: true }).eq("id", req.user_id);
    } else if (req.request_type === "change_to_shishya") {
      await supabase.from("profiles").update({ role: "shishya" }).eq("id", req.user_id);
    } else if (req.request_type === "change_to_audience") {
      await supabase.from("profiles").update({ role: "audience" }).eq("id", req.user_id);
    }
  }

  await logActivity(`request.${decision}.${req.request_type}`, "admin_requests", req.user_id, {});
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
