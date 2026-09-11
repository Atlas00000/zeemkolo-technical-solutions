# Dev note — Phase 7 security hardening checklist

**Status:** Baseline hardening landed with admin APIs. Re-audit before public traffic.

## Implemented

- Redis rate limits on `POST /auth/matric/claim` (10 / 15m) and `POST /consultations` (20 / hour)
- Fastify security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`)
- Next.js client headers via `client/src/lib/security-headers.ts` + `next.config.ts`
- Clerk webhook still requires Svix signature when `CLERK_WEBHOOK_SECRET` is set
- Prisma parameterized queries for SQL safety
- CORS restricted to `CORS_ORIGIN`

## Before launch

1. Confirm production Clerk MFA for admin accounts
2. Tighten CSP on the Next app if Clerk + analytics domains are finalized
3. Ensure Railway/Vercel set strong `DOWNLOAD_TOKEN_SECRET` and payment webhook secrets
4. Load-test rate limits with real client IPs behind the proxy (`X-Forwarded-For` trust)

*— Phase 7 Day 26*
