# Admin desk — manual checklist (UI-W5 Wave 4)

Unauthenticated Playwright covers the gate only. When signed in as ADMIN:

1. `/admin` shows PageHeader **Admin desk** + ActionRail sections.
2. Overview MetricStrip loads counts (users, consultations, orders, matrics).
3. Matrics / Consultations / Orders tables use lifecycle/gate badges.
4. Focus rings use `--ln-signal` (connect blue); no marketing Field motion.
5. Skip link **Skip to admin content** lands on `#admin-main`.

Env: Clerk admin user + `pnpm dev:client` + API up.
