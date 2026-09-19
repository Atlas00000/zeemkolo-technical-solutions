# UI Philosophy — Porcelain Noir + Connect Blue

**Phase:** Theme locked to brand connect blue (`#0905FB`) + mark red (`#DD0340`). Gold reserved for social.  
**Status:** See `APP_THEME.md`. Homepage-grade product revamp tracked as **UI-W5**.

---

## Implementation table (weekly phases + IDs)

Track ID prefix: **UI**. Slice IDs are stable; do not renumber shipped rows.

### Phase overview

| Week | Phase ID | Name | Status | Depends on | Exit criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **W1** | **UI-W1** | Foundations | **Complete** | O7 (shadcn + OpenAPI) | Tokens + primitives + shells live; `/ui` proof; global chrome obviously new |
| **W2** | **UI-W2** | Marketing surfaces | **Complete** | UI-W1 | Home + legal inherit Ledger Noir section grammar (no feature changes) |
| **W3** | **UI-W3** | Product app routes | **Complete** | UI-W1 | Consultation, store, forum, Zeemble LMS use shells/patterns |
| **W4** | **UI-W4** | Admin + polish | **Complete** | UI-W1, UI-W3 | Admin dashboard on design kit; a11y/reduced-motion pass; shadcn call-site debt reduced |
| **W5** | **UI-W5** | Homepage-grade product revamp | **Complete** | UI-W2–W4 | Product/auth/legal/admin match Ledger Field/rail/stage grammar; Playwright deep paths |

### W1 — Foundations (UI-T01 … UI-T10)

| ID | Week | Workstream | Deliverable | Acceptance | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UI-T01** | W1 | Audit | Theme/CSS/component inventory + before notes | Before tells documented | Done |
| **UI-T02** | W1 | Philosophy | `UI_PHILOSOPHY.md` (palette, type, motion, kill list, file map) | Doc locked; names match code | Done |
| **UI-T03** | W1 | Tokens | `design/tokens/*` (color, space, type, motion, elevation) | CSS vars drive shadcn + `brand.*` | Done |
| **UI-T04** | W1 | Primitives | Surface, Text, Button, Input, Badge, Icon | Exported from `design/primitives` | Done |
| **UI-T05** | W1 | Motion | PageEnter, NumberTick, StateCrossfade | Reduced-motion honored | Done |
| **UI-T06** | W1 | Shells | AppShell, PageHeader, ActionRail; SiteNav/SiteFooter | Boxed chrome replaced | Done |
| **UI-T07** | W1 | Patterns | MetricStrip, EmptyState, Skeleton* | Copy-only empty; no clip art | Done |
| **UI-T08** | W1 | Backend map | `design/map/backend-status.ts` (zone / lifecycle / gate) | Enums → visual tones | Done |
| **UI-T09** | W1 | Apply + prove | Global shell; `/ui` reference route | Every AppShell page feels different | Done |
| **UI-T10** | W1 | QA gate | Side-by-side checklist (difference, a11y, reduced-motion) | Checklist green in this doc | Done |

### W2 — Marketing surfaces

| ID | Week | Workstream | Deliverable | Acceptance | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UI-M01** | W2 | Home hero | Hero on Ledger Noir grammar (full-bleed, brand-first) | Obvious vs mist/orange hero band | **Revamped** — interactive schematic field module |
| **UI-M02** | W2 | Home sections | Services / Zeemble spotlight / testimonials / CTA | Asymmetric planes; no equal card stacks | **Home sections revamped** |
| **UI-M03** | W2 | Trust pages | Privacy / terms typography + planes | Matches shell; readable long-form | Done |

**W2 shipped:** `HeroSection`, `ServicesGrid`, `ZeembleSpotlight`, `TestimonialsSection`, `ConsultationCta`, `/privacy`, `/terms`.

### W3 — Product app routes

| ID | Week | Workstream | Deliverable | Acceptance | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UI-P01** | W3 | Consultation | Booking wizard + slots on primitives | Status badges use lifecycle tones | Done |
| **UI-P02** | W3 | Store | Catalog / product / checkout / order success | MetricStrip + EmptyState where lists empty | Done |
| **UI-P03** | W3 | Forum | Thread list / thread view / composer | Gate tones for lock/enroll | Done |
| **UI-P04** | W3 | Zeemble LMS | Course list / nav tree / lesson player | Progress + publish gates → tokens | Done |

**W3 shipped:** PageHeader on product routes; consultation wizard/slots/intake; store pages + OrderSuccessCard (AppShell on orders); forum cards/composer/enroll/reply/vote; Zeemble catalog/course/lesson + nav/progress/markdown tones.

### W4 — Admin + polish

| ID | Week | Workstream | Deliverable | Acceptance | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UI-A01** | W4 | Admin shell | Dashboard chrome on PageHeader / ActionRail | Parity with current ops; dark canvas | Done |
| **UI-A02** | W4 | Admin tables | Matrics / consultations / orders / CMS | Tone map on statuses | Done |
| **UI-A03** | W4 | Migration debt | Prefer `design/primitives` over ad-hoc `brand-*` / raw white | Hot paths migrated; no mega CSS | Done |
| **UI-A04** | W4 | Hardening | A11y pass, reduced-motion, focus rings, contrast | Checklist + smoke e2e still green | Done |

**W4 shipped:** Admin desk PageHeader + ActionRail; MetricStrip overview; lifecycle/gate badges on tables; CMS + auth/claim/sign-in surfaces on tokens; AppShell + admin skip links; `:focus-visible` signal rings.

**Stop rule:** Visual workstream complete through W4. Further section polish is optional backlog, not a gated week.

### W5 — Homepage-grade product revamp (optional backlog, shipped)

| ID | Wave | Surface | Deliverable | Status |
| :--- | :--- | :--- | :--- | :--- |
| **UI-W5-01** | 1 | Consultation + Zeemble | Booking Field/rail/stage; library catalog/course/lesson desk | **Done** |
| **UI-W5-02** | 2 | Store + Forum | Store desk + PDP/checkout/orders; forum rail/stage + thread Field | **Done** |
| **UI-W5-03** | 3 | Auth + Legal | Auth entry Field; claim enrollment; privacy/terms atmosphere | **Done** |
| **UI-W5-04** | 4 | Admin | Denser LN desk polish (no marketing Field); manual checklist | **Done** |

**W5 tests:** `e2e/w3-product.spec.ts` (deep paths), `e2e/w2-marketing.spec.ts` (legal Field), `e2e/w4-admin.spec.ts` (auth Field + admin gate). Admin signed-in: `docs/runbooks/admin-ui-checklist.md`.

---

## UI-T01 — Before audit (snapshot)

| Area | Current (pre-foundation) | Verdict |
| :--- | :--- | :--- |
| Canvas | Light mist `#e8eef2` body | Soft admin / brochure feel |
| Accent | Signal orange `#c45c26` | Terracotta-on-mist (generic brand kit) |
| Type | Fraunces + Source Sans 3 | Fine, but paired with cream/orange → AI-default adjacent |
| Chrome | Sticky blur nav, equal `max-w-6xl` columns, ink footer | Bootstrap-adjacent boxed marketing |
| Components | shadcn under `components/ui/*` + ad-hoc `brand-*` utilities | No token module; cards = default language |
| Motion | Marketing-only fade/pan/glow | No app page-enter, no metric tick, no state crossfade |
| Shell | `AppShell` = Nav + children + Footer | No PageHeader / ActionRail; admin is a separate light layout |
| Empty/loading | Plain copy or `Loading…` text | No skeleton grammar |
| Backend hug | OpenAPI types exist; colors hardcoded | Status enums not mapped to visual tokens |

**Obvious “before” tells:** light gray page, orange CTAs, serif display on mist, rounded card stacks.

---

## North star

An **executive trading-OS** surface for Zeemkolo / Zeemble: dark ledger canvas, lifted planes, hairline structure, asymmetric density, teal used only for **signal / state / CTA**. Motion explains state. Frontend tokens track backend enums — never invent UI statuses the API does not own.

---

## Feel adjectives

Precise · Dense-but-breathable · Instrument-grade · Asymmetric · Calm authority · Signal-forward · Non-decorative

---

## Kill list (do not ship)

- Equal card grids as the default layout language  
- Purple / indigo AI gradients, crypto neon, glow spam  
- Warm cream + terracotta + serif “premium SaaS” cliché (the prior kit)  
- Clip art, stock illustration, emoji empty states  
- Motion that entertains instead of explaining  
- One mega CSS file / page-local art systems  
- Feature or section-content redesigns in this phase  

---

## Palette tokens (Obsidian Graphite + Copper Signal)

**Locked.** Full light/dark tables live in [`APP_THEME.md`](./APP_THEME.md).

| Token | Light | Dark | Role |
| :--- | :--- | :--- | :--- |
| `--ln-canvas` | `#F3F1EC` | `#0B0C0E` | App void / body |
| `--ln-canvas-elevated` | `#EBE8E1` | `#111214` | Deeper chrome |
| `--ln-plane` | `#FFFFFF` | `#15171B` | Lifted content plane |
| `--ln-ink` | `#1A1C1F` | `#E8E6E1` | Primary text |
| `--ln-muted` | `#6B6F76` | `#9A9EA6` | Secondary text |
| `--ln-signal` | `#B87333` | `#D4894A` | Accent — CTA / live / allow |
| `--ln-warn` | `#A67C2A` | `#C9A227` | Caution (sparingly) |
| `--ln-halt` | `#9B3B3B` | `#C45C5C` | Destructive / blocked |

Toggle: SiteNav `ThemeToggle` · default dark · `localStorage` key `zeemkolo-theme`.

Legacy Tailwind `brand.*` aliases map into this system.

---

## Typography

| Role | Family | Notes |
| :--- | :--- | :--- |
| Display | **Syne** | Sober geometric; page titles / brand mark |
| Sans | **IBM Plex Sans** | Body, UI chrome |
| Mono / metrics | **IBM Plex Mono** | Tabular nums, codes, matric, prices |

Rules: tracking tight on display; `font-variant-numeric: tabular-nums` on metrics; never Inter/Roboto/Arial as the brand voice.

---

## Motion grammar

| Primitive | When | Behavior |
| :--- | :--- | :--- |
| `PageEnter` | Route / shell mount | Staged opacity + 8–12px rise; stagger children |
| `NumberTick` | Metric value change | Digits ease to target; mono tabular |
| `StateCrossfade` | Enum / gate flip | Crossfade + hairline flash on signal/warn/halt |

Durations: enter ~280–420ms; ticks ~200–320ms; state ~160–240ms. Easing: `cubic-bezier(0.22, 1, 0.36, 1)`.  
**Always** honor `prefers-reduced-motion: reduce` (instant opacity, no travel).

---

## Layout grammar

- Asymmetric: primary column + narrow ActionRail — not equal card stacks  
- Hairlines over heavy boxes  
- Accent only on signal/state/CTA  
- Empty = skeleton + copy; never illustration  

---

## Modular file map

```
client/src/design/
  UI_PHILOSOPHY.md          ← this file
  tokens/
    color.css
    space.css
    type.css
    motion.css
    elevation.css
    index.css
  map/
    backend-status.ts       ← API enums → visual tone
  primitives/
    Surface.tsx
    Text.tsx
    Button.tsx
    Input.tsx
    Badge.tsx
    Icon.tsx
    index.ts
  motion/
    PageEnter.tsx
    NumberTick.tsx
    StateCrossfade.tsx
    index.ts
  shells/
    PageHeader.tsx
    ActionRail.tsx
    index.ts
  patterns/
    MetricStrip.tsx
    EmptyState.tsx
    Skeleton.tsx
    index.ts

client/src/components/shell/
  AppShell.tsx              ← consumes design shells + PageEnter
  SiteNav.tsx / SiteFooter.tsx
```

Existing `components/ui/*` (shadcn) remains for compatibility; CSS variables are remapped to Obsidian Graphite + Copper. New work should prefer `design/primitives`.

---

## Backend ↔ UI mapping

| Backend concept | Source | UI tone token |
| :--- | :--- | :--- |
| **Zone** (access tier) | `Role` | `zone.public` / `zone.customer` / `zone.student` / `zone.admin` |
| **Lifecycle** | `ConsultationStatus`, `OrderStatus` | `lifecycle.pending` → warn; `confirmed`/`paid`/`fulfilled` → signal; `completed` → ink; `cancelled`/`refunded` → halt |
| **Gate** | publish flags, matric claimed, enrollment | `gate.allow` → signal; `gate.skip` → skip/faint; `gate.halt` → halt |

Implementation: `design/map/backend-status.ts` exports tone helpers used by Badge / MetricStrip / StateCrossfade.

---

## Out of scope (later workstreams)

- Optional residual shadcn call-site polish beyond hot paths  
- New product features  
- Illustration system  
- Production Phase 8 cutover  

---

## UI-T10 — Acceptance checklist

- [x] Dark canvas + teal signal visible in &lt;2s vs old mist/orange  
- [x] AppShell chrome (nav/footer/page frame) clearly new on all AppShell routes  
- [x] Foundation demo route renders primitives + backend tone map (`/ui`)  
- [x] Token names in this doc match CSS / TS exports  
- [x] Focus rings visible; contrast adequate on planes  
- [x] `prefers-reduced-motion` disables travel animations  
- [x] No emojis / clip art / section layout rewrites in this PR  

---

## Reference

System name: **Obsidian Graphite + Copper Signal**  
Owner track: post-O7 visual foundations; dual-theme locked in `APP_THEME.md`.
