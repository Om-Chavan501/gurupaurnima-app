export type RaagId = "yaman" | "bhairav" | "malkauns" | "bageshri" | "bhoopali" | "todi";

export const RAAGS: { id: RaagId; name: string; samay: string; tagline: string }[] = [
  { id: "yaman",    name: "Yaman",    samay: "Evening",      tagline: "lamp-lit reverence" },
  { id: "bhairav",  name: "Bhairav",  samay: "Dawn",         tagline: "first ember of devotion" },
  { id: "malkauns", name: "Malkauns", samay: "Midnight",     tagline: "depths of stillness" },
  { id: "bageshri", name: "Bageshri", samay: "Late night",   tagline: "soft longing" },
  { id: "bhoopali", name: "Bhoopali", samay: "Early evening",tagline: "open sky, clear breath" },
  { id: "todi",     name: "Todi",     samay: "Late morning", tagline: "intricate sunlight" },
];

export const DEFAULT_RAAG: RaagId = "yaman";
export const RAAG_STORAGE_KEY = "gp.raag";
