import Fastify, { type FastifyServerOptions } from "fastify";
import cors from "@fastify/cors";
import { env } from "./config/env.js";
import { prisma } from "./config/db.js";
import { pingRedis } from "./config/redis.js";
import { authRoutes } from "./modules/auth/auth.controller.js";
import { consultationRoutes } from "./modules/consultations/consultation.controller.js";
import { lmsRoutes } from "./modules/lms/lms.controller.js";
import { forumRoutes } from "./modules/forum/forum.controller.js";
import { storeRoutes } from "./modules/store/store.controller.js";
import { adminRoutes } from "./modules/admin/admin.controller.js";
import { registerSecurityHeaders } from "./middleware/security-headers.js";

export async function createApp(options: FastifyServerOptions = {}) {
  const app = Fastify({
    logger: true,
    bodyLimit: 6 * 1024 * 1024,
    ...options,
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  await registerSecurityHeaders(app);

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
  await app.register(consultationRoutes);
  await app.register(lmsRoutes);
  await app.register(forumRoutes);
  await app.register(storeRoutes);
  await app.register(adminRoutes);

  return app;
}
