import crypto from "node:crypto";

/**
 * Deterministic HOTP-style daily code for shishya signup.
 * Day boundary is IST (Asia/Kolkata): a new code is in effect each day at 00:00 IST.
 *
 * Computed as: HMAC-SHA256(secret, "YYYY-MM-DD" in IST) -> first 4 bytes -> mod 10^6 -> 6-digit string.
 * Only the server knows SHISHYA_CODE_SECRET, so this can't be derived client-side.
 */
function istYMD(date = new Date()): string {
  const istOffsetMs = (5 * 60 + 30) * 60_000;
  const ist = new Date(date.getTime() + istOffsetMs);
  // ist.toISOString() now has the IST wall-clock as if it were UTC; slice YYYY-MM-DD
  return ist.toISOString().slice(0, 10);
}

export function todaysShishyaCode(date = new Date()): string {
  const secret = process.env.SHISHYA_CODE_SECRET;
  if (!secret) {
    throw new Error("SHISHYA_CODE_SECRET is not set on the server");
  }
  const ymd = istYMD(date);
  const h = crypto.createHmac("sha256", secret).update(ymd).digest();
  const n = h.readUInt32BE(0) % 1_000_000;
  return n.toString().padStart(6, "0");
}

/** Validate a user-submitted code against today's (with 1-day-back grace for late submitters). */
export function isShishyaCodeValid(submitted: string): boolean {
  if (!submitted) return false;
  const clean = submitted.trim();
  if (!/^\d{6}$/.test(clean)) return false;
  const today = todaysShishyaCode();
  const yesterday = todaysShishyaCode(new Date(Date.now() - 24 * 60 * 60 * 1000));
  return clean === today || clean === yesterday;
}

/** Friendly token for invite codes: 6 chars, no I/O/0/1 confusion. */
export function generateInviteToken(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}
