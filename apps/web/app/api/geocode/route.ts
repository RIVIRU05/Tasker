import { NextRequest, NextResponse } from "next/server";
import type { LocationSuggestion } from "@taskhub/shared";

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
  };
}

function toSuggestion(result: NominatimResult): LocationSuggestion {
  const addr = result.address ?? {};
  const city = addr.city || addr.town || addr.village || addr.suburb || result.display_name.split(",")[0].trim();
  const district = addr.county || addr.state_district;
  const province = addr.state;
  const label = [city, district, province].filter(Boolean).join(", ");
  return {
    label: label || result.display_name,
    city,
    address: result.display_name,
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
  };
}

// Proxies Nominatim (OpenStreetMap's free geocoder) server-side rather than
// calling it from the browser: browsers won't let client JS set a User-Agent
// header, which Nominatim's usage policy requires for identification. Doing
// it here also keeps request volume low and cacheable if that's ever needed.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 3) {
    return NextResponse.json({ results: [] });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "lk");
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
