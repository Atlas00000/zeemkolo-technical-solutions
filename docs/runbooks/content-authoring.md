# Content authoring — next Drive folder → live site

How to add another course pack the same way as Smart Irrigation (C0–C7).

## Prerequisites

- rclone remotes: `gdrive:` (Google Drive) and `r2:` (Cloudflare R2 bucket `zeemkolo-technical-solutions`)
- Local env: `DATABASE_URL`, R2 keys in `server/.env` (see `docs/runbooks/r2-storage.md`)
- Course/product shells already exist via seed **or** admin LMS / Store

## 1. Copy Drive → R2

```bash
# List source
rclone lsf "gdrive:zeemkolo-technical-solutions/<FolderName>" --dirs-only

# Copy into bucket (preserve structure or stage then remap)
rclone copy "gdrive:zeemkolo-technical-solutions/<FolderName>" "r2:zeemkolo-technical-solutions/<staging-prefix>/" --progress
```

Prefer URL-safe keys from the start. If Drive used spaces/emoji, extend `scripts/c0-remap-r2-keys.mjs` and run:

```bash
node scripts/c0-remap-r2-keys.mjs --dry-run
node scripts/c0-remap-r2-keys.mjs
```

## 2. Decide public vs private

| Class | Where it ends up | How the site references it |
| :--- | :--- | :--- |
| Product / marketing images | `client/public/...` (web JPEG/PNG) | Static path `/store/...` or `/marketing/...` |
| Lesson diagrams (preview-safe) | `client/public/schematics/...` | Lesson `schematicKey` = `/schematics/...` |
| Paid kit specs / ebooks | R2 `store/{slug}/download/...` | Product `digitalKey` |
| Lesson bodies | Convert docx → DB `markdownBody` | Admin LMS or import script |
| Lesson A/V (`.mov` / `.m4a`) | Stay on R2 under `lessons/...` | Lesson `videoUrl` = `r2:lessons/.../file.mov` |

Never put paid bytes or large `.mov` into `client/public/`.

## 3. Store products (if any)

1. Copy kit photos into `client/public/store/{slug}/`.
2. Upload private spec: `pnpm r2:put -- store/{slug}/download/spec.docx ./local.docx`
3. Seed or admin: set `imageKey`, `digitalKey`, publish.

## 4. LMS course skeleton

1. Add course + module + lesson slugs in `server/prisma/seed.ts` (idempotent upsert).
2. On **update**, only touch title / sort / publish flags — **do not** overwrite `markdownBody`, `schematicKey`, or `videoUrl` after import (C7.3).
3. Run `pnpm --filter @zeemkolo/server prisma:seed`.

## 5. Import lesson bodies

Pattern: `scripts/c4-import-irrigation-lessons.mjs`

1. Map each lesson slug → R2 `body.docx` (+ optional diagram / video keys).
2. mammoth converts docx → markdown; diagrams download into `client/public/schematics/...`.
3. Set `videoUrl` to `r2:<object-key>` for private media (API signs for students only).

```bash
node scripts/c4-import-irrigation-lessons.mjs --dry-run
node scripts/c4-import-irrigation-lessons.mjs
node scripts/c47-verify.mjs   # optional spot-check
```

For a new course, copy that script and change `COURSE_SLUG` / `LESSONS`.

## 6. A/V playback

- Students / admins: LMS resolves `r2:` → short-lived signed URL (`lms.service` + `LessonVideo`).
- Guests: private media is **not** returned even on preview lessons (C5.4).
- Prefer later YouTube/Vimeo only if you need public embeds; set `videoUrl` to `https://...` instead of `r2:`.

## 7. Publish gate

Use `docs/runbooks/content-media.md` checklist, then:

```bash
pnpm r2:ls -- store/
pnpm r2:head -- store/radar-kit/download/radar-kit-spec.docx
# Confirm schematics 200 locally: /schematics/smart-irrigation/...
```

## Related

- Roadmap: `docs/content-population-roadmap.md`
- Media rules: `docs/runbooks/content-media.md`
- R2 ops: `docs/runbooks/r2-storage.md`
