import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { openApiDocument } from "../openapi.js";
import { prisma } from "../config/db.js";
import { redis } from "../config/redis.js";
import { rateLimit } from "../middleware/rate-limiter.js";

describe("O5 observability & quality gates", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    const { createApp } = await import("../app.js");
    app = await createApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
    redis.disconnect();
  });

  it("liveness is always 200 without requiring deps shape of readiness", async () => {
    const res = await app.inject({ method: "GET", url: "/health/live" });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe("alive");
  });

  it("readiness reports ok when DB and Redis are up", async () => {
    const res = await app.inject({ method: "GET", url: "/health/ready" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe("ok");
    expect(body.database).toBe("up");
    expect(body.redis).toBe("up");
  });

  it("legacy /health matches readiness when healthy", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe("ok");
  });

  it("OpenAPI documents health live/ready and error envelope", () => {
    expect(openApiDocument.paths["/health/live"]).toBeTruthy();
    expect(openApiDocument.paths["/health/ready"]).toBeTruthy();
    expect(openApiDocument.components.schemas.ErrorEnvelope).toBeTruthy();
  });

  it("contract: critical public GETs match OpenAPI path inventory", async () => {
    const required = [
      "/health",
      "/health/live",
      "/health/ready",
      "/openapi.json",
      "/consultations",
      "/store/orders",
      "/forum/threads",
      "/admin/orders",
      "/admin/consultations",
    ];
    for (const path of required) {
      expect(
        openApiDocument.paths[path as keyof typeof openApiDocument.paths],
        `missing OpenAPI path ${path}`,
      ).toBeTruthy();
    }

    const health = await app.inject({ method: "GET", url: "/health/ready" });
    expect(health.statusCode).toBe(200);

    const openapi = await app.inject({ method: "GET", url: "/openapi.json" });
    expect(openapi.statusCode).toBe(200);
    expect(openapi.json().openapi).toBe("3.1.0");

    const services = await app.inject({
      method: "GET",
      url: "/consultations/services",
    });
    expect(services.statusCode).toBe(200);
    expect(Array.isArray(services.json().services)).toBe(true);

    const products = await app.inject({ method: "GET", url: "/store/products" });
    expect(products.statusCode).toBe(200);
    expect(Array.isArray(products.json().products)).toBe(true);

    const threads = await app.inject({ method: "GET", url: "/forum/threads" });
    expect(threads.statusCode).toBe(200);
    expect(Array.isArray(threads.json().threads)).toBe(true);

    const unauthorized = await app.inject({
      method: "GET",
      url: "/admin/overview",
    });
    expect(unauthorized.statusCode).toBe(401);
    const err = unauthorized.json();
    expect(err.error).toBeTruthy();
    expect(err.message).toBeTruthy();
    expect(err.requestId).toBeTruthy();
  });

  it("rate limiter returns 429 envelope after exceeding limit", async () => {
    const key = `o5-rl-${Date.now()}`;
    const guard = rateLimit({
      keyPrefix: key,
      limit: 2,
      windowSeconds: 60,
    });

    const run = async () => {
      const headers: Record<string, string> = {};
      let statusCode = 200;
      let body: unknown;
      const reply = {
        header(k: string, v: string) {
          headers[k] = v;
          return reply;
        },
        status(code: number) {
          statusCode = code;
          return reply;
        },
        send(payload: unknown) {
          body = payload;
          return reply;
        },
      };
      const request = {
        id: "req-o5-rate",
        ip: "127.0.0.1",
        auth: undefined,
        headers: {},
        log: { warn: () => undefined },
      };
      await guard(request as never, reply as never);
      return { statusCode, body, headers };
    };

    expect((await run()).statusCode).toBe(200);
    expect((await run()).statusCode).toBe(200);
    const blocked = await run();
    expect(blocked.statusCode).toBe(429);
    expect((blocked.body as { error: string }).error).toBe("RateLimitExceeded");
    expect((blocked.body as { requestId: string }).requestId).toBe("req-o5-rate");
    expect((blocked.body as { code: string }).code).toBe("rate_limited");
  });
});
