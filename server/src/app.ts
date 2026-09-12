import Fastify, { type FastifyServerOptions } from "fastify";
import cors from "@fastify/cors";
import { env } from "./config/env.js";
import { authRoutes } from "./modules/auth/auth.controller.js";
import { consultationRoutes } from "./modules/consultations/consultation.controller.js";
import { lmsRoutes } from "./modules/lms/lms.controller.js";
import { forumRoutes } from "./modules/forum/forum.controller.js";
import { storeRoutes } from "./modules/store/store.controller.js";
import { adminRoutes } from "./modules/admin/admin.controller.js";
import { registerSecurityHeaders } from "./middleware/security-headers.js";
import { registerErrorHandler } from "./utils/api-error.js";
import { newRequestId } from "./utils/idempotency.js";
import { openApiDocument } from "./openapi.js";
import { probeDependencies, readyPayload } from "./utils/health.js";
import {
  captureException,
  initSentry,
  isSentryEnabled,
} from "./utils/sentry.js";

declare module "fastify" {
  interface FastifyRequest {
    rawBody?: string;
  }
}

export async function createApp(options: FastifyServerOptions = {}) {
  initSentry();

  const app = Fastify({
    logger: true,
    bodyLimit: 6 * 1024 * 1024,
    requestIdHeader: "x-request-id",
    genReqId: (req) => newRequestId(req.headers["x-request-id"]),
    ...options,
  });

  // Preserve raw body string for webhook HMAC verification (O4.7).
  app.removeContentTypeParser("application/json");
  app.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    (request, body, done) => {
      const raw = typeof body === "string" ? body : body.toString("utf8");
      request.rawBody = raw;
      if (!raw) {
        done(null, {});
        return;
      }
      try {
        done(null, JSON.parse(raw));
      } catch (err) {
        done(err as Error, undefined);
      }
    },
  );

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Request-Id",
      "Idempotency-Key",
    ],
    exposedHeaders: ["X-Request-Id"],
  });

  await registerSecurityHeaders(app);
  registerErrorHandler(app);

  app.addHook("onSend", async (request, reply, payload) => {
    reply.header("X-Request-Id", String(request.id));
    return payload;
  });

  /** Liveness — process is up (no dependency checks). */
  app.get("/health/live", async () => {
    return {
      status: "alive",
      service: "zeemkolo-server",
      timestamp: new Date().toISOString(),
    };
  });

  /** Readiness — 503 if Postgres or Redis is down. */
  app.get("/health/ready", async (_request, reply) => {
    const probe = await probeDependencies();
    const body = readyPayload(probe);
    if (!probe.ok) {
      return reply.status(503).send(body);
    }
    return body;
  });

  /** Back-compat alias of readiness (status code reflects deps). */
  app.get("/health", async (_request, reply) => {
    const probe = await probeDependencies();
    const body = {
      ...readyPayload(probe),
      status: probe.ok ? "ok" : "degraded",
    };
    if (!probe.ok) {
      return reply.status(503).send(body);
    }
    return body;
  });

  app.get("/openapi.json", async (_request, reply) => {
    reply.header("Content-Type", "application/json; charset=utf-8");
    return openApiDocument;
  });

  app.get("/docs", async (_request, reply) => {
    reply.type("text/html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Zeemkolo API</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.ui = SwaggerUIBundle({ url: '/openapi.json', dom_id: '#swagger-ui' });
  </script>
</body>
</html>`);
  });

  // O5.1 — intentional test error for Sentry verification (never production).
  if (
    env.NODE_ENV !== "production" &&
    (env.SENTRY_ENABLE_TEST_ROUTE || isSentryEnabled())
  ) {
    app.get("/debug/sentry", async () => {
      const err = new Error("Zeemkolo Sentry test error (O5.1)");
      captureException(err, { route: "/debug/sentry" });
      throw err;
    });
  }

  await app.register(authRoutes);
  await app.register(consultationRoutes);
  await app.register(lmsRoutes);
  await app.register(forumRoutes);
  await app.register(storeRoutes);
  await app.register(adminRoutes);

  return app;
}
