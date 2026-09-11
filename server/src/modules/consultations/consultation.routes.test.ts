import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../config/db.js";
import { redis } from "../../config/redis.js";

describe("consultation routes (Phase 2)", () => {
  let app: FastifyInstance;
  let bookedSlot: string;

  beforeAll(async () => {
    const { createApp } = await import("../../app.js");
    app = await createApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    if (bookedSlot) {
      await prisma.consultation.deleteMany({
        where: { guestEmail: "phase2-booker@example.com" },
      });
      await redis.del(`consultation:slot:${bookedSlot}`);
    }
    await app.close();
    await prisma.$disconnect();
    redis.disconnect();
  });

  it("GET /consultations/services returns service catalog", async () => {
    const res = await app.inject({ method: "GET", url: "/consultations/services" });
    expect(res.statusCode).toBe(200);
    expect(res.json().services.length).toBeGreaterThan(0);
  });

  it("GET /consultations/slots returns available slots", async () => {
    const res = await app.inject({ method: "GET", url: "/consultations/slots?days=14" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.timezone).toBe("Africa/Lagos");
    expect(Array.isArray(body.slots)).toBe(true);
    expect(body.slots.length).toBeGreaterThan(0);
    bookedSlot = body.slots[0].startsAt;
  });

  it("POST /consultations books a slot and rejects double booking", async () => {
    expect(bookedSlot).toBeTruthy();

    const payload = {
      guestName: "Phase Two Client",
      guestEmail: "phase2-booker@example.com",
      serviceType: "Firmware Review",
      projectBrief: "Need a firmware architecture review for an STM32 product prototype.",
      slotStartsAt: bookedSlot,
      timezone: "Africa/Lagos",
    };

    const first = await app.inject({
      method: "POST",
      url: "/consultations",
      payload,
    });
    expect(first.statusCode).toBe(201);
    const created = first.json();
    expect(created.id).toBeTruthy();
    expect(created.status).toBe("CONFIRMED");
    expect(created.email).toBeTruthy();

    const second = await app.inject({
      method: "POST",
      url: "/consultations",
      payload,
    });
    expect(second.statusCode).toBe(409);
  });
});
