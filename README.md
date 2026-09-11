# Zeemkolo Technical Solutions — Monorepo

Decoupled platform: **Next.js client** (Vercel later) + **Fastify server** (Railway later) + Postgres/Redis.

## Prerequisites

- Node.js 20+
- pnpm 9+ (`corepack enable && corepack prepare pnpm@9.15.0 --activate`)
- Docker Desktop (for Postgres + Redis)

## Quick start

```bash
# 1. Env (never commit real secrets)
cp .env.example .env
# Also set client/.env.local with NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY + NEXT_PUBLIC_API_URL
# And server/.env with CLERK_SECRET_KEY + CLERK_PUBLISHABLE_KEY (+ DATABASE_URL / REDIS_URL)

# 2. Databases
pnpm db:up

# 3. Install + schema
pnpm install
pnpm --filter @zeemkolo/server exec prisma migrate deploy
pnpm --filter @zeemkolo/server prisma:seed

# 4. Dev (hybrid — recommended)
pnpm dev:server   # http://localhost:5000
pnpm dev:client   # http://localhost:3000
```

Health check: `GET http://localhost:5000/health`

Full agent/contributor guide: **`AGENTS.md`** · **`CONTRIBUTING.md`**

## Workspace layout

| Path | Role |
|------|------|
| `client/` | Next.js 15 App Router |
| `server/` | Fastify + Prisma API |
| `docs/adr/` | Locked architecture decisions |
| `docs/runbooks/` | Backup/restore & migrations |
| `docs/1st-optimization.md` | Optimization phases O0–O7 |
| `docker-compose.yml` | Postgres 16 + Redis 7 (+ optional full stack profile) |

## Locked stack decisions

- API: **Fastify** ([ADR-002](docs/adr/002-fastify-api.md))
- Identity: **Clerk**; app RBAC + matric in Postgres ([ADR-001](docs/adr/001-clerk-identity.md), [ADR-003](docs/adr/003-auto-matric-at-signup.md))
- Payments: **placeholder** until provider selection ([ADR-004](docs/adr/004-payment-provider-placeholder.md))
- Phase 8 production cutover: **paused** ([ADR-005](docs/adr/005-phase8-production-paused.md))
- Storage: **Cloudflare R2** (local fallback until optimization O2)

See `roadmap.md` for product phases 0–8.
