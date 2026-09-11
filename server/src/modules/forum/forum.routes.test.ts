import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../config/db.js";
import { redis } from "../../config/redis.js";

describe("forum routes (Phase 4)", () => {
  let app: FastifyInstance;
  let seedThreadId: string | undefined;

  beforeAll(async () => {
    const { createApp } = await import("../../app.js");
    app = await createApp({ logger: false });
    await app.ready();

    const listed = await app.inject({ method: "GET", url: "/forum/threads" });
    const threads = listed.json().threads as { id: string }[];
    seedThreadId = threads[0]?.id;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
    redis.disconnect();
  });

  it("GET /forum/categories is public", async () => {
    const res = await app.inject({ method: "GET", url: "/forum/categories" });
    expect(res.statusCode).toBe(200);
    expect(res.json().categories.length).toBeGreaterThan(0);
  });

  it("GET /forum/threads is public", async () => {
    const res = await app.inject({ method: "GET", url: "/forum/threads" });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.json().threads)).toBe(true);
  });

  it("GET /forum/threads/:id returns thread detail", async () => {
    expect(seedThreadId).toBeTruthy();
    const res = await app.inject({
      method: "GET",
      url: `/forum/threads/${seedThreadId}`,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().id).toBe(seedThreadId);
    expect(res.json().title).toBeTruthy();
  });

  it("POST /forum/threads rejects unauthenticated writes", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/forum/threads",
      payload: {
        categorySlug: "general",
        title: "Should fail",
        body: "Guests cannot create threads in the forum.",
      },
    });
    expect([401, 403, 404]).toContain(res.statusCode);
  });

  it("POST /forum/votes rejects unauthenticated votes", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/forum/votes",
      payload: { threadId: seedThreadId, value: 1 },
    });
    expect([401, 403, 404]).toContain(res.statusCode);
  });

  it("POST /forum/threads/:id/replies rejects unauthenticated replies", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/forum/threads/${seedThreadId}/replies`,
      payload: { body: "Nope" },
    });
    expect([401, 403, 404]).toContain(res.statusCode);
  });
});
