"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { COUNTRIES } from "@/lib/countries";
import type { Profile, Gender } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { updateProfileBasics } from "@/lib/actions";
import AvatarPicker from "@/components/AvatarPicker";
import { useT } from "@/components/LocaleProvider";

export default function ProfileEditForm({ profile }: { profile: Profile }) {
  const t = useT();
  const router = useRouter();
  const [first, setFirst] = useState(profile.first_name);
  const [last, setLast] = useState(profile.last_name);
  const [dob, setDob] = useState(profile.dob ?? "");
  const [gender, setGender] = useState<Gender>(profile.gender ?? "prefer_not_to_say");
  const initialCountry = COUNTRIES.find((c) => c.dial === profile.whatsapp_country_code)?.code ?? "IN";
  const [country, setCountry] = useState(initialCountry);
  const [phone, setPhone] = useState(profile.whatsapp_number ?? "");
  const [years, setYears] = useState(profile.years_with_guru?.toString() ?? "");
  const [months, setMonths] = useState(profile.months_with_guru?.toString() ?? "");
  const [picUrl, setPicUrl] = useState<string | null>(profile.profile_pic_url);
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();

  async function onPick(file: File | null) {
    const supabase = createClient();
    if (!file) {
      await supabase.from("profiles").update({ profile_pic_url: null }).eq("id", profile.id);
      setPicUrl(null);
      router.refresh();
      toast.success(t("profile.remove"));
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${profile.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("profile-pics").upload(path, file, { upsert: true });
    if (upErr) {
      toast.error(upErr.message.includes("not found")
        ? "Storage bucket 'profile-pics' missing. Create it in Supabase → Storage."
        : upErr.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("profile-pics").getPublicUrl(path);
    await supabase.from("profiles").update({ profile_pic_url: data.publicUrl }).eq("id", profile.id);
    setPicUrl(data.publicUrl);
    setUploading(false);
    router.refresh();
    toast.success(t("profile.changePicture"));
  }

  function save() {
    const dial = COUNTRIES.find((c) => c.code === country)?.dial ?? "+91";
    start(async () => {
      const r = await updateProfileBasics({
        first_name: first,
        last_name: last,
        dob: dob || null,
        gender,
        whatsapp_country_code: dial,
        whatsapp_number: phone || null,
        years_with_guru: years ? Number(years) : null,
        months_with_guru: months ? Number(months) : null,
      });
      if (r.ok) { toast.success(t("profile.saved")); router.refresh(); }
      else toast.error(r.error);
    });
  }

  return (
    <div className="mt-10 space-y-8">
      <AvatarPicker
        initialUrl={picUrl}
        initials={`${(first[0] ?? "").toUpperCase()}${(last[0] ?? "").toUpperCase()}`}
        onChange={onPick}
      />
      {uploading && <div className="text-xs" style={{ color: "var(--ink-2)" }}>{t("profile.uploading")}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div className="field-group">
          <label>{t("signup.form.firstName")}</label>
          <input className="field" value={first} onChange={(e) => setFirst(e.target.value)} />
        </div>
        <div className="field-group">
          <label>{t("signup.form.lastName")}</label>
          <input className="field" value={last} onChange={(e) => setLast(e.target.value)} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="field-group">
          <label>{t("shishyaDetail.dob")}</label>
          <input className="field" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
        </div>
        <div className="field-group">
          <label>{t("shishyaDetail.gender")}</label>
          <select className="field" value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
            {(["male","female","other","prefer_not_to_say"] as Gender[]).map((g) => (
              <option key={g} value={g} style={{ background: "var(--bg-1)" }}>{g.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-group">
        <label>{t("shishyaDetail.whatsapp")}</label>
        <div className="flex gap-3">
          <select className="field" style={{ maxWidth: 150 }} value={country} onChange={(e) => setCountry(e.target.value)}>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code} style={{ background: "var(--bg-1)" }}>
                {c.flag} {c.dial} {c.name}
              </option>
            ))}
          </select>
          <input className="field flex-1" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} />
        </div>
      </div>

      <div className="field-group">
        <label>{t("shishyaDetail.withGuru")}</label>
        <div className="flex gap-3">
          <input className="field" type="number" min="0" placeholder={t("signup.profile.years")} value={years} onChange={(e) => setYears(e.target.value)} />
          <input className="field" type="number" min="0" max="11" placeholder={t("signup.profile.months")} value={months} onChange={(e) => setMonths(e.target.value)} />
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between">
        <form action="/logout" method="post">
          <button className="btn-link text-sm">{t("profile.signOut")}</button>
        </form>
        <button onClick={save} disabled={pending} className="btn">{pending ? "…" : t("common.save")}</button>
      </div>
    </div>
  );
}
