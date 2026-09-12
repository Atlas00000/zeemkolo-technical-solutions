# Sentry setup (O5.1)

Optional error reporting for Fastify + Next.js. When DSNs are empty, Sentry is a no-op.

## Env

| Variable | Where | Purpose |
| :--- | :--- | :--- |
| `SENTRY_DSN` | root / `server/.env` | Server (Node) SDK |
| `NEXT_PUBLIC_SENTRY_DSN` | `client/.env.local` | Browser SDK (public) |
| `SENTRY_DSN` | `client/.env.local` (optional) | Next server/edge runtime |
| `SENTRY_ENABLE_TEST_ROUTE` | server | Force `GET /debug/sentry` even without DSN (non-prod only) |

## Verify

1. Create a Sentry project (Node + Next.js / browser as needed).
2. Paste DSNs into local env files (never commit).
3. Restart API + client.
4. Server: `GET http://localhost:5000/debug/sentry` → expect 500 envelope; event appears in Sentry.
5. Client: open `http://localhost:3000/debug/sentry` → client test exception in Sentry.

## Notes

- Production never mounts `/debug/sentry` on the API (`NODE_ENV=production`).
- Sample rates: 100% traces in non-prod; 10% in production.
- Client uses `instrumentation-client.ts` + server/edge `sentry.*.config.ts` **without** `withSentryConfig` (webpack tunnel broke local `next dev`).
- Admin audit log (O1) remains the source of truth for staff mutations; Sentry covers unexpected failures.
