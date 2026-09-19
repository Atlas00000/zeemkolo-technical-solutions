# Logging (server, client, Docker)

Structured request logs on Fastify/Pino, thin client console logger with
`X-Request-Id` correlation, and Docker json-file rotation. Sentry stays
exception-only — see [sentry.md](./sentry.md).

## Env

| Variable | Where | Purpose |
| :--- | :--- | :--- |
| `LOG_LEVEL` | root / `server/.env` | Pino level: `fatal\|error\|warn\|info\|debug\|trace\|silent` (default `info`) |
| `NEXT_PUBLIC_LOG_LEVEL` | `client/.env.local` | Client console: `debug\|info\|warn\|error` (default `debug` in development, `warn` in production) |

## Correlate a request

1. Client `apiFetch` always sends `X-Request-Id` (generated if missing).
2. Fastify echoes the same id on the response (`exposedHeaders` + `onSend`).
3. On non-OK responses the client logs `{ path, status, requestId }` only (no tokens/bodies).
4. Server `onResponse` logs `{ reqId, method, url, statusCode, responseTime }`.

Search server logs for the `reqId` / request id to line up browser and API.

## Docker

Compose services use `json-file` logging with `max-size: 10m` and `max-file: 3`.
Postgres logs statements that take ≥ 500ms (`log_min_duration_statement=500`).

```bash
pnpm db:up
docker compose config          # validate compose
docker compose logs --tail=5 postgres
```

## Verify

1. Start API: `pnpm dev:server`
2. Smoke: `pnpm --filter @zeemkolo/server exec tsx scripts/logging-smoke.ts`
3. Unit: `pnpm --filter @zeemkolo/server exec vitest run src/utils/logging.test.ts`

## Notes

- Auth headers and cookies are redacted from Pino request serialization.
- Development uses `pino-pretty`; production/test emit JSON.
- Tests that call `createApp({ logger: false })` still disable logging.
