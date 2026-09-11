import Fastify, { type FastifyServerOptions } from "fastify";
import cors from "@fastify/cors";
import { env } from "./config/env.js";
import { prisma } from "./config/db.js";
import { pingRedis } from "./config/redis.js";
import { authRoutes } from "./modules/auth/auth.controller.js";

export async function createApp(options: FastifyServerOptions = {}) {
  const app = Fastify({
    logger: true,
    ...options,
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.get("/health", async () => {
    let database: "up" | "down" = "down";
    let redis: "up" | "down" = "down";

    try {
      await prisma.$queryRaw`SELECT 1`;
      database = "up";
    } catch {
      database = "down";
    }

    try {
      const pong = await pingRedis();
      redis = pong === "PONG" ? "up" : "down";
    } catch {
      redis = "down";
    }

    const ok = database === "up" && redis === "up";

    return {
      status: ok ? "ok" : "degraded",
      service: "zeemkolo-server",
      database,
      redis,
      timestamp: new Date().toISOString(),
    };
  });

  await app.register(authRoutes);

  return app;
}
