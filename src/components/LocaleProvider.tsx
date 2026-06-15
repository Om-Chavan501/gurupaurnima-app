"use client";
import { createContext, useContext } from "react";
import { t as tBase, type Locale } from "@/lib/i18n";

const Ctx = createContext<Locale>("mr");

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <Ctx.Provider value={locale}>{children}</Ctx.Provider>;
}

export function useLocale(): Locale {
  return useContext(Ctx);
}

export function useT() {
  const locale = useContext(Ctx);
  return (key: string, vars?: Record<string, string | number>) => tBase(key, locale, vars);
}
