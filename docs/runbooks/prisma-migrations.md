# Runbook: Prisma migrations

**Package:** `@zeemkolo/server`  
**Schema:** `server/prisma/schema.prisma`  
**Migrations:** `server/prisma/migrations/`

## Rules

1. **No manual schema edits** in the Postgres dashboard — always migrate.
2. Never rewrite committed migration SQL that has been applied elsewhere.
3. Prefer `migrate deploy` in CI and shared environments; use `migrate dev` only on a developer machine when creating new migrations.

## `migrate dev` (local iteration)

Creates a new migration from schema drift and applies it:

```bash
pnpm --filter @zeemkolo/server exec prisma migrate dev --name short_description
```

Use when you changed `schema.prisma` and need a new migration file.

## `migrate deploy` (CI / shared / prod-shaped)

Applies **existing** migrations only (no prompts, no new files):

```bash
pnpm --filter @zeemkolo/server exec prisma migrate deploy
```

Use in GitHub Actions and any environment that should only consume committed migrations.

## Status / generate

```bash
pnpm --filter @zeemkolo/server exec prisma migrate status
pnpm --filter @zeemkolo/server exec prisma generate
```

## Seed

```bash
pnpm --filter @zeemkolo/server prisma:seed
```

Seed is idempotent for most upserts; safe after deploy on empty DBs.

## Reset (destructive — ask first)

```bash
pnpm --filter @zeemkolo/server exec prisma migrate reset
```

Drops the database, re-applies migrations, runs seed. **Do not run without explicit operator consent.**
