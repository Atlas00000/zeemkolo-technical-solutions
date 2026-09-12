import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../config/db.js";
import { redis } from "../../config/redis.js";
import { rateLimit } from "../../middleware/rate-limiter.js";

describe("admin routes + hardening (Phase 7)", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    const { createApp } = await import("../../app.js");
    app = await createApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
    redis.disconnect();
  });

  it("GET /admin/matrics rejects unauthenticated", async () => {
    const res = await app.inject({ method: "GET", url: "/admin/matrics" });
    expect([401, 403, 404]).toContain(res.statusCode);
  });

  it("GET /admin/overview rejects unauthenticated", async () => {
    const res = await app.inject({ method: "GET", url: "/admin/overview" });
    expect([401, 403, 404]).toContain(res.statusCode);
  });

  it("GET /admin/forum/threads rejects unauthenticated", async () => {
    const res = await app.inject({ method: "GET", url: "/admin/forum/threads" });
    expect([401, 403, 404]).toContain(res.statusCode);
  });

  it("POST /admin/matrics/batch rejects unauthenticated", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/admin/matrics/batch",
      payload: { count: 2 },
    });
    expect([401, 403, 404]).toContain(res.statusCode);
  });

  it("security headers present on health", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("DENY");
    expect(res.headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });

  it("rate limiter returns 429 after exceeding limit", async () => {
    const key = `test-phase7-${Date.now()}`;
    const guard = rateLimit({
      keyPrefix: key,
      limit: 2,
      windowSeconds: 60,
    });

    const fakeReply = () => {
      const headers: Record<string, string> = {};
      let statusCode = 200;
      let body: unknown;
      const api = {
        header(k: string, v: string) {
          headers[k] = v;
          return api;
        },
        status(code: number) {
          statusCode = code;
          return api;
        },
        send(payload: unknown) {
          body = payload;
          return api;
        },
        get statusCode() {
          return statusCode;
        },
        get body() {
          return body;
        },
        get headers() {
          return headers;
        },
      };
      return api;
    };

    for (let i = 0; i < 2; i += 1) {
      const reply = fakeReply();
      await guard(
        {
          id: "req-admin-rl",
          ip: "127.0.0.1",
          auth: undefined,
          headers: {},
          log: { warn: () => undefined },
        } as never,
        reply as never,
      );
      expect(reply.statusCode).toBe(200);
    }

    const blocked = fakeReply();
    await guard(
      {
        id: "req-admin-rl",
        ip: "127.0.0.1",
        auth: undefined,
        headers: {},
        log: { warn: () => undefined },
      } as never,
      blocked as never,
    );
    expect(blocked.statusCode).toBe(429);
    expect((blocked.body as { code?: string })?.code).toBe("rate_limited");

    const keys = await redis.keys(`rl:${key}:*`);
    if (keys.length) await redis.del(...keys);
  });
});
