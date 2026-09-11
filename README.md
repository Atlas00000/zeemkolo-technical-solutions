# Zeemkolo Technical Solutions — Monorepo

Decoupled platform: **Next.js client** (Vercel) + **Fastify server** (Railway) + Postgres/Redis.

## Prerequisites

- Node.js 20+
- pnpm 9+ (`corepack enable && corepack prepare pnpm@9.15.0 --activate`)
- Docker Desktop (for Postgres + Redis)

## Quick start (Phase 0)

```bash
# 1. Env
cp .env.example .env

# 2. Databases
pnpm db:up
# or: docker-compose up -d postgres redis

# 3. Install
pnpm install

# 4. Dev (hybrid — recommended)
pnpm dev:server   # http://localhost:5000
pnpm dev:client   # http://localhost:3000
```

Health check: `GET http://localhost:5000/health`

## Workspace layout

| Path | Role |
|------|------|
| `client/` | Next.js 15 App Router |
| `server/` | Fastify + Prisma API |
| `docker-compose.yml` | Postgres 16 + Redis 7 (+ optional full stack profile) |

## Locked stack decisions

- API: **Fastify**
- Identity: **Clerk** (email + social OAuth); app RBAC + matric claim in Postgres/Fastify
- Storage: **Cloudflare R2** (local disk/MinIO in dev)
- QR redirects: barcodes already target `zeemkolo.com`; path placeholders until inventory/scan collection

See `roadmap.md` for phases and priorities (P0 = Phases 0–3).
