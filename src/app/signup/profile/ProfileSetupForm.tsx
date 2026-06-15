"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import type { Gender, Role } from "@/lib/types";
import AvatarPicker from "@/components/AvatarPicker";

type Props = {
  userId: string;
  email: string;
  initialFirst: string;
  initialLast: string;
  intendedRole: "shishya" | "audience";
  invitedBy: string | null;
  inviteCode: string | null;
};

export default function ProfileSetupForm({
  userId, email, initialFirst, initialLast, intendedRole, invitedBy, inviteCode,
}: Props) {
  const router = useRouter();
  const [first, setFirst] = useState(initialFirst);
  const [last, setLast] = useState(initialLast);
  const [dob, setDob] = useState("");
  // Role is fixed at signup — comes from the gating step. No picker here.
  const role: Role = intendedRole;
  const [gender, setGender] = useState<Gender | "">("");
  const [country, setCountry] = useState(DEFAULT_COUNTRY.code);
  const [phone, setPhone] = useState("");
  const [years, setYears] = useState<string>("");
  const [months, setMonths] = useState<string>("");
  const [pic, setPic] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!first || !last || !dob || !gender || !phone) {
      toast.error("Please fill all required fields");
      return;
    }
    setBusy(true);
    const supabase = createClient();

    let profile_pic_url: string | null = null;
    if (pic) {
      const ext = pic.name.split(".").pop() ?? "jpg";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("profile-pics").upload(path, pic, { upsert: true });
      if (upErr) {
        toast.warning(`Couldn't upload picture (${upErr.message}). Finishing signup without it — you can add one from your profile later.`);
      } else {
        const { data } = supabase.storage.from("profile-pics").getPublicUrl(path);
        profile_pic_url = data.publicUrl;
      }
    }

    const dial = COUNTRIES.find((c) => c.code === country)?.dial ?? "+91";

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      first_name: first,
      last_name: last,
      email,
      dob,
      gender: gender as Gender,
      role,
      whatsapp_country_code: dial,
      whatsapp_number: phone,
      years_with_guru: role === "shishya" && years ? Number(years) : null,
      months_with_guru: role === "shishya" && months ? Number(months) : null,
      profile_pic_url,
      profile_completed: true,
      invited_by: invitedBy,
      invited_as: role,
    });

    if (error) { setBusy(false); toast.error(error.message); return; }

    // Audience: mark the invite code as redeemed (best-effort).
    if (role === "audience" && inviteCode) {
      await supabase.rpc("mark_invite_redeemed", { p_code: inviteCode });
    }

    // Surface in admin activity feed as a fresh join via invite.
    if (invitedBy) {
      await supabase.from("activity_log").insert({
        actor_id: userId,
        action: "signup.invite_redeemed",
        target_table: "profiles",
        target_id: userId,
        payload: { invited_by: invitedBy, invite_code: inviteCode, role },
      });
    }

    setBusy(false);
    toast.success("Welcome.");
    router.push("/app");
  }

  return (
    <form onSubmit={submit} className="mt-10 space-y-7">
      <div className="grid grid-cols-2 gap-4">
        <div className="field-group">
          <label>First name *</label>
          <input className="field" value={first} onChange={(e) => setFirst(e.target.value)} />
        </div>
        <div className="field-group">
          <label>Last name *</label>
          <input className="field" value={last} onChange={(e) => setLast(e.target.value)} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="field-group">
          <label>Date of birth *</label>
          <input className="field" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
        </div>
        <div className="field-group">
          <label>Joining as</label>
          <div className="pt-2 text-base" style={{ color: "var(--ink-0)" }}>
            {role === "shishya" ? "Shishya" : "Audience · श्रोता"}
          </div>
        </div>
      </div>

      <div className="field-group">
        <label>Gender *</label>
        <div className="flex flex-wrap gap-3 pt-2">
          {(["male","female","other","prefer_not_to_say"] as Gender[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className="px-4 py-2 rounded-full text-sm capitalize transition"
              style={{
                border: "1px solid var(--line)",
                background: gender === g ? "var(--accent)" : "transparent",
                color: gender === g ? "var(--bg-0)" : "var(--ink-1)",
              }}
            >
              {g.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="field-group">
        <label>WhatsApp number *</label>
        <div className="flex gap-3">
          <select className="field" style={{ maxWidth: 150 }} value={country} onChange={(e) => setCountry(e.target.value)}>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code} style={{ background: "var(--bg-1)" }}>
                {c.flag} {c.dial} {c.name}
              </option>
            ))}
          </select>
          <input className="field flex-1" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="9876543210" />
        </div>
      </div>

      {role === "shishya" && (
        <div className="field-group">
          <label>How long with Saurabh Dada? (optional)</label>
          <div className="flex gap-3">
            <input className="field" type="number" min="0" placeholder="Years" value={years} onChange={(e) => setYears(e.target.value)} />
            <input className="field" type="number" min="0" max="11" placeholder="Months" value={months} onChange={(e) => setMonths(e.target.value)} />
          </div>
        </div>
      )}

      <div className="field-group">
        <label>Profile picture (optional)</label>
        <div className="pt-2">
          <AvatarPicker
            initials={`${(first[0] ?? "").toUpperCase()}${(last[0] ?? "").toUpperCase()}` || "·"}
            onChange={setPic}
          />
        </div>
      </div>

      <div className="pt-2 flex items-center justify-end">
        <button className="btn" disabled={busy} type="submit">
          {busy ? "Saving…" : "Done — take me in"}
        </button>
      </div>
    </form>
  );
}
