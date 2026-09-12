import { randomUUID } from "node:crypto";
import { redis } from "../config/redis.js";

const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60;

export type IdempotentRecord = {
  statusCode: number;
  body: unknown;
};

function key(scope: string, idempotencyKey: string) {
  return `idempotency:${scope}:${idempotencyKey}`;
}

export function readIdempotencyKey(
  header: string | string[] | undefined,
): string | null {
  if (!header) return null;
  const value = Array.isArray(header) ? header[0] : header;
  const trimmed = value?.trim();
  if (!trimmed || trimmed.length > 256) return null;
  return trimmed;
}

export async function getIdempotentResponse(
  scope: string,
  idempotencyKey: string,
): Promise<IdempotentRecord | null> {
  const raw = await redis.get(key(scope, idempotencyKey));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as IdempotentRecord;
  } catch {
    return null;
  }
}

export async function saveIdempotentResponse(
  scope: string,
  idempotencyKey: string,
  record: IdempotentRecord,
) {
  await redis.setex(
    key(scope, idempotencyKey),
    IDEMPOTENCY_TTL_SECONDS,
    JSON.stringify(record),
  );
}

/** Begin a claim; returns false if another request owns the key in-flight. */
export async function beginIdempotency(
  scope: string,
  idempotencyKey: string,
): Promise<"replay" | "claim" | "inflight"> {
  const existing = await getIdempotentResponse(scope, idempotencyKey);
  if (existing && existing.statusCode > 0) return "replay";

  const claimed = await redis.set(
    key(scope, idempotencyKey),
    JSON.stringify({ statusCode: 0, body: { pending: true } }),
    "EX",
    IDEMPOTENCY_TTL_SECONDS,
    "NX",
  );
  if (claimed === "OK") return "claim";

  const again = await getIdempotentResponse(scope, idempotencyKey);
  if (again && again.statusCode > 0) return "replay";
  return "inflight";
}

export function newRequestId(incoming?: string | string[]) {
  const raw = Array.isArray(incoming) ? incoming[0] : incoming;
  const trimmed = raw?.trim();
  if (trimmed && /^[\w-]{8,128}$/.test(trimmed)) return trimmed;
  return randomUUID();
}
