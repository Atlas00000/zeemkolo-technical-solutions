# Contributing

Thanks for helping build Zeemkolo Technical Solutions / Zeemble Program.

## Before you start

1. Read `AGENTS.md` for boot steps and the env matrix.
2. Read locked ADRs under `docs/adr/` — do not silently reverse them.
3. Copy `.env.example` → `.env` and configure Clerk keys locally (never commit secrets).

## Development workflow

1. `pnpm install && pnpm db:up`
2. Apply migrations: `pnpm --filter @zeemkolo/server exec prisma migrate deploy`
3. Seed if needed: `pnpm --filter @zeemkolo/server prisma:seed`
4. Run `pnpm dev:server` and `pnpm dev:client`

## Pull requests

- Keep PRs focused (one concern when possible).
- Update docs/ADRs if you change a locked decision (and call it out in the PR).
- CI must pass: typecheck, lint (server `tsc`), and Vitest suites that CI runs.
- Do not commit `.env`, credentials, or production secrets.
- Prefer adding/adjusting phase smoke or Vitest coverage for new API behavior.

## Local checks (mirror CI)

```bash
pnpm typecheck
pnpm test:ci
```

Phase-specific:

```bash
pnpm test:phase1   # … through test:phase7 as relevant
```

## Database changes

- Schema changes go through Prisma migrations only (no manual dashboard edits).
- Use `migrate dev` locally when iterating; use `migrate deploy` in shared/CI/prod-shaped environments.
- See `docs/runbooks/prisma-migrations.md`.

## Security

- Admin routes require Postgres role `ADMIN`.
- Rate limits apply to matric claim and consultation booking.
- Report suspected secret leaks immediately and rotate keys.
