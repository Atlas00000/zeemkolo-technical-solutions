import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../config/db.js";
import { redis } from "../../config/redis.js";

describe("lms routes (Phase 3)", () => {
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

  it("GET /lms/courses returns catalog", async () => {
    const res = await app.inject({ method: "GET", url: "/lms/courses" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body.courses)).toBe(true);
    expect(body.courses.length).toBeGreaterThan(0);
  });

  it("GET /lms/courses/:slug returns course tree", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/lms/courses/embedded-systems-foundations",
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.slug).toBe("embedded-systems-foundations");
    expect(body.modules.length).toBeGreaterThan(0);
  });

  it("GET lesson as guest: preview full, gated truncated", async () => {
    const preview = await app.inject({
      method: "GET",
      url: "/lms/courses/embedded-systems-foundations/lessons/welcome-to-zeemble",
    });
    expect(preview.statusCode).toBe(200);
    expect(preview.json().gated).toBe(false);
    expect(preview.json().markdownBody).toContain("Welcome");

    const gated = await app.inject({
      method: "GET",
      url: "/lms/courses/embedded-systems-foundations/lessons/lab-safety-and-tools",
    });
    expect(gated.statusCode).toBe(200);
    expect(gated.json().gated).toBe(true);
    expect(gated.json().markdownBody).toContain("…");
  });

  it("POST /lms/progress requires auth", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/lms/progress",
      payload: { lessonId: "x", completed: true },
    });
    expect([401, 403, 404]).toContain(res.statusCode);
  });
});
