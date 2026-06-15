export type Role = "guru" | "shishya" | "audience";
export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type EventDate = "2026-07-31" | "2026-08-01" | "2026-08-02";
export type Scale =
  | "A" | "A#" | "B" | "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#";
export type Instrument =
  | "tabla" | "harmonium" | "tanpura_digital" | "tanpura_physical" | "taal" | "keyboard";

export const EVENT_DATES: { value: EventDate; label: string }[] = [
  { value: "2026-07-31", label: "31 July 2026 (Fri)" },
  { value: "2026-08-01", label: "1 August 2026 (Sat)" },
  { value: "2026-08-02", label: "2 August 2026 (Sun)" },
];

export const SCALES: { value: Scale; marathi: string }[] = [
  { value: "A",  marathi: "काळी ४" },
  { value: "A#", marathi: "पांढरी ५" },
  { value: "B",  marathi: "काळी ५" },
  { value: "C",  marathi: "सफेद १" },
  { value: "C#", marathi: "काळी १" },
  { value: "D",  marathi: "सफेद २" },
  { value: "D#", marathi: "काळी २" },
  { value: "E",  marathi: "सफेद ३" },
  { value: "F",  marathi: "सफेद ४" },
  { value: "F#", marathi: "काळी ३" },
  { value: "G",  marathi: "पांढरी ४" },
  { value: "G#", marathi: "पांढरी ४♯" },
];

export const INSTRUMENTS: { value: Instrument; label: string }[] = [
  { value: "tabla", label: "Tabla" },
  { value: "harmonium", label: "Peti / Harmonium" },
  { value: "tanpura_digital", label: "Tanpura (digital)" },
  { value: "tanpura_physical", label: "Tanpura (physical)" },
  { value: "taal", label: "Taal" },
  { value: "keyboard", label: "Keyboard / Casio" },
];

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  dob: string | null;
  gender: Gender | null;
  role: Role;
  is_admin: boolean;
  is_verified: boolean;
  whatsapp_country_code: string | null;
  whatsapp_number: string | null;
  years_with_guru: number | null;
  months_with_guru: number | null;
  profile_pic_url: string | null;
  profile_completed: boolean;
  notifications_read_at: string | null;
  invited_by: string | null;
  invited_as: "shishya" | "audience" | null;
  created_at: string;
  updated_at: string;
};

export type InviteCode = {
  code: string;
  creator_id: string;
  label: string | null;
  created_at: string;
  expires_at: string;
  redeemed_count: number;
  revoked_at: string | null;
};

export type AdminRequestType = "verify" | "change_to_shishya" | "change_to_audience";
export type AdminRequestStatus = "pending" | "accepted" | "rejected" | "ignored";

export type AdminRequest = {
  id: number;
  user_id: string;
  request_type: AdminRequestType;
  status: AdminRequestStatus;
  decided_by: string | null;
  decided_at: string | null;
  reason: string | null;
  created_at: string;
};
