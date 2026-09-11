import type { FastifyInstance } from "fastify";

/**
 * Baseline security headers for the Fastify API.
 * Prisma parameterized queries already mitigate SQL injection; CORS is configured in app.ts.
 */
export async function registerSecurityHeaders(app: FastifyInstance) {
  app.addHook("onSend", async (_request, reply, payload) => {
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("X-Frame-Options", "DENY");
    reply.header("Referrer-Policy", "strict-origin-when-cross-origin");
    reply.header("X-XSS-Protection", "0");
    reply.header(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );
    if (!reply.getHeader("Cache-Control") && _request.url.startsWith("/admin")) {
      reply.header("Cache-Control", "no-store");
    }
    return payload;
  });
}
