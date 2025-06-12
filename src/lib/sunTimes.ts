export interface SunTimes {
  sunrise: Date;
  sunset: Date;
  civilTwilightBegin: Date;
  civilTwilightEnd: Date;
  goldenHourMorningStart: Date;
  goldenHourMorningEnd: Date;
  goldenHourEveningStart: Date;
  goldenHourEveningEnd: Date;
}

export async function fetchSunTimes(lat: number, lon: number): Promise<SunTimes> {
  const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch sun times");
  const json = await res.json();
  const r = json.results;
  // convert to Date objects
  const sunrise = new Date(r.sunrise);
  const sunset = new Date(r.sunset);
  const civilTwilightBegin = new Date(r.civil_twilight_begin);
  const civilTwilightEnd = new Date(r.civil_twilight_end);

  // golden hour heuristic: 1 hour after sunrise / before sunset
  const goldenHourMorningStart = sunrise;
  const goldenHourMorningEnd = new Date(sunrise.getTime() + 60 * 60 * 1000);
  const goldenHourEveningStart = new Date(sunset.getTime() - 60 * 60 * 1000);
  const goldenHourEveningEnd = sunset;

  return {
    sunrise,
    sunset,
    civilTwilightBegin,
    civilTwilightEnd,
    goldenHourMorningStart,
    goldenHourMorningEnd,
    goldenHourEveningStart,
    goldenHourEveningEnd,
  };
}
