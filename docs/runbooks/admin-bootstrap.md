# Runbook: Admin bootstrap

Promote a real Clerk account to Postgres `ADMIN` so staff can use `/admin` without seed hacks.

## Prerequisites

1. Docker Postgres is running (`pnpm db:up`).
2. Server env has valid `DATABASE_URL`, `CLERK_SECRET_KEY`, etc.
3. The person has **signed in once** on the site (Clerk webhook or first authenticated API call syncs them into `users`).

## Promote by email

```bash
pnpm --filter @zeemkolo/server exec tsx scripts/promote-admin.ts --email=staff@example.com
```

## Promote by Clerk user id

```bash
pnpm --filter @zeemkolo/server exec tsx scripts/promote-admin.ts --clerkUserId=user_2abc...
```

Find the Clerk user id in the [Clerk Dashboard](https://dashboard.clerk.com) → Users.

## Verify

1. Sign out and sign back in (so session + `/auth/me` refresh role).
2. Open `/admin` — you should see the dashboard shell, not “Forbidden”.
3. Confirm Postgres:

```sql
SELECT email, role FROM users WHERE role = 'ADMIN';
```

## MFA checklist (Clerk)

Do this for every admin account before production use:

1. In Clerk Dashboard → Users → select the admin → enable **MFA** / require second factor if your plan supports it.
2. Prefer **Authenticator app (TOTP)** or **passkeys** over SMS when available.
3. Store recovery codes offline (password manager / sealed note).
4. Document who holds admin: owner email + backup staff email.
5. After promote, confirm the same person can still sign in with MFA and reach `/admin`.

## Demote / revoke

There is no demote CLI yet. In Postgres:

```sql
UPDATE users SET role = 'GENERAL_CUSTOMER' WHERE email = 'staff@example.com';
```

Then have them refresh session. Prefer demoting from a second admin session when available.

## Security notes

- Never commit Clerk secrets or dump admin emails into the repo.
- Admin mutations write to `admin_audit_logs` (actor, action, target, timestamp).
- Do not share a single shared admin login; promote named staff users.
