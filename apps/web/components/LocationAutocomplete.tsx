"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import type { CountryCode, LocationSuggestion } from "@taskhub/shared";

interface LocationAutocompleteProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (text: string) => void;
  onSelect: (suggestion: LocationSuggestion) => void;
  country?: CountryCode;
  required?: boolean;
}

export function LocationAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  country,
  required,
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const skipNextSearch = useRef(false);

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const countryQuery = country ? `&country=${country}` : "";
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(value)}${countryQuery}`);
        const data = await res.json();
        setSuggestions(data.results ?? []);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [value, country]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(s: LocationSuggestion) {
    skipNextSearch.current = true;
    setSuggestions([]);
    setOpen(false);
    onSelect(s);
  }

  return (
    <div className="relative" ref={wrapRef}>
      <label className="block">
        <span className="block text-body-sm-strong text-ink mb-xs">{label}</span>
        <input
          type="text"
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          autoComplete="off"
          className="w-full bg-canvas-soft text-ink placeholder:text-mute rounded-md px-lg py-lg text-body-md outline-none focus:ring-2 focus:ring-ink/20 transition-shadow"
        />
      </label>
      {open && (loading || suggestions.length > 0) && (
        <div className="absolute z-20 mt-xs w-full rounded-md bg-canvas shadow-level2 border border-black/[0.06] overflow-hidden">
          {loading && <div className="px-lg py-md text-body-sm text-mute">Searching…</div>}
          {!loading &&
            suggestions.map((s, i) => (
              <button
                type="button"
                key={`${s.lat}-${s.lng}-${i}`}
                onClick={() => handleSelect(s)}
                className="w-full flex items-start gap-sm text-left px-lg py-md hover:bg-canvas-soft transition-colors"
              >
                <MapPin size={15} className="text-mute mt-[3px] shrink-0" />
                <span className="text-body-sm text-ink">{s.label}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
