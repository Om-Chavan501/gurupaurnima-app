import enRaw from "@/i18n/en.json";
import mrRaw from "@/i18n/mr.json";

export type Locale = "en" | "mr";
export const LOCALES: Locale[] = ["en", "mr"];
export const DEFAULT_LOCALE: Locale = "mr";
export const LOCALE_COOKIE = "gp.locale";

const DICTS: Record<Locale, Record<string, string>> = {
  en: enRaw as Record<string, string>,
  mr: mrRaw as Record<string, string>,
};

/** Look up a string by key. Falls back to English, then to the key itself. */
export function t(key: string, locale: Locale = DEFAULT_LOCALE, vars?: Record<string, string | number>): string {
  let raw = DICTS[locale]?.[key] ?? DICTS.en?.[key] ?? key;
  if (vars) {
    for (const k of Object.keys(vars)) raw = raw.replaceAll(`{${k}}`, String(vars[k]));
  }
  return raw;
}

export function isLocale(v: unknown): v is Locale {
  return v === "en" || v === "mr";
}
