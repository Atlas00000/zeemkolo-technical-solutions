# AGENTS.md — Zeemkolo monorepo guide for humans & coding agents

This repository is **Zeemkolo Technical Solutions** + **Zeemble Program**: a decoupled monorepo (`client` + `server`).

## Quick boot (acceptance: cold start)

```bash
# Prerequisites: Node 20+, pnpm 9.15+, Docker Desktop
cp .env.example .env
# Fill Clerk keys (and optional Resend/R2) into `.env`, `server/.env`, and `client/.env.local`
# Never commit those files.

pnpm install
pnpm db:up
pnpm --filter @zeemkolo/server exec prisma migrate deploy
pnpm --filter @zeemkolo/server exec prisma db seed

pnpm dev:server   # http://localhost:5000  — GET /health
pnpm dev:client   # http://localhost:3000
```

On this Windows machine, `docker-compose` (hyphen) is used if `docker compose` is unavailable.

## Workspace map

| Path | Role |
| :--- | :--- |
| `client/` | Next.js 15 App Router + Clerk UI |
| `server/` | Fastify + Prisma API |
| `docs/` | Roadmap companions, ADRs, runbooks, optimization plans |
| `docs/api/openapi.json` | Published OpenAPI 3.1 snapshot (O4) |
| `roadmap.md` | Master phases 0–8 |
| `docs/1st-optimization.md` | Post–Phase-7 optimization track (O0–O7) |

## Env matrix (secrets policy)

| Variable | Where | Required for local MVP | Notes |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | root / server `.env` | Yes | Matches Docker Postgres |
| `REDIS_URL` | root / server `.env` | Yes | Matches Docker Redis |
| `CLERK_SECRET_KEY` | server `.env` | Yes | Server JWT verify |
| `CLERK_PUBLISHABLE_KEY` | server `.env` | Yes | Clerk backend client |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `client/.env.local` | Yes | Validated at client build |
| `NEXT_PUBLIC_API_URL` | `client/.env.local` | Yes | Default `http://localhost:5000` |
| `CLERK_WEBHOOK_SECRET` | server | Optional | Webhook 503 if unset |
| `RESEND_API_KEY` | server | Optional | Email skipped if empty |
| `R2_*` / `R2_REQUIRED` | server | Optional in dev; required in prod / when `R2_REQUIRED=true` | See `docs/runbooks/r2-storage.md` |
| `UPLOAD_DIR` | server | Dev fallback | Local consultation uploads when R2 unset |
| `PAYSTACK_*` / `STRIPE_*` | server | Placeholder | See payments ADR |

**Secrets policy:** never commit `.env`, `server/.env`, or `client/.env.local`. Only empty placeholders belong in `.env.example`. Rotate keys if leaked.

## Commands agents should prefer

| Intent | Command |
| :--- | :--- |
| Install | `pnpm install` |
| DB up/down | `pnpm db:up` / `pnpm db:down` |
| Migrate (dev) | `pnpm --filter @zeemkolo/server exec prisma migrate dev` |
| Migrate (deploy) | `pnpm --filter @zeemkolo/server exec prisma migrate deploy` |
| Seed | `pnpm --filter @zeemkolo/server prisma:seed` |
| Typecheck server | `pnpm --filter @zeemkolo/server lint` |
| Typecheck client | `pnpm --filter @zeemkolo/client exec tsc -p tsconfig.json --noEmit` |
| Phase tests | `pnpm test:phase1` … `pnpm test:phase7` |
| Full CI-like | `pnpm typecheck` then `pnpm test:ci` (see `package.json`) |
| E2E smoke | `pnpm test:e2e` (Playwright; needs Chromium) |
| R2 helpers | `pnpm r2:info` / `r2:ls` / `r2:get` (env keys); `pnpm r2:login` / `r2:buckets` (Wrangler) |

## Locked decisions (do not reverse casually)

See `docs/adr/`:

- Fastify (not Express)
- Clerk for auth; Postgres for RBAC + matric
- Auto-assign matric at signup
- Payment provider still placeholder
- Phase 8 production cutover paused until owner sign-off

## Coding norms

- Prefer small, focused diffs; match existing module layout under `server/src/modules/*`.
- Do not run `prisma migrate reset` or force-push without explicit user consent.
- Do not commit secrets or rewrite git history.
- Backend-first: schema/API before UI when adding features.

## Related docs

- `CONTRIBUTING.md` — PR / test expectations  
- `docs/runbooks/` — backup/restore, migrations, admin bootstrap, R2 storage, content media, Sentry
- `docs/1st-optimization.md` — O0–O7 backlog  
