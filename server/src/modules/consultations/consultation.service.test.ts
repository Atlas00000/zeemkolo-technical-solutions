import { describe, expect, it } from "vitest";
import { buildConsultationIcs } from "../../utils/ics-generator.js";
import { generateCandidateSlots } from "./consultation.service.js";

describe("buildConsultationIcs", () => {
  it("emits a VCALENDAR with VEVENT and UID", () => {
    const ics = buildConsultationIcs({
      id: "test-id",
      title: "Zeemkolo Consultation — Firmware Review",
      description: "Brief line",
      startsAt: new Date("2026-10-01T10:00:00.000Z"),
      organizerEmail: "admin@zeemkolo.com",
      attendeeEmail: "client@example.com",
      timezone: "Africa/Lagos",
    });

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("UID:consultation-test-id@zeemkolo.com");
    expect(ics).toContain("ATTENDEE:mailto:client@example.com");
  });
});

describe("generateCandidateSlots", () => {
  it("returns future weekday hourly slots", () => {
    const now = new Date("2026-09-14T08:00:00.000Z"); // Monday
    const slots = generateCandidateSlots(5, now);
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.every((s) => s.getTime() > now.getTime())).toBe(true);
  });
});
