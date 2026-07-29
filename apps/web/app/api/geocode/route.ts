import { NextRequest, NextResponse } from "next/server";
import { SRI_LANKA_DISTRICTS, type CountryCode, type LocationSuggestion } from "@taskhub/shared";

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    county?: string;
    state_district?: string;
    state?: string;
    country_code?: string;
  };
}

function normalizeDistrict(raw?: string): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/\s*District$/i, "").trim();
  const match = SRI_LANKA_DISTRICTS.find((d) => d.toLowerCase() === cleaned.toLowerCase());
  return match ?? cleaned;
}

function toSuggestion(result: NominatimResult): LocationSuggestion {
  const addr = result.address ?? {};
  const city = addr.city || addr.town || addr.village || addr.suburb || result.display_name.split(",")[0].trim();
  const district = normalizeDistrict(addr.county || addr.state_district);
  const province = addr.state;
  const country = addr.country_code?.toUpperCase() as CountryCode | undefined;
  const label = [city, district, province].filter(Boolean).join(", ");
  return {
    label: label || result.display_name,
    city,
    district,
    province,
    country,
    address: result.display_name,
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
  };
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 3) {
    return NextResponse.json({ results: [] });
  }
  const countryParam = req.nextUrl.searchParams.get("country");
  const countrycodes = countryParam === "LK" || countryParam === "AU" ? countryParam.toLowerCase() : "lk,au";

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", countrycodes);
  url.searchParams.set("limit", "5");

  const res = await fetch(url, {
    headers: { "User-Agent": "TaskerApp/1.0 (contact: rivirusandamuthu@gmail.com)" },
  });
  if (!res.ok) {
    return NextResponse.json({ results: [] }, { status: 502 });
  }
  const data = (await res.json()) as NominatimResult[];
  return NextResponse.json({ results: data.map(toSuggestion) });
}
