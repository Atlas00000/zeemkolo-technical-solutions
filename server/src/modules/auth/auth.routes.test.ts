import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { FastifyInstance } from "fastify";
import { Role } from "@prisma/client";
import { prisma } from "../../config/db.js";

const clerkUserId = "phase1-route-user";

vi.mock("@clerk/backend", () => ({
  createClerkClient: () => ({
    users: {
      getUser: vi.fn(),
    },
  }),
  verifyToken: vi.fn(async (token: string) => {
    if (token !== "valid-test-token") {
      throw new Error("invalid");
    }
    return { sub: clerkUserId };
  }),
}));

describe("auth routes (Phase 1)", () => {
  let app: FastifyInstance;
  let userId: string;

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { clerkUserId } });
    const user = await prisma.user.create({
      data: {
        clerkUserId,
        email: "phase1-route@example.com",
        fullName: "Phase1 Route User",
        role: Role.GENERAL_CUSTOMER,
      },
    });
    userId = user.id;

    const { createApp } = await import("../../app.js");
    app = await createApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await prisma.user.deleteMany({ where: { clerkUserId } });
    await prisma.$disconnect();
  });

  it("GET /health returns ok with database and redis up", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe("ok");
    expect(body.database).toBe("up");
    expect(body.redis).toBe("up");
  });

  it("GET /auth/me without token returns 401", async () => {
    const res = await app.inject({ method: "GET", url: "/auth/me" });
    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe("Unauthorized");
  });

  it("GET /auth/me with invalid token returns 401", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { authorization: "Bearer bad-token" },
    });
    expect(res.statusCode).toBe(401);
  });

  it("GET /auth/me with valid token returns local user profile", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { authorization: "Bearer valid-test-token" },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.id).toBe(userId);
    expect(body.clerkUserId).toBe(clerkUserId);
    expect(body.role).toBe(Role.ZEEMBLE_STUDENT);
    expect(body.matric?.code).toMatch(/^ZMB-\d{4}-\d{3}$/);
  });

  it("POST /auth/matric/claim without token returns 401", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/matric/claim",
      payload: { code: "ZMB-2026-010" },
    });
    expect(res.statusCode).toBe(401);
  });

  it("POST /auth/webhooks/clerk without secret returns 503", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/webhooks/clerk",
      payload: { type: "user.created", data: { id: "x" } },
    });
    expect(res.statusCode).toBe(503);
    expect(res.json().error).toBe("WebhookNotConfigured");
  });
});
