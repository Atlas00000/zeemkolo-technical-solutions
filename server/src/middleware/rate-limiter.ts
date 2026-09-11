import type { FastifyReply, FastifyRequest } from "fastify";
import { redis } from "../config/redis.js";

type RateLimitOptions = {
  /** Redis key namespace, e.g. "matric-claim" or "consultation-book" */
  keyPrefix: string;
  /** Max requests inside the window */
  limit: number;
  /** Window length in seconds */
  windowSeconds: number;
};

/**
 * Redis fixed-window rate limiter.
 * Prefer user id when authenticated; otherwise fall back to IP.
 */
export function rateLimit(options: RateLimitOptions) {
  return async function rateLimitGuard(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      if (redis.status !== "ready") {
        await redis.connect();
      }

      const identity =
        request.auth?.user.id ??
        request.ip ??
        request.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ??
        "anonymous";

      const key = `rl:${options.keyPrefix}:${identity}`;
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, options.windowSeconds);
      }

      const remaining = Math.max(0, options.limit - count);
      reply.header("X-RateLimit-Limit", String(options.limit));
      reply.header("X-RateLimit-Remaining", String(remaining));

      if (count > options.limit) {
        const ttl = await redis.ttl(key);
        reply.header("Retry-After", String(ttl > 0 ? ttl : options.windowSeconds));
        await reply.status(429).send({
          error: "RateLimitExceeded",
          message: "Too many requests. Please try again later.",
        });
      }
    } catch (error) {
      request.log.warn({ err: error }, "rate limiter degraded — allowing request");
    }
  };
}

/** Matric claim: 10 attempts / 15 minutes per user */
export const rateLimitMatricClaim = rateLimit({
  keyPrefix: "matric-claim",
  limit: 10,
  windowSeconds: 15 * 60,
});

/** Consultation booking: 20 / hour per IP or user */
export const rateLimitConsultationBook = rateLimit({
  keyPrefix: "consultation-book",
  limit: 20,
  windowSeconds: 60 * 60,
});
