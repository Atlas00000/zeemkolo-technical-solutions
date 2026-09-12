# Content media guide

Where schematics, videos, and digital assets live for Zeemble / Zeemkolo authors.

## Quick rules

| Asset type | Store as | Reference from |
| :--- | :--- | :--- |
| Public lesson schematic / static image | `client/public/schematics/...` | Lesson `schematicKey` = `/schematics/file.svg` |
| Public marketing image | `client/public/...` | Next.js `<Image>` / `<img src="/...">` |
| Paid digital product (ebook, firmware pack) | R2 object key | Product `digitalKey` e.g. `ebooks/firmware-handbook.pdf` |
| Private / large lesson media (future) | R2 key under `lessons/` or `schematics/` | Lesson `schematicKey` / `codeBundleKey` (prefer R2 once public path is insufficient) |
| Hosted video | External URL (YouTube/Vimeo/etc.) | Lesson `videoUrl` |

## Public schematics (LMS preview)

1. Add the file under `client/public/schematics/`.
2. Set lesson `schematicKey` to the **web path**, starting with `/`  
   Example: `/schematics/sample-circuit.svg`
3. The LMS schematic viewer loads that path from the Next.js origin.

Use public paths only for content that may appear in preview lessons or marketing.

## R2 private / paid assets

See `docs/runbooks/r2-storage.md`.

- Consultation uploads: `consultations/YYYY-MM-DD/...` (API writes these)
- Store downloads: set `digitalKey` on the product to the R2 object key
- Upload with helpers: `pnpm r2:put -- ebooks/my-file.pdf ./local.pdf`

Do **not** put paid ebook bytes in `client/public/`.

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

## Checklist before publish

- [ ] Lesson markdown renders (math/code) in the student player
- [ ] Schematic path 200s in the browser (public) or object exists in R2
- [ ] `isPublished` true on lesson **and** course
- [ ] Digital products: object exists at `digitalKey` in the R2 bucket
- [ ] Marketing services match consultation service types when copy changes
