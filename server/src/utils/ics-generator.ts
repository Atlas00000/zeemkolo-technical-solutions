/** Generate a minimal RFC 5545 VEVENT .ics attachment. */
export function buildConsultationIcs(input: {
  id: string;
  title: string;
  description: string;
  startsAt: Date;
  durationMinutes?: number;
  organizerEmail: string;
  attendeeEmail: string;
  timezone: string;
}): string {
  const duration = input.durationMinutes ?? 60;
  const endsAt = new Date(input.startsAt.getTime() + duration * 60_000);

  const stamp = formatIcsUtc(new Date());
  const dtStart = formatIcsUtc(input.startsAt);
  const dtEnd = formatIcsUtc(endsAt);

  const escape = (value: string) =>
    value
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Zeemkolo Technical Solutions//Consultation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:consultation-${input.id}@zeemkolo.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escape(input.title)}`,
    `DESCRIPTION:${escape(input.description)}`,
    `ORGANIZER:mailto:${input.organizerEmail}`,
    `ATTENDEE:mailto:${input.attendeeEmail}`,
    `X-WR-TIMEZONE:${input.timezone}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

function formatIcsUtc(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}
