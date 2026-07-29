"use client";

import { useCountry } from "@/lib/country";

export function CountryToggle({ className = "" }: { className?: string }) {
  const { country, setCountry } = useCountry();

  return (
    <div className={`inline-flex items-center rounded-pill bg-canvas-soft p-xxs ${className}`}>
      <button
        type="button"
        onClick={() => setCountry("LK")}
        className={`rounded-pill px-md py-xs text-body-sm-strong transition-colors ${
          country === "LK" ? "bg-primary-600 text-on-dark" : "text-body hover:text-ink"
        }`}
      >
        🇱🇰 LK
      </button>
      <button
        type="button"
        onClick={() => setCountry("AU")}
        className={`rounded-pill px-md py-xs text-body-sm-strong transition-colors ${
          country === "AU" ? "bg-primary-600 text-on-dark" : "text-body hover:text-ink"
        }`}
      >
        🇦🇺 AU
      </button>
    </div>
  );
}
