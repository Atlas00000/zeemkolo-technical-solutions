import { afterAll, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { prisma } from "../config/db.js";
import { redis } from "../config/redis.js";
import {
  beginIdempotency,
  getIdempotentResponse,
  saveIdempotentResponse,
} from "./idempotency.js";
import {
  decodeCursor,
  encodeCursor,
  parseLimit,
} from "./pagination.js";
import {
  RESERVE_TTL_SECONDS,
  createOrder,
  releaseExpiredReservation,
  sweepExpiredPendingOrders,
} from "../modules/store/store.service.js";
import { SLOT_LOCK_TTL_SECONDS } from "../modules/consultations/consultation.service.js";
import { Currency } from "@prisma/client";

describe("O4 API hardening utils", () => {
  afterAll(async () => {
    await prisma.$disconnect();
    redis.disconnect();
  });

  it("parseLimit clamps to max 100", () => {
    expect(parseLimit(undefined)).toBe(50);
    expect(parseLimit("999")).toBe(100);
    expect(parseLimit("10")).toBe(10);
  });

  it("encodes and decodes cursors", () => {
    const at = new Date("2026-09-12T00:00:00.000Z");
    const cursor = encodeCursor(at, "abc123");
    expect(decodeCursor(cursor)).toEqual({ createdAt: at, id: "abc123" });
  });

  it("idempotency claim → save → replay", async () => {
    const key = `o4-test-${Date.now()}`;
    expect(await beginIdempotency("o4-test", key)).toBe("claim");
    await saveIdempotentResponse("o4-test", key, {
      statusCode: 201,
      body: { ok: true },
    });
    expect(await beginIdempotency("o4-test", key)).toBe("replay");
    const cached = await getIdempotentResponse("o4-test", key);
    expect(cached?.body).toEqual({ ok: true });
  });

  it("GET /openapi.json and X-Request-Id on health", async () => {
    const app = await createApp({ logger: false });
    await app.ready();

    const openapi = await app.inject({ method: "GET", url: "/openapi.json" });
    expect(openapi.statusCode).toBe(200);
    expect(openapi.json().info.title).toContain("Zeemkolo");

    const health = await app.inject({
      method: "GET",
      url: "/health",
      headers: { "x-request-id": "req-o4-test-12345" },
    });
    expect(health.statusCode).toBe(200);
    expect(health.headers["x-request-id"]).toBe("req-o4-test-12345");
    await app.close();
  });

  it("releases expired PENDING reservations", async () => {
    expect(RESERVE_TTL_SECONDS).toBe(900);
    const product = await prisma.product.findFirst({
      where: { isPublished: true, stock: { gt: 0 } },
    });
    expect(product).toBeTruthy();

    const order = await createOrder({
      email: "o4-reserve@example.com",
      currency: Currency.NGN,
      paymentProvider: "stripe",
      items: [{ productId: product!.id, quantity: 1 }],
    });

    await redis.del(`store:reserve:${order.id}`);
    await prisma.order.update({
      where: { id: order.id },
      data: { createdAt: new Date(Date.now() - RESERVE_TTL_SECONDS * 1000 - 1000) },
    });

    const swept = await sweepExpiredPendingOrders(20);
    expect(swept.released).toBeGreaterThanOrEqual(1);

    const updated = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
    });
    expect(updated.status).toBe("CANCELLED");
  });

  it("releaseExpiredReservation is a no-op for non-PENDING", async () => {
    await releaseExpiredReservation("does-not-exist");
  });

  it("consultation slot lock uses 120s NX TTL", async () => {
    expect(SLOT_LOCK_TTL_SECONDS).toBe(120);
    const slotIso = new Date("2099-01-05T10:00:00.000Z").toISOString();
    const key = `consultation:slot:${slotIso}`;
    await redis.del(key);
    const first = await redis.set(key, "locking", "EX", SLOT_LOCK_TTL_SECONDS, "NX");
    const second = await redis.set(key, "locking", "EX", SLOT_LOCK_TTL_SECONDS, "NX");
    expect(first).toBe("OK");
    expect(second).toBeNull();
    const ttl = await redis.ttl(key);
    expect(ttl).toBeGreaterThan(100);
    expect(ttl).toBeLessThanOrEqual(120);
    await redis.del(key);
  });
});
