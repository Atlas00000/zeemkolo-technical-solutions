# ADR-002: Fastify for the API

- **Status:** Accepted
- **Date:** 2026-09-11

## Context

The backend must be a typed, modular HTTP API with clear middleware (auth, RBAC, rate limits) and good performance for booking locks and webhooks.

## Decision

Use **Fastify** (TypeScript) — not Express — as the HTTP framework for `server/`.

- Modules live under `server/src/modules/*`.
- Validation via Zod at route boundaries.
- Prisma for Postgres; Redis for locks, reservations, and rate limits.

## Consequences

- Controllers register Fastify routes/plugins.
- Ecosystem choices (CORS, hooks, inject-based tests) follow Fastify patterns.
- Express-oriented middleware examples should not be copied blindly.
