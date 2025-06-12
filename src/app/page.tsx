'use client';
import React from "react";
import { useEffect, useState, useCallback } from "react";
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

  // Default to a fallback location if geolocation fails or isn't available
  const applyFallbackLocation = useCallback(() => {
    console.log("Using fallback location");
    // Default to Johannesburg, South Africa
    const fallbackLat = -26.2041;
    const fallbackLon = 28.0473;
    setCoords({ lat: fallbackLat, lon: fallbackLon });
    setLocation({ city: "Johannesburg", country: "South Africa" });
  }, [setCoords, setLocation]);

  // On mount: use geolocation if no city set
  useEffect(() => {
    if (coords) return; // already have coords from city search
    
    // Check if geolocation is available
    if (!navigator.geolocation) {
      console.log("Geolocation not available in browser");
      applyFallbackLocation();
      return;
    }
    
    // Set a timeout to ensure we don't wait forever for geolocation
    const timeoutId = setTimeout(() => {
      console.log("Geolocation timed out");
      if (!coords) {
        applyFallbackLocation();
      }
    }, 5000);
    
    try {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            clearTimeout(timeoutId);
            console.log("Geolocation successful", pos.coords.latitude, pos.coords.longitude);
            setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
            
            // Reverse geocode to get city/country
            try {
              const place = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
              if (place) {
                console.log("Geocoding successful", place);
                setLocation(place);
              } else {
                console.log("Geocoding returned null place");
                applyFallbackLocation();
              }
            } catch (geocodeError) {
              console.error("Geocoding error:", geocodeError);
              applyFallbackLocation();
            }
          } catch (posError) {
            console.error("Error handling position:", posError);
            applyFallbackLocation();
          }
        },
        (error) => {
          clearTimeout(timeoutId);
          console.error("Geolocation error:", error.code, error.message);
          // If user denied permission, show location prompt
          if (error.code === 1) { // PERMISSION_DENIED
            setShowLocationPrompt(true);
          } else {
            applyFallbackLocation();
          }
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    } catch (geoError) {
      console.error("Unexpected geolocation error:", geoError);
      applyFallbackLocation();
    }
    
    return () => clearTimeout(timeoutId);
  }, [coords, applyFallbackLocation]); // Added applyFallbackLocation to dependency array

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
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:outline-none">
        Skip to content
      </a>
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
      <main id="main-content" className="min-h-screen flex flex-col items-center p-4 bg-white dark:bg-black">
        <h1 className="sr-only">GoldenHourToday - Sunrise, Sunset & Golden Hour Calculator</h1>
        {/* Location Modal */}
        {showLocationPrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h2 className="text-lg font-bold mb-2">Enter Your Location</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                {location ? 
                  "Change your current location:" : 
                  "Location access was denied or unavailable. Please enter your city manually:"}
              </p>
              <div className="mb-4">
                <label htmlFor="city" className="block text-sm font-medium mb-1">City Name</label>
                <input 
                  type="text" 
                  id="city" 
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-black dark:text-white" 
                  value={cityInput} 
                  onChange={(e) => setCityInput(e.target.value)} 
                  placeholder="e.g. London"
                  autoFocus
                />
                {cityError && <p className="text-red-500 text-xs mt-1">{cityError}</p>}
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => {
                    setShowLocationPrompt(false);
                    // If no location yet, use fallback
                    if (!location && !coords) {
                      // Default to Johannesburg
                      setCoords({ lat: -26.2041, lon: 28.0473 });
                      setLocation({ city: "Johannesburg", country: "South Africa" });
                    }
                  }} 
                  className="px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                >
                  {location ? "Cancel" : "Use Default Location"}
                </button>
                <button 
                  onClick={handleCitySearch} 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Search
                </button>
              </div>
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
