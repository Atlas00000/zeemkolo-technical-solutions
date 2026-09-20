# Deployment guide — Railway (API + DB) + Vercel (client)

Deploy prep for the Zeemkolo monorepo. **Live DNS cutover for `zeemkolo.com` stays paused** until owner sign-off ([ADR-005](docs/adr/005-phase8-production-paused.md)). This guide gets staging/production *services* running; do not point production DNS until unlocked.

| Piece | Platform | Source |
| :--- | :--- | :--- |
| Postgres | Railway | Plugin |
| Redis | Railway | Plugin |
| Fastify API | Railway | `server/` |
| Next.js app | Vercel | `client/` |

Templates: [`server/.env.example`](server/.env.example) · [`client/.env.example`](client/.env.example) · root [`.env.example`](.env.example)

---

## 0. Prerequisites

- GitHub repo connected to Railway and Vercel
- Node 20+ / pnpm 9.15+ locally (for smoke tests)
- Clerk **production** (or staging) application
- Cloudflare R2 bucket + API tokens ([`docs/runbooks/r2-storage.md`](docs/runbooks/r2-storage.md))
- Optional: Resend, Sentry

Recommended order: **Postgres → Redis → API (Railway) → Client (Vercel) → wire CORS / Clerk / webhooks**.

---

## 1. Railway — database & cache

1. Create a Railway **project** (e.g. `zeemkolo-prod` or `zeemkolo-staging`).
2. **Add PostgreSQL**
   - New → Database → PostgreSQL
   - Note the `DATABASE_URL` variable (Railway reference form is fine).
3. **Add Redis**
   - New → Database → Redis
   - Note `REDIS_URL` / `REDIS_PRIVATE_URL` (prefer private URL when the API is on the same Railway project).

Keep plugins in the **same project** as the API so `${{Postgres.DATABASE_URL}}` style references work.

---

## 2. Railway — API (`server/`)

### 2.1 Create the service

1. New → GitHub Repo → select this monorepo.
2. Set **Root Directory** to `server`.
3. Builder: **Dockerfile** (`server/Dockerfile` + `server/railway.toml`).
4. Generate a public domain (Settings → Networking → Generate Domain), e.g. `https://zeemkolo-api-production.up.railway.app`.

### 2.2 Environment variables

In the API service → **Variables**, set at least:

| Variable | Notes |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `PORT` | Leave unset — Railway injects it |
| `DATABASE_URL` | Reference Postgres, e.g. `${{Postgres.DATABASE_URL}}` |
| `REDIS_URL` | Reference Redis private URL when available |
| `CORS_ORIGIN` | Comma-separated client origins (update after Vercel URL exists) |
| `CLERK_SECRET_KEY` | Clerk Backend API secret |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_WEBHOOK_SECRET` | From Clerk webhook endpoint (after step 4) |
| `R2_REQUIRED` | `true` (production asserts R2) |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` / `R2_ENDPOINT` / `R2_PUBLIC_URL` | Required in production |
| `DOWNLOAD_TOKEN_SECRET` | Long random secret (not the dev default) |
| `RESEND_API_KEY` / `EMAIL_FROM` / `ADMIN_EMAIL` | Optional but recommended |
| `LOG_LEVEL` | `info` (or `warn`) |
| `SENTRY_DSN` | Optional |

Full list: [`server/.env.example`](server/.env.example).

`CORS_ORIGIN` supports multiple exact origins:

```text
https://your-app.vercel.app,https://zeemkolo.com,http://localhost:3000
```

### 2.3 Build & start behaviour

- **Build:** Docker image runs `prisma generate` + `tsc`.
- **Start:** `scripts/railway-start.sh` → `prisma migrate deploy` then `node dist/index.js`.
- **Health:** Railway probes `/health/live` (see `server/railway.toml`).
- Deeper check: `GET /health` and `GET /health/ready` (DB + Redis).

### 2.4 Smoke after first deploy

```bash
curl -sS https://YOUR_API.up.railway.app/health
curl -sS https://YOUR_API.up.railway.app/health/ready
```

Expect `"status":"ok"` with `"database":"up"` and `"redis":"up"`.

### 2.5 Optional seed (empty DB only)

From a trusted machine with `DATABASE_URL` pointed at Railway Postgres:

```bash
pnpm --filter @zeemkolo/server prisma:seed
```

Do **not** run `prisma migrate reset` against production.

### 2.6 Nixpacks alternative (no Docker)

If you switch off the Dockerfile:

- Build: `pnpm install && pnpm build` (includes `prisma generate`)
- Start: `pnpm start:railway` (`migrate deploy` + `node dist/index.js`)
- Root Directory still `server`

Prefer the Dockerfile for a consistent Node 20 + Prisma layout.

---

## 3. Vercel — client (`client/`)

### 3.1 Create the project

1. [Vercel](https://vercel.com) → Add New Project → import the monorepo.
2. **Root Directory:** `client`
3. Framework: **Next.js** (see `client/vercel.json`)
4. Install / build: leave defaults (`pnpm` via root `packageManager`)
5. Enable including files outside the root directory if Vercel prompts (needed for workspace lockfile).

### 3.2 Environment variables

Set for **Production** (and Preview if you want preview→staging API):

| Variable | Notes |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Railway public API URL, **no trailing slash** |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Same Clerk instance the API verifies |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_LOG_LEVEL` | Optional (`warn` in prod) |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional |

Template: [`client/.env.example`](client/.env.example).

`NEXT_PUBLIC_*` values are baked in at **build** time — change them → redeploy.

### 3.3 Deploy & smoke

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://YOUR_APP.vercel.app/
```

Expect `200`. Open the site, sign-in modal, and a data page that hits the API (e.g. store / forum).

### 3.4 Custom domain (later)

After ADR-005 unlock: add `zeemkolo.com` / `www` in Vercel → Domains, then update Clerk allowed origins and Railway `CORS_ORIGIN`.

---

## 4. Cross-service wiring

### 4.1 CORS

Update Railway `CORS_ORIGIN` to include the Vercel URL(s), then redeploy the API (or restart).

### 4.2 Clerk

In Clerk Dashboard (production instance):

- **Paths:** sign-in `/sign-in`, sign-up `/sign-up`
- **Allowed origins / redirect URLs:** Vercel URL (+ custom domain later)
- **JWT / Backend:** keys already set on API + client
- **Webhook:** `https://YOUR_API.up.railway.app/auth/webhooks/clerk` (user events you already handle); paste signing secret into `CLERK_WEBHOOK_SECRET`

### 4.3 R2

Production API **requires** complete R2 config (`NODE_ENV=production`). Confirm uploads / public URLs with [`docs/runbooks/r2-storage.md`](docs/runbooks/r2-storage.md).

### 4.4 Migrations after schema changes

Ship migration SQL in git, deploy API — start command runs `prisma migrate deploy`. See [`docs/runbooks/prisma-migrations.md`](docs/runbooks/prisma-migrations.md).

---

## 5. Local verification before / after deploy

```bash
# Typecheck
pnpm typecheck

# API health (local or remote)
curl -sS http://localhost:5000/health
curl -sS https://YOUR_API.up.railway.app/health/ready

# Client build (needs client env)
pnpm --filter @zeemkolo/client build
```

Docker image (optional, from `server/`):

```bash
docker build -t zeemkolo-server .
```

---

## 6. Checklist

- [ ] Railway Postgres + Redis healthy
- [ ] API `/health` and `/health/ready` return ok
- [ ] Prisma migrations applied on deploy
- [ ] R2 vars set; no local-upload fallback in prod
- [ ] `DOWNLOAD_TOKEN_SECRET` rotated from the example default
- [ ] Vercel build green; `NEXT_PUBLIC_API_URL` points at Railway HTTPS
- [ ] `CORS_ORIGIN` includes the Vercel origin
- [ ] Clerk keys + webhook aligned with API URL
- [ ] Smoke: home, sign-in, one authenticated API call
- [ ] DNS/`zeemkolo.com` cutover **only** after ADR-005 sign-off

---

## 7. Rollback notes

- **Vercel:** Deployments → Promote previous production deployment.
- **Railway:** Redeploy previous successful deployment; DB migrations are forward-only — plan reverse migrations carefully (never rewrite applied SQL).
- **Secrets:** Rotate Clerk / R2 / `DOWNLOAD_TOKEN_SECRET` if leaked; never commit `.env` / `server/.env` / `client/.env.local`.

---

## Related docs

- [`AGENTS.md`](AGENTS.md) — env matrix & commands
- [`docs/runbooks/prisma-migrations.md`](docs/runbooks/prisma-migrations.md)
- [`docs/runbooks/r2-storage.md`](docs/runbooks/r2-storage.md)
- [`docs/runbooks/postgres-backup-restore.md`](docs/runbooks/postgres-backup-restore.md)
- [`docs/adr/005-phase8-production-paused.md`](docs/adr/005-phase8-production-paused.md)
