"use client";

import type { CountryCode } from "@taskhub/shared";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "tasker_country";

interface CountryContextValue {
  country: CountryCode;
  setCountry: (country: CountryCode) => void;
}

const CountryContext = createContext<CountryContextValue | null>(null);

export function CountryProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<CountryCode>("LK");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "LK" || stored === "AU") setCountryState(stored);
  }, []);

  function setCountry(next: CountryCode) {
    setCountryState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return <CountryContext.Provider value={{ country, setCountry }}>{children}</CountryContext.Provider>;
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error("useCountry must be used within CountryProvider");
  return ctx;
}
