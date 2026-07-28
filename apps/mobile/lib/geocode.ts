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

// Called directly from the device — React Native's fetch (unlike a browser's)
// allows a custom User-Agent, which is what Nominatim's usage policy asks for
// to identify the calling app.
export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  if (query.trim().length < 3) return [];
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "lk");
  url.searchParams.set("limit", "5");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "TaskerApp/1.0 (contact: rivirusandamuthu@gmail.com)" },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as NominatimResult[];
  return data.map(toSuggestion);
}
