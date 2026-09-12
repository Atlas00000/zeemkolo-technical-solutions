# 1st Optimization

**Project:** Zeemkolo Technical Solutions / Zeemble Program  
**Purpose:** First optimization backlog — improvements and industry best-practice work *after* Phases 0–7, without requiring Phase 8 production cutover.  
**Created:** 2026-09-11  

---

## Locked constraints (do not reopen in this track)

| Item | Decision |
| :--- | :--- |
| **Phase 8 — Production launch** | **Paused** until explicit sign-off |
| **Payments** | Keep **placeholders** (`confirm-test` / scaffold webhooks) until provider selection is final |
| **R2 object storage** | Included in this optimization track (next implementation work) |
| **Admin access + custom admin panel** | Included in this optimization track |
| **Production content** | Included in this optimization track |
| **shadcn/ui frontend revamp** | **Deferred** until backend is operationally solid; then frontend hugs the API contract |

---

## Goals

1. Make the platform safer, more operable, and closer to industry practice.  
2. Deliver a **custom admin dashboard** for routine staff work.  
3. Wire **R2**, bootstrap **real admin access**, and prepare a **content pipeline**.  
4. Publish a stable **API contract** so a later UI revamp can hug the backend.  
5. Stay **deploy-ready** without actually cutting over DNS/`zeemkolo.com` until Phase 8 sign-off.

---

## Implementation phases overview

| Phase | Name | Priority | Depends on | Exit criteria |
| :--- | :--- | :--- | :--- | :--- |
| **O0** | Baseline & governance | P0 | Phases 0–7 done | ADRs, runbooks, CI green on PR |
| **O1** | Admin access & custom dashboard | P0 | O0 | Real ADMIN Clerk user; staff can run routine ops in custom UI |
| **O2** | R2 storage cutover | P0 | O0 | Consultation uploads + digital downloads use R2 in non-prod/prod-shaped env |
| **O3** | Content pipeline | P1 | O1 (draft/publish UX optional) | Draft/publish lessons & products; seed no longer the only content path |
| **O4** | API hardening & contracts | P0 | O0 | OpenAPI published; idempotency; uniform errors; pagination on hot lists |
| **O5** | Observability & quality gates | P1 | O0–O4 (partial OK) | Sentry + CI + critical E2E smokes; audit log for admin mutations |
| **O6** | Product polish (pre-revamp) | P2 | O1–O4 | Shared shell, a11y/SEO basics, reservation semantics documented & tested |
| **O7** | Frontend revamp (shadcn) | P2 | O3–O5 backend solid | New UI hugs OpenAPI; **not** started until backend sign-off |
| **—** | Phase 8 — Production launch | P1 | Explicit sign-off | Out of scope until owner unlocks |

---

## Phase O0 — Baseline & governance

**Status: complete (2026-09-11)**

*Make the repo operable and decisions durable.*

| Day / slice | Workstream | Deliverable | Acceptance |
| :--- | :--- | :--- | :--- |
| O0.1 | Docs | `AGENTS.md` / `CONTRIBUTING.md`: how to run, env matrix, secrets policy | New contributor can boot client+server+db from docs alone |
| O0.2 | ADRs | Short ADRs: Clerk, Fastify, auto-matric, payment placeholder, Phase 8 pause | Locked decisions under `docs/adr/` |
| O0.3 | CI | GitHub Action: `pnpm` typecheck + Vitest + lint on PR | `.github/workflows/ci.yml` |
| O0.4 | Runbooks | Postgres backup/restore (`pg_dump`), migrate deploy vs migrate dev | `docs/runbooks/*`; local dump drill logged |
| O0.5 | Env | Stricter client public-env validation at build | `client/src/env.ts` fails fast if `NEXT_PUBLIC_*` missing |

---

## Phase O1 — Admin access & custom admin dashboard

**Status: complete (2026-09-11)**

*Replace “thin admin page” with a routine-ops control panel; bootstrap real staff access.*

| Day / slice | Workstream | Layer | Deliverable | Acceptance |
| :--- | :--- | :--- | :--- | :--- |
| O1.1 | Admin bootstrap | Ops / Backend | Link real Clerk user → Postgres `ADMIN`; MFA checklist for admin accounts | Signed-in staff opens `/admin` without seed hacks |
| O1.2 | Dashboard shell | Frontend | Custom admin layout: nav, role gate, overview cards (counts) | Non-admin sees forbidden; admin sees shell |
| O1.3 | Matrics ops | Full stack | Batch generate, list claimed/unclaimed, CSV export, optional revoke/reissue rules | Staff can issue a pack and export CSV |
| O1.4 | Consultations ops | Full stack | Queue list, status transitions, brief/attachment preview | Status changes persist and show in list |
| O1.5 | Orders & inventory | Full stack | Order tracking, stock/publish edits | Stock edit reflected on store catalog |
| O1.6 | Moderation hooks | Full stack | Forum lock/hide entry points (use existing `isLocked`) | Admin can lock a thread from dashboard |
| O1.7 | Audit log | Backend | Persist admin actor + action + target + timestamp | Last N admin actions visible in dashboard |

**Shipped:**
- `docs/runbooks/admin-bootstrap.md` + `server/scripts/promote-admin.ts`
- `AdminAuditLog` model + migration; mutations write audit rows
- Admin APIs: overview, audit, matric filter/revoke, forum lock, richer consultations
- Custom `/admin` shell with section nav (overview → audit)

**Routine admin activities (minimum viable dashboard):**

| Area | Actions |
| :--- | :--- |
| Overview | Counts: users, open consultations, pending orders, unclaimed matrics |
| Matrics | Generate batch, export CSV, filter claimed vs free |
| Consultations | Filter by status, update status, view brief |
| Orders | List by status, view line items / payment ref |
| Store | Edit stock, toggle published |
| Forum | Lock thread, view reports (if/when report model added) |
| Security | View recent audit events |

---

## Phase O2 — R2 storage cutover

**Status: complete (2026-09-12)**

*Replace local-disk uploads and stub downloads with Cloudflare R2.*

| Day / slice | Workstream | Deliverable | Acceptance |
| :--- | :--- | :--- | :--- |
| O2.1 | Config | R2 env wired in server; documented in `.env.example` | App starts with R2 optional in dev, required flag for “R2 mode” |
| O2.2 | Consultation uploads | `POST /consultations/upload` → R2 object key | Key stored on booking; object exists in bucket |
| O2.3 | Digital assets | Product `digitalKey` served via 15‑min signed URL | Paid order download returns R2 signed URL when configured |
| O2.4 | Fallback | Keep HMAC/local fallback only when R2 unset in development | Production-shaped env fails closed if R2 missing |
| O2.5 | Admin | Optional: list/delete orphan upload keys (basic) | Staff can see attachment key on consultation detail |

**Shipped:**
- `R2_REQUIRED` + production fail-closed via `assertStorageConfig()` at API boot
- Consultation upload PutObject when R2 configured; local `UPLOAD_DIR` only in optional mode
- Digital downloads: 15‑min R2 signed URL when configured; HMAC stub only when R2 optional
- `docs/runbooks/r2-storage.md`; admin already shows `attachmentKey` (O1)

---

## Phase O3 — Content pipeline

**Status: complete (2026-09-12)**

*Stop relying only on seed data for lessons and catalog.*

| Day / slice | Workstream | Deliverable | Acceptance |
| :--- | :--- | :--- | :--- |
| O3.1 | LMS model | Draft / published flag on lessons (and/or courses) | Unpublished lessons hidden from students |
| O3.2 | Admin CMS (basic) | Create/edit course, module, lesson markdown + schematic key | Admin can publish a new lesson without seed |
| O3.3 | Store CMS (basic) | Create/edit product fields from admin | New product appears in `/store` when published |
| O3.4 | Marketing copy | Replace placeholder testimonials/services with approved copy | Homepage reflects real Zeemkolo messaging |
| O3.5 | Media guide | Doc: where schematics/videos live (R2 keys vs `public/`) | Content authors have a written path |

**Shipped:**
- `Lesson.isPublished` + student LMS filters; seed lessons published
- Admin LMS + Store CMS sections (`/admin`); product create + richer updates
- Homepage services aligned with consultation catalog; refreshed testimonials
- `docs/runbooks/content-media.md`

---

## Phase O4 — API hardening & contracts

*Backend as system of record; frontend becomes replaceable.*

| Day / slice | Workstream | Deliverable | Acceptance |
| :--- | :--- | :--- | :--- |
| O4.1 | Error envelope | Uniform `{ error, message, code?, requestId }` | All module errors conform |
| O4.2 | Request IDs | Generate/propagate `X-Request-Id` | Appears in logs + error payloads |
| O4.3 | Idempotency | Keys on `POST /consultations`, `POST /store/orders` | Replay returns same resource, no double book/charge intent |
| O4.4 | Pagination | Cursor/limit on admin lists, forum threads, orders | Default page size enforced |
| O4.5 | OpenAPI | Generate/publish OpenAPI from Zod/Fastify schemas | `/docs` or `openapi.json` checked into CI diff |
| O4.6 | Reservation semantics | Document + test PENDING order / slot lock expiry behavior | Single written rule + tests for stock & slots |
| O4.7 | Webhook readiness | Raw-body signature path ready for future Paystack/Stripe | Documented; still placeholder providers |

---

## Phase O5 — Observability & quality gates

| Day / slice | Workstream | Deliverable | Acceptance |
| :--- | :--- | :--- | :--- |
| O5.1 | Sentry | Client + server error reporting (DSN in env) | Test error visible in Sentry project |
| O5.2 | E2E smoke | Playwright: home, consultation page, LMS preview, store catalog, admin gate | `pnpm test:e2e` (or similar) green locally/CI |
| O5.3 | Contract tests | Critical client/server flows against OpenAPI or shared fixtures | Breakages fail CI |
| O5.4 | Dependency scan | `pnpm audit` / Dependabot on schedule | High vulns triaged |
| O5.5 | Rate-limit verify | Documented limits + test for 429 on claim/book | Matches `docs/dev-notes/security-hardening.md` |
| O5.6 | Health split | Liveness vs readiness endpoints | Readiness fails if DB/Redis down |

---

## Phase O6 — Product polish (pre–shadcn)

*Improve UX without a full design-system rewrite.*

| Day / slice | Workstream | Deliverable | Acceptance |
| :--- | :--- | :--- | :--- |
| O6.1 | App shell | Shared post-auth/marketing nav; role-aware Admin link | No duplicated nav logic on every page |
| O6.2 | States | Standard loading / empty / error patterns | LMS, forum, store cover all three |
| O6.3 | A11y | Focus trap on modals; keyboard cart/admin controls | Basic axe/keyboard check passes on admin + cart |
| O6.4 | SEO | Metadata for course, thread, product pages | Unique titles/descriptions |
| O6.5 | Performance | Avoid global KaTeX where unused; cache public lists | Lesson-only CSS; sensible `revalidate` on public SSR |
| O6.6 | Trust pages | Privacy / terms stubs | Linked from footer |

---

## Phase O7 — Frontend revamp (shadcn) — gated

**Start only after backend sign-off** (O3 content path + O4 OpenAPI + O5 CI/Sentry baseline).

| Day / slice | Workstream | Deliverable | Acceptance |
| :--- | :--- | :--- | :--- |
| O7.1 | Design system | shadcn/ui + tokens aligned to Zeemkolo brand | Story-level primitives in place |
| O7.2 | Hug OpenAPI | Typed client from OpenAPI; replace ad-hoc fetch sprawl | Generated types drive forms/queries |
| O7.3 | Screen rewrite | Marketing, LMS, forum, store, admin against new kit | Visual QA + existing smoke phases still green |
| O7.4 | Admin dashboard v2 | Custom admin rebuilt on shadcn data table/patterns | Feature parity with O1 dashboard |

---

## Cross-cutting backlog (map into phases)

### Security & trust

| Improvement | Phase | Priority |
| :--- | :--- | :--- |
| Admin MFA policy (Clerk) | O1 | P0 |
| Admin audit log | O1 | P0 |
| Idempotent POSTs | O4 | P0 |
| Raw-body webhook verification prep | O4 | P1 |
| Secrets rotation notes | O0 | P1 |
| Privacy / terms | O6 | P1 |
| Dependency scanning | O5 | P1 |

### Reliability & operations

| Improvement | Phase | Priority |
| :--- | :--- | :--- |
| Structured logs + request IDs | O4 | P0 |
| Liveness vs readiness | O5 | P0 |
| Expired reservation cleanup job | O4/O5 | P1 |
| Postgres backup drill | O0 | P0 |
| CI on PR | O0 | P0 |

### API / backend

| Improvement | Phase | Priority |
| :--- | :--- | :--- |
| Uniform error envelope | O4 | P0 |
| OpenAPI contract | O4 | P0 |
| Pagination on lists | O4 | P0 |
| Soft status history (consultations/orders) | O4 | P2 |
| Feature flags | O4 | P2 |
| Forum moderation APIs | O1 | P1 |

### Frontend (pre-revamp)

| Improvement | Phase | Priority |
| :--- | :--- | :--- |
| Custom admin dashboard | O1 | P0 |
| Shared app shell | O6 | P1 |
| Loading/empty/error standards | O6 | P1 |
| A11y + SEO | O6 | P1 |
| shadcn full revamp | O7 | P2 (gated) |

### Data / product

| Improvement | Phase | Priority |
| :--- | :--- | :--- |
| R2 uploads + signed downloads | O2 | P0 |
| Lesson draft/publish | O3 | P0 |
| Stock/slot reservation semantics | O4 | P0 |
| Matric revoke/reissue rules | O1 | P1 |
| Real marketing/LMS/store content | O3 | P1 |

### Observability

| Improvement | Phase | Priority |
| :--- | :--- | :--- |
| Sentry client + server | O5 | P0 |
| Playwright critical paths | O5 | P1 |
| Lightweight product analytics | O5 | P2 |

---

## Explicitly out of scope (this document)

| Item | Reason |
| :--- | :--- |
| DNS / `zeemkolo.com` cutover | Phase 8 paused pending sign-off |
| Live Paystack/Stripe checkout | Provider still under selection; placeholders remain |
| Full shadcn rewrite before backend solid | Wait for O3–O5 sign-off |
| Large infra multi-region / K8s | Premature |

---

## Suggested sequencing (do not skip)

```
O0 Baseline
 → O1 Admin access + custom dashboard
 → O2 R2
 → O3 Content pipeline
 → O4 API hardening + OpenAPI
 → O5 Observability + CI/E2E
 → O6 Pre-revamp polish
 → [Backend sign-off]
 → O7 shadcn frontend revamp
 → [Owner sign-off]
 → Phase 8 Production launch
```

O1 and O2 can proceed **in parallel** after O0 if capacity allows.  
O4 should start as soon as O0 completes (does not need to wait for all content).

---

## Definition of done — “1st Optimization” complete

| Criterion | Met when |
| :--- | :--- |
| Staff ops | Custom admin dashboard covers matrics, consultations, orders, inventory, audit trail |
| Admin access | Real Clerk user is `ADMIN` with MFA guidance |
| Storage | R2 used for consultation uploads and digital download signing |
| Content | At least one non-seed course path and product editable via admin |
| Contract | OpenAPI published; idempotent booking/order POSTs; uniform errors |
| Quality | CI + Sentry + critical E2E smokes green |
| Payments | Still placeholder (by design) |
| Production | Still not cut over (by design) until Phase 8 sign-off |

---

## Related docs

| Doc | Topic |
| :--- | :--- |
| `roadmap.md` | Master engineering roadmap (Phases 0–8) |
| `docs/runbooks/admin-bootstrap.md` | Promote Clerk user → ADMIN + MFA checklist |
| `docs/runbooks/r2-storage.md` | R2 modes, keys, fail-closed / local fallback |
| `docs/runbooks/content-media.md` | Schematics/videos: public vs R2; authoring checklist |
| `docs/dev-notes/payments-provider-pending.md` | Payment placeholder policy |
| `docs/dev-notes/qr-redirect-inventory.md` | QR 301 map placeholders |
| `docs/dev-notes/security-hardening.md` | Rate limits & headers checklist |

---

*End of 1st Optimization plan.*
