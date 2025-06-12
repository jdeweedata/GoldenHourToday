export interface Place {
  city: string;
  country: string;
}

export async function reverseGeocode(lat: number, lon: number): Promise<Place | null> {
  try {
    // Try direct API call first (for production environment)
    try {
      const directUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&format=json`;
      const directResponse = await fetch(directUrl);
      if (directResponse.ok) {
        const data = await directResponse.json();
        if (data && data.name && data.country) {
          return {
            city: data.name,
            country: data.country,
          };
        }
      }
    } catch (directError) {
      console.log('Direct geocoding failed, trying API route:', directError);
      // Continue to API route if direct call fails
    }

    // Fallback to API route (for development with CORS issues)
    const url = `/api/geocode?lat=${lat}&lon=${lon}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    const data = await response.json();
    if (!data || !data.city) {
      return null;
    }
    return {
      city: data.city,
      country: data.country || "",
    };
  } catch (error) {
    console.error("Error during reverse geocoding:", error);
    return null;
  }
}
