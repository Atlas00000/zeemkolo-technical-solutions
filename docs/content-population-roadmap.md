# Content population roadmap — Drive → R2 → site

**Project:** Zeemkolo Technical Solutions / Zeemble Program  
**Purpose:** Turn the imported Google Drive assets in R2 into live store, LMS, and marketing content.  
**Source bucket:** `zeemkolo-technical-solutions`  
**Import origin:** `gdrive:zeemkolo-technical-solutions` (copied 2026-09-28)  
**Related:** `docs/runbooks/r2-storage.md`, `docs/runbooks/content-media.md`, optimization **O3** (content pipeline)

---

## Locked constraints

| Item | Decision |
| :--- | :--- |
| Light theme | Unchanged (Porcelain Noir + Connect Blue) |
| Dark theme | Porcelain Noir + Vermilion Mark (locked for this track) |
| Paid bytes | Stay on R2 behind `digitalKey` / signed URLs — not in `client/public/` |
| Lesson video hosting | Prefer external URL (`videoUrl`) or private R2; do not dump large `.mov` into Next `public/` |
| Phase 8 DNS cutover | Still paused until owner sign-off |

---

## Inventory (R2 after C0)

| Prefix | Contents | Visibility | Site target |
| :--- | :--- | :--- | :--- |
| `marketing/banners/` | 3 marketing PNGs (R2) + web JPEGs in `client/public` | public | **C2 done** |
| `marketing/brand/` | Logo (R2) + web JPEG in `client/public` | public | **C2 done** |
| `store/radar-kit/` | Kit images + private spec docx | mixed | **C1 done** |
| `store/smart-irrigation-kit/` | Kit images + private spec docx | mixed | **C1 done** |
| `courses/` | Radar + Irrigation summaries | private | **C3 / C6 done** |
| `lessons/smart-irrigation/` | Lessons 1–8 sources, diagrams, A/V | mixed | **C3–C5 done** |
| `consultations/` | Existing API uploads | private | Leave alone |
| `media/` | Existing misc images | — | Audit later |
| `schematics/` | Existing LMS schematic | — | Keep / extend |

---

## Implementation phases overview

| Phase | Name | Priority | Depends on | Exit criteria |
| :--- | :--- | :--- | :--- | :--- |
| **C0** | Asset hygiene & key map | P0 | R2 import done | URL-safe keys documented; broken names fixed; inventory checklist signed |
| **C1** | Store products | P0 | C0 | Two kits live on `/store` with images + optional digital specs |
| **C2** | Marketing surfaces | P1 | C0 | Banners/logo wired on homepage (or agreed marketing pages) |
| **C3** | LMS — Smart Irrigation skeleton | P0 | C0, O3 admin LMS | Published course + lesson shells (titles/order) match Drive notes |
| **C4** | LMS — lesson bodies & diagrams | P0 | C3 | Lessons 1–8 have markdown + schematics; student player renders |
| **C5** | LMS — A/V media | P1 | C4 | Lesson videos/audio reachable via `videoUrl` or signed R2; not blocked in public |
| **C6** | Second course (Radar & Alert) | P2 | C3 patterns | Course 1 from Course Summary scaffolded the same way |
| **C7** | Publish gate & QA | P0 | C1–C5 (C6 optional) | Checklist green; seed no longer required for these assets |

---

## Phase C0 — Asset hygiene & key map

**Status: complete (2026-09-28)**

**Goal:** Make object keys operable for APIs, admin, and CDN.

| ID | Work | Done when | Status |
| :--- | :--- | :--- | :--- |
| **C0.1** | Rename/copy objects to URL-safe keys (no spaces, emoji, missing extensions) | e.g. `store/radar-kit/image-1.png` | Done |
| **C0.2** | Fix extensionless files (`Zeemble Store/Product */Image 1`, `image 1`) | Valid PNG keys with `.png` | Done (MimeType was `image/png`) |
| **C0.3** | Publish a key map table (old Drive path → new R2 key → consumer) | Canonical map in script + summary below | Done |
| **C0.4** | Decide public vs private per class | Written below | Done |

**Tooling:** `node scripts/c0-remap-r2-keys.mjs` (`--dry-run`, `--delete-old`). Full row map is exported as `KEY_MAP` in that file.

### Target prefixes (live)

| Class | R2 prefix | Visibility | Consumer |
| :--- | :--- | :--- | :--- |
| Marketing banners | `marketing/banners/` | **public** (promote to `client/public` or CDN in C2) | C2 |
| Brand / icons | `marketing/brand/` | **public** | C2 |
| Store product images | `store/{slug}/` | **public** (catalog UI) | C1 |
| Store digital specs | `store/{slug}/download/` | **private** (`digitalKey` + signed URL) | C1 |
| Course summaries | `courses/{course}/summary.docx` | **private** (authoring) | C3 / C6 |
| Lesson bodies (docx) | `lessons/smart-irrigation/lesson-NN/body.docx` | **private** (convert → DB markdown) | C4 |
| Lesson diagrams / assignments | `lessons/smart-irrigation/lesson-NN/...` | **public** (schematic / lesson assets; may mirror to `client/public/schematics`) | C4 |
| Lesson A/V | `lessons/smart-irrigation/lesson-NN/*.{mov,m4a}` | **private** (C5 signed `r2:` playback) | **C5 done** |

### Key map summary (47 objects)

| Old Drive prefix (purged) | New prefix | Count |
| :--- | :--- | :--- |
| `Banner/` | `marketing/banners/` | 3 |
| `icon and pictures/` | `marketing/brand/` | 9 |
| `Zeemble Store/Product 1/` | `store/radar-kit/` | 3 |
| `Zeemble Store/Product 2/` | `store/smart-irrigation-kit/` | 3 |
| `Course Summary/` | `courses/radar-alert/`, `courses/smart-irrigation/` | 2 |
| `Smart Irrigation -Notes/` | `lessons/smart-irrigation/` | 27 |

Legacy ops prefixes unchanged: `consultations/`, `media/`, `schematics/`.

---

## Phase C1 — Store products

**Status: complete (2026-09-28)**

**Goal:** Populate `/store` from `Zeemble Store/`.

| ID | Work | Done when | Status |
| :--- | :--- | :--- | :--- |
| **C1.1** | Product **Radar Kit** (`radar-kit`) | Visible on `/store` | Done |
| **C1.2** | Product **Smart Irrigation Kit** (`smart-irrigation-kit`) | Visible on `/store` | Done |
| **C1.3** | Attach product images | Cards/detail show kit photos | Done (`/store/.../image-1.png` in `client/public`) |
| **C1.4** | Set `digitalKey` to kit spec `.docx` | Paid download grant uses R2 key | Done (physical + `digitalKey`; order downloads list any `digitalKey`) |
| **C1.5** | Smoke: list → detail → images | API + static images 200 | Done |

**Live keys**

| Slug | `imageKey` | `digitalKey` (R2) |
| :--- | :--- | :--- |
| `radar-kit` | `/store/radar-kit/image-1.png` | `store/radar-kit/download/radar-kit-spec.docx` |
| `smart-irrigation-kit` | `/store/smart-irrigation-kit/image-1.png` | `store/smart-irrigation-kit/download/smart-irrigation-kit-spec.docx` |

---

## Phase C2 — Marketing surfaces

**Status: complete (2026-09-28)**

**Goal:** Use Drive banners + logo on the public site.

| ID | Work | Done when | Status |
| :--- | :--- | :--- | :--- |
| **C2.1** | Select hero/banner set | Owner pick recorded | Done (below) |
| **C2.2** | Promote to `client/public/marketing/` | HTTP 200 | Done (web JPEG; full-res stays in R2) |
| **C2.3** | Wire homepage fields | First viewport uses brand art | Done — hero / spotlight / CTA washes |
| **C2.4** | Logo mark in chrome | Nav/footer consistent | Done — `BrandMark` |

### C2.1 — Asset pick

| Role | Public path | Source (R2) |
| :--- | :--- | :--- |
| Logo | `/marketing/brand/logo-icon.jpg` | `marketing/brand/logo-icon.jpg` |
| Hero atmosphere | `/marketing/banners/zeemble-banner.jpg` | `marketing/banners/zeemble-banner.png` |
| Zeemble spotlight | `/marketing/banners/smart-homes-banner.jpg` | `marketing/banners/smart-homes-banner.png` |
| Consultation CTA | `/marketing/banners/banner-3.jpg` | `marketing/banners/banner-3.png` |

Constants: `client/src/design/marketing-assets.ts`.

---

## Phase C3 — LMS skeleton (Smart Irrigation)

**Status: complete (2026-09-28)**

**Goal:** Course structure in DB matching Drive notes — bodies can be stubs.

| ID | Work | Done when | Status |
| :--- | :--- | :--- | :--- |
| **C3.1** | Create course from irrigation summary | Published slug live | Done — `smart-irrigation` |
| **C3.2** | Module + lessons 1–8 shells | Course tree lists lessons | Done |
| **C3.3** | Map Drive/R2 lesson files → lesson slugs | 1:1 table below | Done |
| **C3.4** | Preview policy | Documented + seeded | Done — **Lesson 1 only** is `isPreview` |

**Course**

| Field | Value |
| :--- | :--- |
| Slug | `smart-irrigation` |
| Title | ZEEMBLE Smart Irrigation Challenge |
| Module | `smart-irrigation-challenge` |
| Summary source (R2) | `courses/smart-irrigation/summary.docx` |
| Seed | `server/prisma/seed.ts` (idempotent upsert) |

### C3.3 — Lesson slug ↔ R2 source map

| # | Lesson slug | Title | R2 body | Preview |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `smart-agriculture-intelligent-irrigation` | Smart Agriculture & Intelligent Irrigation | `lessons/smart-irrigation/lesson-01/body.docx` | **yes** |
| 2 | `fundamental-principles-of-an-electric-circuit` | Fundamental Principles of an Electric Circuit | `lessons/smart-irrigation/lesson-02/body.docx` | no |
| 3 | `introduction-to-environmental-sensors` | Introduction to Environmental Sensors | `lessons/smart-irrigation/lesson-03/body.docx` | no |
| 4 | `build-your-first-smart-system` | Build Your First Smart System | `lessons/smart-irrigation/lesson-04/body.docx` | no |
| 5 | `signal-transmission` | Signal Transmission | `lessons/smart-irrigation/lesson-05/body.docx` | no |
| 6 | `make-device-talk` | Make Device Talk | `lessons/smart-irrigation/lesson-06/body.docx` | no |
| 7 | `manual-and-automatic-control` | Manual and Automatic Control | `lessons/smart-irrigation/lesson-07/body.docx` | no |
| 8 | `remote-control` | Remote Control | `lessons/smart-irrigation/lesson-08/body.docx` | no |

Related R2 media (**C4/C5 wired**): L2 diagram + `screen-recording.mov` + `rgb-led.m4a`; L3 diagram + `video.mov` + assignment stills; L4 circuit diagram + `video.mov`.

### C3.4 — Preview policy

- **Public preview:** Lesson 1 only (`isPreview: true`) — framing / farm problem, no lab secrets.
- **Students (matric):** Lessons 2–8 published but gated by existing LMS auth rules.
- Revisit after C4 if Lesson 2 (first circuit) should also be preview.

---

## Phase C4 — LMS bodies & diagrams

**Status: complete (2026-09-28)**

**Goal:** Real lesson content students can read.

| ID | Work | Done when | Status |
| :--- | :--- | :--- | :--- |
| **C4.1** | Convert lesson `.docx` → markdown bodies (admin paste or import script) | Lessons 1–8 have `markdownBody` | Done — `scripts/c4-import-irrigation-lessons.mjs` (mammoth) |
| **C4.2** | Ingest diagrams (`Diagram.png`, circuit diagrams, assignment PNGs) | `schematicKey` or inline images work | Done — `/schematics/smart-irrigation/lesson-0{2,3,4}-*.png` (+ assignment stills) |
| **C4.3** | Beginner guide + note plan / script → course intro or downloadable extras | Linked from course or lesson 0 | Done — plain-language course `description` overview (author packs stay in R2 for authors) |
| **C4.4** | Student player QA (math/code/schematic viewer) | Manual checklist on 2 sample lessons | Done — verify script + published bodies (5k–16k chars); diagrams on L2–L4 |

**Re-import:** `node scripts/c4-import-irrigation-lessons.mjs` (idempotent overwrite of irrigation lesson bodies / media keys).

---

## Phase C5 — LMS A/V media

**Status: complete (2026-09-28)**

**Goal:** Large media playable without bloating the Next bundle.

| ID | Work | Done when | Status |
| :--- | :--- | :--- | :--- |
| **C5.1** | Inventory `.mov` / `.m4a` under Smart Irrigation notes | List with sizes | Done (below) |
| **C5.2** | Choose host: YouTube/Vimeo **or** private R2 + signed playback strategy | Decision recorded | Done — **private R2 + signed URLs** (`videoUrl` = `r2:…`) |
| **C5.3** | Upload/transcode + set lesson `videoUrl` (and audio where needed) | Lessons 2–4 media play | Done — L2–L4 `videoUrl` set; L2 audio noted in markdown (`rgb-led.m4a`) |
| **C5.4** | Confirm preview lessons do not leak private media | Auth / signed URL check | Done — `resolveLessonMediaUrl` only for student/admin; L1 has no private A/V |

### C5.1 — A/V inventory (R2)

| Key | Size (approx) | Wired as |
| :--- | ---: | :--- |
| `lessons/smart-irrigation/lesson-02/rgb-led.m4a` | 3.1 MB | Mentioned in L2 markdown (lab note) |
| `lessons/smart-irrigation/lesson-02/screen-recording.mov` | 117 MB | L2 `videoUrl` = `r2:…` |
| `lessons/smart-irrigation/lesson-03/video.mov` | 155 MB | L3 `videoUrl` |
| `lessons/smart-irrigation/lesson-04/video.mov` | 187 MB | L4 `videoUrl` |

### C5.2 — Host decision

**Private R2 + signed playback.** Objects stay under `lessons/smart-irrigation/`. API expands `r2:` keys via `createR2SignedDownloadUrl`. Client `LessonVideo` uses `<video>`/`<audio>` for signed/direct media (not iframe). YouTube/Vimeo remains available if a future lesson sets an `https://` `videoUrl`.

---

## Phase C6 — Second course (Radar & Alert)

**Status: complete (2026-09-28)** — scaffold only; full labs await lesson pack

**Goal:** Repeat C3–C4 pattern for Course 1 summary (and any future Radar assets).

| ID | Work | Done when | Status |
| :--- | :--- | :--- | :--- |
| **C6.1** | Course shell from `Course Summary/Course 1- Zeemble Smart Distance Radar & Alert System.docx` | Course listed | Done — slug `radar-alert`, published |
| **C6.2** | Lessons/modules when source packs exist (or stub “coming soon”) | Honest published state | Done — module `overview` + preview lesson `course-overview` (coming soon copy) |
| **C6.3** | Tie store Radar Kit ↔ course CTA where product copy allows | Cross-link on store/LMS | Done — product description → `/zeemble/courses/radar-alert`; overview links kit |

**Source:** `courses/radar-alert/summary.docx` (R2). No per-lesson Drive pack in this import — labs stay “coming soon” until a C4-style import exists.

---

## Phase C7 — Publish gate & QA

**Status: complete (2026-09-28)**

**Goal:** Content is operable without relying on seed placeholders.

| ID | Work | Done when | Status |
| :--- | :--- | :--- | :--- |
| **C7.1** | Run `docs/runbooks/content-media.md` checklist for store + LMS | All boxes checked | Done — checklist updated (owner copy pass still open for marketing↔consultation wording) |
| **C7.2** | Confirm R2 keys exist for every `digitalKey` / private media reference | `pnpm r2:ls` / `r2:head` spot checks | Done — both kit specs + L2–L4 A/V + course summaries present |
| **C7.3** | Update seed to **not** overwrite production content (upsert-safe) | Re-seed does not clobber live kits/courses | Done — irrigation update omits body/schematic/video/description; stub backfill only if `**C3**` marker present |
| **C7.4** | Short author runbook: “how we add the next Drive folder” | Linked from this doc | Done — `docs/runbooks/content-authoring.md` |

**Verify helper:** `node scripts/c47-verify.mjs` (lesson sizes, diagrams on disk, radar shell, three `r2:` videos).

---

## Dependency graph

```
C0 Asset hygiene
 ├─▶ C1 Store products ──────────────┐
 ├─▶ C2 Marketing                    │
 └─▶ C3 Irrigation skeleton          │
      └─▶ C4 Bodies & diagrams       ├─▶ C7 Publish gate
           └─▶ C5 A/V media ─────────┤
 C3 patterns ─▶ C6 Radar course ─────┘
```

**Recommended build order:** **C0 → C1 → C3 → C4 → C2 → C5 → C7** (C6 when Radar assets are ready).

---

## Status

| Phase | Status |
| :--- | :--- |
| Drive → R2 copy | **Done** (2026-09-28) |
| **C0** Asset hygiene & key map | **Done** (2026-09-28) |
| **C1** Store products | **Done** (2026-09-28) |
| **C2** Marketing surfaces | **Done** (2026-09-28) |
| **C3** LMS Smart Irrigation skeleton | **Done** (2026-09-28) |
| **C4** LMS bodies & diagrams | **Done** (2026-09-28) |
| **C5** LMS A/V media | **Done** (2026-09-28) |
| **C6** Radar & Alert scaffold | **Done** (2026-09-28) — labs pending future pack |
| **C7** Publish gate & QA | **Done** (2026-09-28) |

---

## Next

Content track **C0–C7 complete**. Follow-ups outside this gate:

1. Author full **Radar & Alert** lesson pack → C4-style import for `radar-alert`.
2. Optional: transcode `.mov` → `.mp4` for broader browser support.
3. Owner copy pass: marketing ↔ consultation service wording (`content-media` checklist).
4. Phase 8 DNS cutover still paused until owner sign-off.
