import * as Sentry from "@sentry/node";
import { env } from "../config/env.js";

let initialized = false;

/** Initialize Sentry when SENTRY_DSN is set. Safe no-op otherwise. */
export function initSentry() {
  if (initialized) return;
  initialized = true;

  const dsn = env.SENTRY_DSN?.trim();
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1.0,
    sendDefaultPii: false,
  });
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (!env.SENTRY_DSN?.trim()) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}

export function isSentryEnabled() {
  return Boolean(env.SENTRY_DSN?.trim());
}
