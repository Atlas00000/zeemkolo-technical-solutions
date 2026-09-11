# ADR-001: Clerk for identity

- **Status:** Accepted
- **Date:** 2026-09-11

## Context

The platform needs email + social sign-in, session management, and (later) admin MFA without owning password storage.

## Decision

Use **Clerk** as the identity provider (hosted sign-in/up, OAuth, session JWTs).

- Fastify verifies Clerk session JWTs (`@clerk/backend`).
- Postgres stores app users keyed by `clerkUserId`, plus **RBAC roles** and **matric** claims.
- Clerk does **not** own matric issuance or authorization rules.

## Consequences

- No custom bcrypt/JWT login for primary auth.
- Local `User` sync via first authenticated request and/or Clerk webhooks.
- Client must ship `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`; server needs `CLERK_SECRET_KEY`.
