/**
 * Optional Sentry server/edge init when DSN is set (O5.1).
 * Kept lazy so Turbopack/dev is not pulled into OpenTelemetry when unused.
 */
export async function register() {
  const dsn = (
    process.env.SENTRY_DSN ||
    process.env.NEXT_PUBLIC_SENTRY_DSN ||
    ""
  ).trim();
  if (!dsn) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}
