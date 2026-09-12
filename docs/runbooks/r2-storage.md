# Runbook: Cloudflare R2 storage

Consultation attachments and digital product downloads use Cloudflare R2 when configured. Local disk + HMAC stubs remain **development/test-only** fallbacks.

## Env vars

| Variable | Required in R2 mode | Notes |
| :--- | :--- | :--- |
| `R2_ENDPOINT` | Yes | e.g. `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | Yes | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | Yes | R2 API token secret |
| `R2_BUCKET_NAME` | Yes | Default `zeemkolo-technical-solutions` |
| `R2_ACCOUNT_ID` | Optional | Documented for humans; endpoint usually embeds it |
| `R2_PUBLIC_URL` | Optional | Reserved for future public CDN URLs |
| `R2_REQUIRED` | Flag | `true` / `1` / `yes` forces R2 mode even in development |
| `UPLOAD_DIR` | Dev fallback | Local root for consultation files when R2 unset |
| `DOWNLOAD_TOKEN_SECRET` | Dev fallback | HMAC secret for stub download tokens |

Copy placeholders from `.env.example` into `server/.env` / root `.env`. Never commit secrets.

## Modes

| Mode | When | Upload | Download |
| :--- | :--- | :--- | :--- |
| **R2 optional** | `NODE_ENV` is `development` or `test`, and `R2_REQUIRED` is false | R2 if configured, else `UPLOAD_DIR` on disk | R2 signed URL (15 min) if configured, else HMAC stub `/store/downloads/file` |
| **R2 required** | `R2_REQUIRED=true` **or** `NODE_ENV=production` | R2 only — process refuses to start if incomplete | R2 only — no HMAC stub |

Startup calls `assertStorageConfig()` in `server/src/index.ts`. Incomplete R2 in required mode exits before listen.

## Object key conventions

- Consultations: `consultations/YYYY-MM-DD/{uuid}-{filename}`
- Digital products: seed/`digitalKey` values such as `ebooks/firmware-handbook.pdf`

## Verify locally (optional R2)

1. Create an R2 bucket and API token with Object Read & Write.
2. Fill `R2_*` in `.env`.
3. Restart the API.
4. Book a consultation with an attachment — response `provider` should be `"r2"`.
5. Pay a digital order (or `confirm-test`) and request a download — `provider` should be `"r2"`, URL expires in 900s.

Without R2 credentials, local uploads still work under `server/uploads/` and downloads use the HMAC stub.

## Fail-closed check

```bash
# Should refuse to start:
R2_REQUIRED=true pnpm --filter @zeemkolo/server dev
# (with empty R2_* keys)
```

## Admin

Consultation rows expose `attachmentKey` in `/admin` (O1). Orphan key cleanup is optional follow-up.

## CLI helpers (monorepo)

Wrangler **v3** is pinned at the repo root (Wrangler 4 needs Node 22; this monorepo targets Node 20+).

### Wrangler (Cloudflare account)

```bash
pnpm r2:login      # browser OAuth — once per machine
pnpm r2:buckets   # list account buckets
```

`r2:login` / `r2:buckets` go through `scripts/r2-wrangler.mjs`, which temporarily ignores `CF_API_TOKEN` so OAuth is not blocked.

### S3 helpers (uses `R2_*` from `.env` — no Wrangler login)

```bash
pnpm r2:info
pnpm r2:ls                              # default prefix consultations/
pnpm r2:ls ebooks/
pnpm r2:head -- consultations/2026-09-11/....txt
pnpm r2:get -- consultations/.../file.txt ./out.txt
pnpm r2:put -- ebooks/firmware-handbook.pdf ./local.pdf
```

Implementation: `scripts/r2.mjs` (S3 helpers) + root `wrangler` v3.
