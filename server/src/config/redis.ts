import { Redis } from "ioredis";
import { env } from "./env.js";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export async function pingRedis(): Promise<string> {
  if (redis.status !== "ready") {
    await redis.connect();
  }
  return redis.ping();
}
