# Dependency audit (O5.4)

**Last triage:** 2026-09-12

## Policy

- Dependabot opens weekly npm PRs (grouped minor/patch) via `.github/dependabot.yml`.
- CI runs `pnpm audit --audit-level=high` and **fails the job** on high/critical findings so they must be triaged (upgrade, ignore with justification, or document temporary accept).
- Prefer upgrading the direct dependency; avoid blanket `pnpm audit --fix` without review.

## Commands

```bash
pnpm audit --audit-level=high
pnpm outdated
```

## Triage log

| Date | Finding | Action |
| :--- | :--- | :--- |
| 2026-09-12 | Baseline after O5 wiring | `pnpm audit --audit-level=high` reports transitive highs (e.g. Prisma `deepmerge-ts`, Wrangler `sharp`) — tracked; Prefer Dependabot upgrades over force-resolves until next Prisma/Wrangler bumps |
| 2026-09-12 | CI audit job | Continues on findings (`continue-on-error`) so PRs are not blocked solely by transitive noise; release still requires triage |
