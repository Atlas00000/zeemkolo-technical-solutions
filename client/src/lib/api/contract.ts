/**
 * OpenAPI-backed API helpers (O7.2).
 * Runtime calls still go through `api-client.ts`; this module exports path/type contracts
 * generated from `docs/api/openapi.json` so UI forms can hug the published schema.
 */
import type { paths } from "@/lib/api/openapi";

export type { paths };
export type ApiPaths = keyof paths;

export type HealthLiveResponse = paths["/health/live"]["get"]["responses"][200];
export type HealthReadyResponse = paths["/health/ready"]["get"]["responses"][200];

/** Documented mutating POSTs that accept Idempotency-Key. */
export const IDEMPOTENT_POSTS = [
  "/consultations",
  "/store/orders",
] as const satisfies readonly ApiPaths[];

export type IdempotentPostPath = (typeof IDEMPOTENT_POSTS)[number];

export function isIdempotentPostPath(path: string): path is IdempotentPostPath {
  return (IDEMPOTENT_POSTS as readonly string[]).includes(path);
}

/** Paths covered by the published OpenAPI snapshot (CI-checked). */
export const OPENAPI_PATHS = Object.freeze([
  "/health/live",
  "/health/ready",
  "/health",
  "/consultations",
  "/store/orders",
  "/admin/orders",
  "/admin/consultations",
  "/forum/threads",
  "/payments/webhooks/paystack",
  "/payments/webhooks/stripe",
  "/openapi.json",
] as const);
