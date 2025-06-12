'use client';
import React from "react";
import Head from "next/head";
import { useEffect, useState } from "react";
import { reverseGeocode, Place } from "@/lib/geocode";
import { generateICS } from "@/lib/ics";
import { SunTimes } from "@/lib/sunTimes";
import Link from "next/link";
import { useSunTimes } from "@/hooks/useSunTimes";

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function Home() {
  // Function to handle calendar download
  function handleAddToCalendar(sunTimes: SunTimes, locationName: string) {
    // Only allow premium users to download calendar
    if (!isPremium) {
      alert("Calendar export is a premium feature. Upgrade to download.");
      return;
    }
    
    // Generate ICS file content
    const icsContent = generateICS(sunTimes, locationName);
    
    // Create downloadable file
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `golden-hours-${new Date().toISOString().split('T')[0]}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Premium state (temporary toggle for testing)
  const [isPremium, setIsPremium] = useState(false);
  
  const [location, setLocation] = useState<Place | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [cityInput, setCityInput] = useState("");
  const [cityError, setCityError] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  // If user chooses city, geocode it
  async function handleCitySearch() {
    setCityError("");
    if (!cityInput.trim()) {
      setCityError("Enter a city name");
      return;
    }
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityInput)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) {
      setCityError("Could not search city");
      return;
    }
    const json = await res.json();
    const result = json.results?.[0];
    if (!result) {
      setCityError("City not found");
      return;
    }
    setLocation({ city: result.name, country: result.country || "" });
    setCoords({ lat: result.latitude, lon: result.longitude });
    setShowLocationPrompt(false);
  }

  // On mount: use geolocation if no city set
  useEffect(() => {
    if (coords) return; // already have coords from city search
    
    // Default to a fallback location if geolocation fails or isn't available
    const useFallbackLocation = () => {
      // Default to Johannesburg, South Africa
      const fallbackLat = -26.2041;
      const fallbackLon = 28.0473;
      setCoords({ lat: fallbackLat, lon: fallbackLon });
      setLocation({ city: "Johannesburg", country: "South Africa" });
    };
    
    if (!navigator.geolocation) {
      useFallbackLocation();
      return;
    }
    
    // Set a timeout to ensure we don't wait forever
    const timeoutId = setTimeout(() => {
      if (!coords) {
        useFallbackLocation();
      }
    }, 5000);
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        clearTimeout(timeoutId);
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        // Reverse geocode to get city/country
        try {
          const place = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          if (place) setLocation(place);
          else useFallbackLocation();
        } catch (error) {
          useFallbackLocation();
        }
      },
      (error) => {
        clearTimeout(timeoutId);
        console.log("Geolocation error:", error.message);
        useFallbackLocation();
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
    
    return () => clearTimeout(timeoutId);
  }, [coords]);

  // Use coords for sun times
  const { data, loading, error } = useSunTimes(coords?.lat, coords?.lon);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading…</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 text-center">
        <p className="text-red-600 max-w-sm">
          {error ?? "Unable to load sunrise/sunset data."}
          <br />
          Please allow location access or refresh the page.
        </p>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Sunrise, Sunset & Golden Hour Times Near You | GoldenHourToday</title>
        <meta name="description" content="See today's sunrise, sunset, and golden hour times for your exact location. Free, fast, mobile-friendly, and ad-free for early users." />
        <meta property="og:title" content="Sunrise, Sunset & Golden Hour Times Near You" />
        <meta property="og:description" content="See today's sunrise, sunset, and golden hour times for your exact location. Free, fast, mobile-friendly, and ad-free for early users." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <header className="sticky top-0 z-10 w-full bg-white/80 dark:bg-black/80 border-b border-zinc-200 dark:border-zinc-800 flex flex-col items-center py-2 mb-6 shadow-sm">
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold" style={{color: '#F5831F'}}>GoldenHourToday <span aria-label="sun" role="img">☀️</span></span>
          <div className="text-sm">
            <span>Location: </span>
            {location ? (
              <span>{location.city}, {location.country}</span>
            ) : (
              <span>Detecting location...</span>
            )}
            <button 
              onClick={() => setShowLocationPrompt(true)}
              className="ml-2 text-blue-600 hover:underline text-xs"
              aria-label="Change location"
            >
              Change Location
            </button>
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Today: {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </header>
      <main className="min-h-screen flex flex-col items-center p-4 bg-white dark:bg-black">
        {showLocationPrompt && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded shadow w-80 max-w-full">
              <h2 className="text-lg font-bold mb-2">Change Location</h2>
              <input
                className="w-full p-2 mb-2 border rounded text-white bg-zinc-800 border-zinc-600 placeholder-zinc-400"
                type="text"
                placeholder="Enter city name"
                value={cityInput}
                onChange={e => setCityInput(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={handleCitySearch}>Search</button>
                <button className="px-3 py-1 rounded border" onClick={() => setShowLocationPrompt(false)}>Cancel</button>
              </div>
              {cityError && <div className="text-red-600 text-xs mt-2">{cityError}</div>}
            </div>
          </div>
        )}
        <div className="w-full max-w-sm border rounded-lg p-4 shadow bg-white dark:bg-zinc-900" aria-label="Today's sun times">
          <table className="w-full text-left">
            <tbody className="text-sm">
              <tr>
                <td className="py-1" aria-label="Sunrise">Sunrise</td>
                <td className="py-1 text-right font-medium" aria-label={`Sunrise at ${formatTime(data.sunrise)}`}>{formatTime(data.sunrise)}</td>
              </tr>
              <tr>
                <td className="py-1" aria-label="First light">First-light</td>
                <td className="py-1 text-right font-medium" aria-label={`First light at ${formatTime(data.civilTwilightBegin)}`}>{formatTime(data.civilTwilightBegin)}</td>
              </tr>
              <tr>
                <td className="py-1" aria-label="Morning golden hour">Morning golden hour ✨</td>
                <td className="py-1 text-right font-medium" aria-label={`Morning golden hour from ${formatTime(data.goldenHourMorningStart)} to ${formatTime(data.goldenHourMorningEnd)}`}>{formatTime(data.goldenHourMorningStart)} – {formatTime(data.goldenHourMorningEnd)}</td>
              </tr>
              <tr>
                <td className="py-1" aria-label="Solar noon">Solar noon</td>
                <td className="py-1 text-right font-medium" aria-label={`Solar noon at ${formatTime(new Date((data.sunrise.getTime() + data.sunset.getTime()) / 2))}`}>
                  {formatTime(new Date((data.sunrise.getTime() + data.sunset.getTime()) / 2))}
                </td>
              </tr>
              <tr>
                <td className="py-1" aria-label="Evening golden hour">Evening golden hour ✨</td>
                <td className="py-1 text-right font-medium" aria-label={`Evening golden hour from ${formatTime(data.goldenHourEveningStart)} to ${formatTime(data.goldenHourEveningEnd)}`}>{formatTime(data.goldenHourEveningStart)} – {formatTime(data.goldenHourEveningEnd)}</td>
              </tr>
              <tr>
                <td className="py-1" aria-label="Sunset">Sunset</td>
                <td className="py-1 text-right font-medium" aria-label={`Sunset at ${formatTime(data.sunset)}`}>{formatTime(data.sunset)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Add to Calendar Button */}
        <div className="mt-4 flex justify-center">
          <button 
            onClick={() => handleAddToCalendar(data, location?.city || 'Current Location')}
            className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            aria-label="Add golden hours to calendar"
          >
            <span>➕ Add to Calendar</span>
            {!isPremium && (
              <span className="ml-1 text-xs bg-amber-500 text-white px-1 rounded">PREMIUM</span>
            )}
          </button>
        </div>
        
        {/* Ad Banner (hidden for premium) */}
        {!isPremium && (
          <div className="w-full max-w-sm mt-6 p-4 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Advertisement</p>
            <div className="h-16 flex items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-600 my-2">
              <span className="text-zinc-400">Ad Banner Placeholder</span>
            </div>
            <button 
              onClick={() => setIsPremium(!isPremium)} 
              className="text-xs text-blue-600 hover:underline"
            >
              {isPremium ? "Show Ads (Disable Premium)" : "Go Ad-Free with Premium"}
            </button>
          </div>
        )}
        
        {/* 7-Day Forecast Link */}
        <div className="mt-6 w-full max-w-sm">
          <Link href="/forecast" className="block w-full text-center py-2 px-4 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
            7-Day Forecast →
          </Link>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 mt-12 py-4 text-center text-xs text-zinc-500">
        <div className="container mx-auto px-4">
          <p>© 2025 GoldenHourToday | <a href="/privacy" className="hover:underline">Privacy</a> | <a href="/contact" className="hover:underline">Contact</a></p>
        </div>
      </footer>
    </>
  );
}
