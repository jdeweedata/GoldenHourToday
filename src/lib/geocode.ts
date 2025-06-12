export interface Place {
  city: string;
  country: string;
}

export async function reverseGeocode(lat: number, lon: number): Promise<Place | null> {
  // Use our internal API route to bypass CORS
  const url = `/api/geocode?lat=${lat}&lon=${lon}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const place = json.results?.[0];
  if (!place) return null;
  return {
    city: place.city || place.name || "Unknown",
    country: place.country || "",
  };
}
