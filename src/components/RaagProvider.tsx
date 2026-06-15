"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { DEFAULT_RAAG, RAAG_STORAGE_KEY, type RaagId } from "@/lib/raag";

type Ctx = {
  raag: RaagId;
  setRaag: (r: RaagId) => void;
};
const RaagContext = createContext<Ctx>({ raag: DEFAULT_RAAG, setRaag: () => {} });

export function RaagProvider({ children }: { children: React.ReactNode }) {
  const [raag, setRaagState] = useState<RaagId>(DEFAULT_RAAG);

  useEffect(() => {
    const saved = (typeof window !== "undefined"
      ? localStorage.getItem(RAAG_STORAGE_KEY)
      : null) as RaagId | null;
    if (saved) {
      setRaagState(saved);
      document.documentElement.setAttribute("data-raag", saved);
    } else {
      document.documentElement.setAttribute("data-raag", DEFAULT_RAAG);
    }
  }, []);

  const setRaag = useCallback((r: RaagId) => {
    setRaagState(r);
    document.documentElement.setAttribute("data-raag", r);
    try { localStorage.setItem(RAAG_STORAGE_KEY, r); } catch {}
  }, []);

  return (
    <RaagContext.Provider value={{ raag, setRaag }}>
      {children}
    </RaagContext.Provider>
  );
}

export function useRaag() { return useContext(RaagContext); }
