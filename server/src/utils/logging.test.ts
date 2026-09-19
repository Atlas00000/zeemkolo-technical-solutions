import { Writable } from "node:stream";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildLoggerOptions } from "./logger.js";
import { prisma } from "../config/db.js";
import { redis } from "../config/redis.js";

describe("buildLoggerOptions", () => {
  it("returns level and no pretty transport under NODE_ENV=test", () => {
    const opts = buildLoggerOptions({
      nodeEnv: "test",
      logLevel: "info",
    });
    expect(opts).toMatchObject({
      level: "info",
      redact: {
        paths: ["req.headers.authorization", "req.headers.cookie"],
        remove: true,
      },
    });
    expect(
      typeof opts === "object" && opts !== null && "transport" in opts
        ? opts.transport
        : undefined,
    ).toBeUndefined();
  });

  it("enables pino-pretty transport in development", () => {
    const opts = buildLoggerOptions({
      nodeEnv: "development",
      logLevel: "debug",
    });
    expect(opts).toMatchObject({ level: "debug" });
    expect(
      typeof opts === "object" &&
        opts !== null &&
        "transport" in opts &&
        opts.transport &&
        typeof opts.transport === "object" &&
        "target" in opts.transport
        ? String(opts.transport.target)
        : "",
    ).toMatch(/pino-pretty/);
  });
});

describe("request id + finish logging", () => {
  let app: FastifyInstance;
  const lines: string[] = [];

  beforeAll(async () => {
    const destination = new Writable({
      write(chunk, _encoding, callback) {
        lines.push(chunk.toString());
        callback();
      },
    });

    const { createApp } = await import("../app.js");
    app = await createApp({
      logger: {
        level: "info",
        stream: destination,
      },
    });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
    redis.disconnect();
  });

  it("echoes X-Request-Id from inject header", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/health/live",
      headers: { "x-request-id": "test-log-id" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers["x-request-id"]).toBe("test-log-id");
  });

  it("emits a finish log with method and status", async () => {
    lines.length = 0;
    const res = await app.inject({
      method: "GET",
      url: "/health/live",
      headers: { "x-request-id": "finish-log-id" },
    });
    expect(res.statusCode).toBe(200);

    const joined = lines.join("");
    expect(joined).toMatch(/request completed|"msg":"request completed"/);
    expect(joined).toMatch(/"method":"GET"|method.*GET/);
    expect(joined).toMatch(/"statusCode":200|statusCode.*200/);
  });
});
