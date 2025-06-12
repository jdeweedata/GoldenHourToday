import { useEffect, useState } from "react";
import { fetchSunTimes, SunTimes } from "@/lib/sunTimes";

interface UseSunTimes {
  data: SunTimes | null;
  loading: boolean;
  error: string | null;
}

export function useSunTimes(lat?: number, lon?: number): UseSunTimes {
  const [data, setData] = useState<SunTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTimes() {
      setLoading(true);
      setError(null);
      try {
        if (lat !== undefined && lon !== undefined) {
          const times = await fetchSunTimes(lat, lon);
          setData(times);
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const times = await fetchSunTimes(pos.coords.latitude, pos.coords.longitude);
              setData(times);
            },
            (geoErr) => {
              setError(geoErr.message);
            },
            { enableHighAccuracy: false, timeout: 10000 }
          );
        } else {
          setError("Geolocation is not supported by this browser.");
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchTimes();
  }, [lat, lon]);

  return { data, loading, error };
}
