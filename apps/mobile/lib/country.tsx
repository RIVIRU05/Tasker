import type { CountryCode } from "@taskhub/shared";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "tasker_country";

interface CountryContextValue {
  country: CountryCode;
  setCountry: (country: CountryCode) => void;
}

const CountryContext = createContext<CountryContextValue | null>(null);

export function CountryProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<CountryCode>("AU");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "LK" || stored === "AU") setCountryState(stored);
    });
  }, []);

  function setCountry(next: CountryCode) {
    setCountryState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }

  return <CountryContext.Provider value={{ country, setCountry }}>{children}</CountryContext.Provider>;
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error("useCountry must be used within CountryProvider");
  return ctx;
}
