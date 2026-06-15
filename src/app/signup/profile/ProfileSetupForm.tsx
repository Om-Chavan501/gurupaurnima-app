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
};

export default function ProfileSetupForm({ userId, email, initialFirst, initialLast }: Props) {
  const router = useRouter();
  const [first, setFirst] = useState(initialFirst);
  const [last, setLast] = useState(initialLast);
  const [dob, setDob] = useState("");
  const [role, setRole] = useState<Role>("shishya");
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
      years_with_guru: years ? Number(years) : null,
      months_with_guru: months ? Number(months) : null,
      profile_pic_url,
      profile_completed: true,
    });

    setBusy(false);
    if (error) { toast.error(error.message); return; }
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
          <label>I am a *</label>
          <div className="flex gap-3 pt-2">
            {(["shishya", "itar"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className="px-4 py-2 rounded-full text-sm transition"
                style={{
                  border: "1px solid var(--line)",
                  background: role === r ? "var(--accent)" : "transparent",
                  color: role === r ? "var(--bg-0)" : "var(--ink-1)",
                }}
              >
                {r === "shishya" ? "Shishya" : "Itar (other)"}
              </button>
            ))}
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

      <div className="field-group">
        <label>How long with Saurabh Dada? (optional)</label>
        <div className="flex gap-3">
          <input className="field" type="number" min="0" placeholder="Years" value={years} onChange={(e) => setYears(e.target.value)} />
          <input className="field" type="number" min="0" max="11" placeholder="Months" value={months} onChange={(e) => setMonths(e.target.value)} />
        </div>
      </div>

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
          {busy ? "Settling in…" : "Enter the aangan →"}
        </button>
      </div>
    </form>
  );
}
