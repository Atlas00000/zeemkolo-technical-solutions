# Dev note — security hardening checklist

**Status:** Baseline hardening landed with admin APIs + O5 rate-limit verification. Re-audit before public traffic.

## Implemented

- Redis rate limits (fixed window):
  - `POST /auth/matric/claim` — **10 / 15 minutes** per user id (`rateLimitMatricClaim`)
  - `POST /consultations` — **20 / hour** per user id or IP (`rateLimitConsultationBook`)
  - Exceeded requests return **429** with envelope `{ error: "RateLimitExceeded", message, code: "rate_limited", requestId }` plus `Retry-After` / `X-RateLimit-*` headers
- Fastify security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`)
- Next.js client headers via `client/src/lib/security-headers.ts` + `next.config.ts`
- Clerk webhook still requires Svix signature when `CLERK_WEBHOOK_SECRET` is set
- Prisma parameterized queries for SQL safety
- CORS restricted to `CORS_ORIGIN`
- Health split: `/health/live` (liveness) vs `/health/ready` (Postgres + Redis; **503** if down)

## Tests

- Unit/integration: `server/src/utils/o5-observability.test.ts` (429 envelope)
- Legacy: `server/src/modules/admin/admin.routes.test.ts` rate limiter case

## Before launch

1. Confirm production Clerk MFA for admin accounts
2. Tighten CSP on the Next app if Clerk + analytics + Sentry domains are finalized
3. Ensure Railway/Vercel set strong `DOWNLOAD_TOKEN_SECRET` and payment webhook secrets
4. Load-test rate limits with real client IPs behind the proxy (`X-Forwarded-For` trust)
5. Confirm Sentry DSNs in prod (see `docs/runbooks/sentry.md`)

*— Phase 7 Day 26 · updated O5*
