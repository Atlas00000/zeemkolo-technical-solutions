/**
 * Shared health probe helpers (O5.6).
 */
import { prisma } from "../config/db.js";
import { pingRedis } from "../config/redis.js";

export type DependencyStatus = "up" | "down";

export type ReadyPayload = {
  status: "ok" | "not_ready";
  service: "zeemkolo-server";
  database: DependencyStatus;
  redis: DependencyStatus;
  timestamp: string;
};

export async function probeDependencies(): Promise<{
  database: DependencyStatus;
  redis: DependencyStatus;
  ok: boolean;
}> {
  let database: DependencyStatus = "down";
  let redis: DependencyStatus = "down";

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

  return {
    database,
    redis,
    ok: database === "up" && redis === "up",
  };
}

export function readyPayload(
  probe: Awaited<ReturnType<typeof probeDependencies>>,
): ReadyPayload {
  return {
    status: probe.ok ? "ok" : "not_ready",
    service: "zeemkolo-server",
    database: probe.database,
    redis: probe.redis,
    timestamp: new Date().toISOString(),
  };
}
