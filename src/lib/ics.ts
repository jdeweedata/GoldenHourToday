import { SunTimes } from "./sunTimes";

export function generateICS(sunTimes: SunTimes, location: string): string {
  const now = new Date();
  const dateStamp = formatICSDate(now);
  
  // Format dates for ICS
  const morningStart = formatICSDate(sunTimes.goldenHourMorningStart);
  const morningEnd = formatICSDate(sunTimes.goldenHourMorningEnd);
  const eveningStart = formatICSDate(sunTimes.goldenHourEveningStart);
  const eveningEnd = formatICSDate(sunTimes.goldenHourEveningEnd);
  
  // Create unique ID for each event
  const morningUID = `morning-golden-hour-${morningStart.split('T')[0]}@goldenhourtoday.xyz`;
  const eveningUID = `evening-golden-hour-${eveningStart.split('T')[0]}@goldenhourtoday.xyz`;
  
  // Format date for summary
  const dateFormatted = sunTimes.sunrise.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//GoldenHourToday//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${morningUID}
DTSTAMP:${dateStamp}
DTSTART:${morningStart}
DTEND:${morningEnd}
SUMMARY:Morning Golden Hour (${dateFormatted})
DESCRIPTION:Perfect lighting for photography at ${location}. Sunrise at ${sunTimes.sunrise.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}.
LOCATION:${location}
END:VEVENT
BEGIN:VEVENT
UID:${eveningUID}
DTSTAMP:${dateStamp}
DTSTART:${eveningStart}
DTEND:${eveningEnd}
SUMMARY:Evening Golden Hour (${dateFormatted})
DESCRIPTION:Perfect lighting for photography at ${location}. Sunset at ${sunTimes.sunset.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}.
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;
}

// Format date to ICS format: 20250612T123000Z
function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}
