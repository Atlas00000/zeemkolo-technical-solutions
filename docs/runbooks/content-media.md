# Content media guide

Where schematics, videos, and digital assets live for Zeemble / Zeemkolo authors.

## Quick rules

| Asset type | Store as | Reference from |
| :--- | :--- | :--- |
| Public lesson schematic / static image | `client/public/schematics/...` | Lesson `schematicKey` = `/schematics/file.jpg` (or `.svg`) |
| Public marketing image | `client/public/...` | Next.js `<Image>` / `<img src="/...">` |
| Paid digital product (ebook, firmware pack) | R2 object key | Product `digitalKey` e.g. `ebooks/firmware-handbook.pdf` |
| Private / large lesson media | R2 key under `lessons/` | Lesson `videoUrl` = `r2:lessons/.../file.mov` (signed for students/admins only) |
| Hosted video (public embed) | External URL (YouTube/Vimeo/etc.) | Lesson `videoUrl` = `https://...` |

## Public schematics (LMS preview)

1. Add the file under `client/public/schematics/`.
2. Set lesson `schematicKey` to the **web path**, starting with `/`  
   Example: `/schematics/series-circuit.jpg`
3. The LMS schematic viewer loads that path from the Next.js origin.

Use public paths only for content that may appear in preview lessons or marketing.

## R2 layout after content import (C0)

Canonical URL-safe prefixes (see `docs/content-population-roadmap.md` + `scripts/c0-remap-r2-keys.mjs`):

| Prefix | Use |
| :--- | :--- |
| `marketing/banners/`, `marketing/brand/` | Public marketing (mirror to `client/public` in C2) |
| `store/{slug}/` | Product images (public catalog) |
| `store/{slug}/download/` | Private digital specs (`digitalKey`) |
| `courses/{course}/` | Private course summary sources |
| `lessons/smart-irrigation/` | Lesson bodies (private), diagrams (public-ish), A/V (private) |
| `consultations/` | API uploads |
| `schematics/` | Durable schematic copies |
| `media/` | Legacy misc |

## R2 private / paid assets

See `docs/runbooks/r2-storage.md`.

- Consultation uploads: `consultations/YYYY-MM-DD/...` (API writes these)
- Store downloads: set `digitalKey` on the product to the R2 object key
- Upload with helpers: `pnpm r2:put -- ebooks/my-file.pdf ./local.pdf`
- Lesson media mirror (optional): `pnpm r2:put -- schematics/series-circuit.jpg ./client/public/schematics/series-circuit.jpg`

Do **not** put paid ebook bytes in `client/public/`.

Public LMS preview schematics still load from the Next.js origin (`/schematics/...`). The R2 object is the durable copy for media ops / future private delivery.

## Authoring lessons (admin)

1. Open `/admin` → **LMS**.
2. Create/edit markdown body (KaTeX + fenced code supported in the player).
3. Optional: schematic key, preview flag, publish flag.
4. Unpublished lessons are **hidden** from student LMS APIs even if the course is published.
5. Unpublishing a **course** hides the whole course.

## Authoring products (admin)

1. Open `/admin` → **Store**.
2. Create product with slug, prices (NGN kobo / USD cents), stock, optional `digitalKey`.
3. Toggle **Published** so it appears on `/store`.

## Private lesson A/V (`r2:` prefix)

1. Keep `.mov` / `.m4a` on R2 (never in `client/public`).
2. Set lesson `videoUrl` to `r2:<object-key>` (example: `r2:lessons/smart-irrigation/lesson-03/video.mov`).
3. API signs the object for **ZEEMBLE_STUDENT** / **ADMIN** only — guests never receive the signed URL (even if the lesson is preview).
4. Player: `LessonVideo` uses `<video>` / `<audio>` for direct/signed media; iframe for YouTube/Vimeo.

Import helper: `node scripts/c4-import-irrigation-lessons.mjs`. Next pack: `docs/runbooks/content-authoring.md`.

## Checklist before publish

- [x] Lesson markdown renders (math/code) in the student player — Smart Irrigation L1–L8 (C4/C7)
- [x] Schematic path 200s in the browser (public) or object exists in R2 — L2–L4 diagrams under `/schematics/smart-irrigation/`
- [x] `isPublished` true on lesson **and** course — irrigation + radar overview
- [x] Digital products: object exists at `digitalKey` in the R2 bucket — both kit specs
- [x] Private A/V reachable via signed `r2:` for enrolled roles; not leaked to guests (C5)
- [ ] Marketing services match consultation service types when copy changes (owner copy pass)
