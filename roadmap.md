# 🚀 Project: Zeemkolo Technical Solutions
## Architecture, Engineering Specifications & Decoupled Implementation Roadmap
**Official Project Name:** Zeemkolo Technical Solutions  
**Educational Wing:** Zeemble Program  
**Domain:** `zeemkolo.com`

---

## 1. Executive Summary & Architecture Overview

**Zeemkolo Technical Solutions** (`zeemkolo.com`) is an engineering product development and technical consulting firm. Its educational wing, the **Zeemble Program**, trains engineers and students in embedded systems, hardware prototyping, robotics, firmware development, and applied engineering.

This document serves as the master engineering specification and actionable blueprint for building a **strictly decoupled, enterprise-grade, role-governed platform**.

### Core Architectural Separation
To guarantee clean maintainability, prevent future refactoring debt, and support independent scaling:
* **Frontend Client (`/client`):** Next.js 15 (React 19, TypeScript, Tailwind CSS, shadcn/ui) deployed to **Vercel**, with **Clerk** for sign-in UI and session cookies.
* **Backend Server (`/server`):** Node.js / **Fastify** (TypeScript, Prisma ORM, Zod, Clerk session verification, Webhooks) deployed to **Railway**.
* **Identity Provider:** **Clerk** (email/password, social OAuth such as Google, MFA for admins). Local Postgres stores app roles and matric claims; Clerk does not own matric logic.
* **Object Storage:** **Cloudflare R2** (S3-compatible) for schematic uploads, ebooks, and firmware; local disk / MinIO emulator in development.
* **Database & Cache Services:** PostgreSQL and Redis managed via Railway in production and orchestrated via **Docker Compose** for local development.
* **Containers:** Dedicated `client/Dockerfile` and `server/Dockerfile` located strictly within their respective service roots.
* **QR / Barcode Redirects:** Physical labels already resolve to `zeemkolo.com`; after DNS cutover they hit this app. Use path-level placeholder redirects during build; collect full path inventories (scan QR photos if needed) before Day 23.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 INFRASTRUCTURE TOPOLOGY                                │
├───────────────────────────────────┬────────────────────────────────────────────────────┤
│ Vercel (Edge / Static / SSR)      │ Railway / Docker Runtime                           │
│                                   │                                                    │
│  ┌─────────────────────────────┐  │  ┌────────────────────────┐  ┌──────────────────┐  │
│  │     Client (/client)        │  │  │    Server (/server)    │  │   PostgreSQL     │  │
│  │  • Next.js 15 UI / Pages    │──┼─▶│  • REST / API Layer    │──┼─▶│   • Relational DB│  │
│  │  • Clerk session / OAuth    │  │  │  • Prisma ORM Engine   │  │   • Migrations   │  │
│  │  • TanStack Query / Fetch   │  │  │  • Clerk verify + RBAC │  │   • ACID Trans.  │  │
│  │  • Dockerfile (Local/Prod)  │  │  │  • Matric claim API    │  └──────────────────┘  │
│  └─────────────────────────────┘  │  └───────────┬────────────┘  ┌──────────────────┐  │
│                                   │              │               │     Redis        │  │
│           ┌───────────────────────┘              └──────────────▶│   • Rate Limiting│  │
│           │  Clerk (Identity SaaS)                               │   • Session Cache│  │
│           │  • Email / password                                  └──────────────────┘  │
│           │  • Social login (Google+)                                                   │
│           └─▶ Webhooks sync user → Postgres                                             │
└───────────────────────────────────┴────────────────────────────────────────────────────┘
```

---

## 2. Core Operational & Development Principles

### 2.1. Backend-First Integration ("Client Hugs Backend")
1. **Schema & Contract First:** Define database models and typed API response schemas (Zod/TypeScript) before any UI work begins.
2. **Deterministic Endpoints:** Backend routes are fully built, tested with seed data, and documented before the corresponding frontend view is built.
3. **Client "Hugs" the Contract:** Frontend forms, queries, and optimistic states directly mirror the backend validation contracts.

### 2.2. Single-File Focused Modularity (Execution Rule)
To eliminate latency spikes, timeouts, and broken context during development:
* Every UI screen is decomposed into single-responsibility, atomic component files (`.tsx`).
* **One File at a Time:** Build, refine, and verify a single `.tsx` or backend service module per iteration before moving to the next.
* Zero sprawling mega-files; strict separation between Data Fetchers, Presentational Components, and Form Handlers.

### 2.3. Migration-First Database Governance
* No manual database modifications via dashboards.
* All changes to PostgreSQL are declared in `server/prisma/schema.prisma` and applied via versioned, reproducible SQL migration files (`prisma migrate dev`).
* Local PostgreSQL and Redis run via root `docker-compose.yml`, matching Railway’s production environment.

### 2.4. Clerk-First Identity, App-Owned Authorization
1. **Clerk owns authentication:** Sign-up, sign-in, social OAuth, password reset, and MFA are handled by Clerk (hosted UI or embedded components).
2. **Postgres owns authorization:** App roles (`GENERAL_CUSTOMER`, `ZEEMBLE_STUDENT`, `ADMIN`) and matric claims live in Prisma models keyed by `clerkUserId`.
3. **Sync on first request / webhook:** Fastify verifies the Clerk session JWT, upserts the local `User`, then applies RBAC from Postgres (optionally mirrored to Clerk `publicMetadata.role` for client UX).
4. **No custom password hashing:** Do not implement hand-rolled JWT login or bcrypt password stores for primary auth.

---

## 3. Comprehensive Requirements & Access Control

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   ACCESS HIERARCHY                                     │
├──────────────────────┬─────────────────────────────┬───────────────────────────────────┤
│ Tier                 │ Identity / Verification      │ Privileges                        │
├──────────────────────┼─────────────────────────────┼───────────────────────────────────┤
│ 1. Public Visitor    │ Anonymous                   │ • Read marketing & services       │
│                      │                             │ • Book consultation               │
│                      │                             │ • Read preview lessons (Module 1) │
│                      │                             │ • Read public forum discussions   │
│                      │                             │ • Browse store catalog            │
├──────────────────────┼─────────────────────────────┼───────────────────────────────────┤
│ 2. General Customer  │ Clerk session (email or     │ • All Public Visitor features     │
│                      │ social OAuth e.g. Google)   │ • Purchase hardware & ebooks      │
│                      │                             │ • View order & booking history    │
│                      │                             │ • Subscribe to newsletters        │
├──────────────────────┼─────────────────────────────┼───────────────────────────────────┤
│ 3. Zeemble Student   │ Clerk session + verified    │ • All General Customer features   │
│                      │ Matric Number (e.g. ZMB-*)  │ • Full access to course library   │
│                      │ claimed via Fastify API     │ • Progress tracking & quizzes     │
│                      │                             │ • Create forum threads & replies  │
│                      │                             │ • Download code & schematics      │
├──────────────────────┼─────────────────────────────┼───────────────────────────────────┤
│ 4. Admin / Staff     │ Clerk MFA + Admin role in   │ • Content & course management     │
│                      │ Postgres / Clerk metadata   │ • Matric number batch generation  │
│                      │                             │ • Consultation slot management    │
│                      │                             │ • Order management & analytics    │
└──────────────────────┴─────────────────────────────┴───────────────────────────────────┘
```

### Auth Flow (Clerk + Matric)

```
Visitor → Clerk Sign-In (email / Google / …)
       → Fastify verifies Clerk JWT → upsert User (role: GENERAL_CUSTOMER)
       → Optional: POST /auth/matric/claim { code: "ZMB-2026-005" }
       → Atomic claim in Postgres → role: ZEEMBLE_STUDENT
       → (Optional) patch Clerk publicMetadata.role for client display
```

### Feature Breakdown

1. **Engineering Consultation Engine:** Multi-step intake with service selection, project specs, schematic file uploads (stored via **Cloudflare R2**), timezone-aware slot booking, and automated email confirmation with `.ics` calendar invites.
2. **Zeemble LMS (Library & Portal):** Course $\rightarrow$ Module $\rightarrow$ Lesson hierarchy. Renders rich Markdown notes, LaTeX equations ($\KaTeX$), interactive SVG circuit schematics (zoom/pan), syntax-highlighted code snippets with download options, video embeds, and progress tracking.
3. **Matric Number Authentication Protocol:** After Clerk sign-in, atomic database transaction verifying `matric_number` exists and is unclaimed $\rightarrow$ associates with local `user_id` / `clerkUserId` $\rightarrow$ elevates role to `ZEEMBLE_STUDENT`. Clerk never issues or validates matric codes.
4. **Engineering Community Forum:** Server-rendered public read-access for SEO; write actions (new thread, reply, vote) guarded by student/admin role verification against Postgres.
5. **Hardware Store & Digital Downloads:** Physical parts and lab kits with inventory decrement; digital ebooks/firmware protected by time-limited signed download tokens.
6. **Barcode & QR Compatibility:** Labels already target `zeemkolo.com`; DNS cutover serves the new app. Path-level 301 map for legacy Canva/page URLs; placeholders until inventory collected.

---

## 4. Repository Structure (Decoupled Monorepo)

```
cy/
├── docker-compose.yml             # Local orchestration (Postgres, Redis, optional services)
├── docker-compose.override.yml    # Developer-specific overrides
├── .env.example                   # Master environment template
├── package.json                   # Root workspace config (pnpm workspaces)
├── pnpm-workspace.yaml            # Monorepo workspace definition
│
├── server/                        # BACKEND SERVICE (Hosted on Railway)
│   ├── Dockerfile                 # Server-specific container definition
│   ├── .dockerignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma          # Relational data models & constraints
│   │   ├── migrations/            # Versioned SQL migrations
│   │   └── seed.ts                # Test data seed factories
│   └── src/
│       ├── index.ts               # Server entrypoint & route registration
│       ├── config/                # Environment, Redis & DB singletons
│       ├── middleware/            # Clerk session verify, RBAC, Rate Limiter, Error handler
│       ├── modules/               # Domain-Driven Modules
│       │   ├── auth/              # User sync, matric claim service, Clerk webhook handler
│       │   ├── consultations/     # Booking routes, slot validator, email dispatch
│       │   ├── lms/               # Course, module, lesson, progress services
│       │   ├── forum/             # Thread, category, reply controllers & services
│       │   ├── store/             # Products, orders, inventory handlers
│       │   └── payments/          # Paystack & Stripe webhook processors
│       ├── utils/                 # R2 signed URLs, ICS generator, logger
│       └── types/                 # Shared backend interfaces & Zod schemas
│
└── client/                        # FRONTEND SERVICE (Hosted on Vercel)
    ├── Dockerfile                 # Client-specific container definition
    ├── .dockerignore
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts             # Next.js config & legacy QR redirect rules
    ├── middleware.ts              # Clerk middleware (protect routes) + QR redirects
    ├── tailwind.config.ts
    ├── postcss.config.mjs
    ├── public/
    │   ├── brand/                 # Logos, favicons, branding marks
    │   ├── schematics/            # Sample public circuit vectors
    │   └── products/              # Store static images
    └── src/
        ├── app/                   # Next.js 15 App Router
        │   ├── (marketing)/       # Landing page, about, services
        │   ├── (consultation)/    # Consultation booking flow
        │   ├── (zeemble)/         # LMS tracks, course view, lesson player
        │   ├── (forum)/           # Discussion board, thread view
        │   ├── (store)/           # Store catalog, cart, checkout
        │   ├── (auth)/            # Clerk sign-in/up pages + matric claim UI
        │   ├── (admin)/           # Admin dashboard & matric manager
        │   ├── layout.tsx         # ClerkProvider wrap
        │   └── globals.css
        ├── components/            # Atomic, Single-File UI Components
        │   ├── ui/                # Base primitives (Button, Modal, Input, Badge)
        │   ├── auth/              # MatricClaimForm.tsx, UserButton wrappers
        │   ├── lms/               # CodeBlock.tsx, SchematicViewer.tsx, ProgressBar.tsx
        │   ├── forum/             # ThreadCard.tsx, ReplyForm.tsx, VoteWidget.tsx
        │   ├── store/             # ProductCard.tsx, CartDrawer.tsx, DownloadToken.tsx
        │   ├── consultation/      # CalendarSlotGrid.tsx, IntakeForm.tsx
        │   └── layout/            # Navbar.tsx, Footer.tsx, StudentNav.tsx
        ├── hooks/                 # React custom hooks (useAppUser, useCart, useProgress)
        ├── lib/                   # API client (Clerk token), TanStack Query, formatters
        └── types/                 # Frontend DTO contracts matching backend schemas
```

---

## 5. Technology Stack Summary

| Domain | Production Hosting | Local Environment | Core Technologies |
| :--- | :--- | :--- | :--- |
| **Frontend Client** | **Vercel** | `pnpm dev` or Docker (`client/Dockerfile`) | Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, **Clerk**, Lucide, KaTeX |
| **Backend API** | **Railway** | `pnpm dev` or Docker (`server/Dockerfile`) | Node.js, **Fastify**, TypeScript, Prisma ORM, Zod, **@clerk/backend**, Resend SDK |
| **Identity** | **Clerk** | Clerk Dashboard (dev instance) | Email/password, social OAuth (Google+), MFA; webhooks → user sync |
| **Database** | **Railway Postgres** | Docker (`postgres:16-alpine`) | PostgreSQL, Row-Level Security, Deterministic SQL Migrations |
| **Cache & Queue** | **Railway Redis** | Docker (`redis:7-alpine`) | Redis for slot locks, rate-limiting, and session cache |
| **Storage** | **Cloudflare R2** | Local disk / MinIO (S3-compatible emulator) | Secure signed URLs for ebooks, firmware, and intake schematics |
| **Payments** | **Paystack & Stripe** | Webhook CLI simulators | Multi-currency (NGN / USD) with webhook signature validation |

---

## 6. Docker & Local Development Setup

### 6.1. Root `docker-compose.yml` (Services Architecture)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: zeemkolo_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: zeemkolo_admin
      POSTGRES_PASSWORD: zeemkolo_secret_password
      POSTGRES_DB: zeemkolo_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: zeemkolo_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: zeemkolo_server
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: "postgresql://zeemkolo_admin:zeemkolo_secret_password@postgres:5432/zeemkolo_db?schema=public"
      REDIS_URL: "redis://redis:6379"
      PORT: 5000
    depends_on:
      - postgres
      - redis

  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: zeemkolo_client
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: "http://localhost:5000"
    depends_on:
      - server

volumes:
  postgres_data:
  redis_data:
```

### 6.2. Development Workflows
* **Option A (Full Docker):** `docker-compose up --build` launches PostgreSQL, Redis, Backend, and Frontend in unified network.
* **Option B (Hybrid Local Dev - Recommended for Fast HMR):**
  1. `docker-compose up -d postgres redis` (Run only database and cache in Docker).
  2. In `/server`: `pnpm dev` (Runs backend with instant hot-reload on port `5000`).
  3. In `/client`: `pnpm dev` (Runs Next.js with TurboPack on port `3000`).

---

## 7. Granular 4-Week / 28-Day Implementation Roadmap

> **Rule of Execution:** All work follows **Backend $\rightarrow$ Frontend**. Implement **one atomic file/component at a time** to guarantee zero timeouts and clean compilation.

### Implementation Phase & Priority Table

Priority key: **P0** = must ship first (foundation / stated business priority) · **P1** = core product · **P2** = revenue & community expansion · **P3** = polish, ops & launch

| Phase | Week | Days | Workstream | Priority | Why this priority | Exit criteria |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 0 — Foundation** | 1 | 1–3 | Monorepo, Docker (Postgres/Redis), Prisma schema, seed data, Redis client | **P0** | Nothing else runs without infra + data contracts | Containers healthy; migrations applied; seed populates matrics/courses/products |
| **Phase 1 — Identity & Access** | 1 | 4–7 | Clerk setup (email + social), user sync, matric claim API, RBAC middleware, sign-in + matric claim UI | **P0** | Gates LMS, forum, and student privileges | Clerk sign-in works; claim matric → `ZEEMBLE_STUDENT`; duplicate matric rejected |
| **Phase 2 — Consultation Engine** | 2 | 8–10 | Booking API, Redis slot lock, R2 upload, Resend + ICS, slot picker UI | **P0** | Stated top commercial priority (client booking) | Slot booked without double-book; confirmation email + `.ics` delivered |
| **Phase 3 — Zeemble LMS** | 2 | 11–14 | Course/lesson APIs, preview gating, progress tracking, Markdown/KaTeX/code/schematic player | **P0** | Stated top education priority (host lesson materials) | Students see full lessons; guests see preview only; progress persists |
| **Phase 4 — Community Forum** | 3 | 15–16 | Forum API + write guards, SSR thread UI, enrollment banner | **P1** | Supports LMS retention; not required for first paid booking or first lesson | Public read works; non-students get HTTP 403 on write |
| **Phase 5 — Store & Payments** | 3 | 17–21 | Catalog/inventory, Paystack + Stripe webhooks, R2 signed downloads, cart/checkout UI | **P2** | Revenue expansion after core booking + LMS | Paid order decrements stock; digital assets download via signed URL |
| **Phase 6 — Marketing & QR Continuity** | 4 | 22–23 | Homepage/services UI, placeholder→real QR/barcode 301 redirects | **P2** | Brand surface + protect existing print investment | Marketing live; placeholder map ready to swap with scanned QR URLs |
| **Phase 7 — Admin & Hardening** | 4 | 24–26 | Admin matric/order/consultation APIs + UI, rate limiting, security headers | **P1** | Staff needs matric generation; security before public traffic | Admin can batch-generate matrics; auth/booking endpoints rate-limited |
| **Phase 8 — Production Launch** | 4 | 27–28 | Railway + Vercel deploy, env wiring, DNS/`zeemkolo.com` cutover, QR scan verification | **P1** | Live cutover only after P0 features are stable | `zeemkolo.com` live; SSL OK; sample QR resolves via 301 |

**Build order (do not skip):** Phase 0 → 1 → 2 → 3 → then 4 / 5 in parallel if capacity allows → 6 → 7 → 8.

**MVP cut line:** Phases **0–3** deliver the minimum viable platform (auth + consultation + LMS). Phases 4–8 can slip without blocking that MVP.

---

### 📅 Week 1: Infrastructure, Database Governance & Clerk + Matric Auth
*Goal: Working PostgreSQL/Redis containers, Prisma migrations, Clerk identity (email + social), matric claim API, and sign-in / claim UI.*

| Day | Focus Area | Layer | Single-File / Module Task | Deliverable & Acceptance |
| :--- | :--- | :--- | :--- | :--- |
| **Day 1** | Workspace & Docker Infrastructure | DevOps | `docker-compose.yml`, `pnpm-workspace.yaml`, `server/Dockerfile`, `client/Dockerfile` | Postgres & Redis containers running healthy; both workspaces initialized with TypeScript configs. |
| **Day 2** | Database Models & Migrations | **Backend** | `server/prisma/schema.prisma` | Define Profiles (incl. `clerkUserId`), Matrics, Consultations, LMS, Forum, and Store models. Run `prisma migrate dev --name init`. |
| **Day 3** | Database Seed Factory & Redis Client | **Backend** | `server/prisma/seed.ts`, `server/src/config/redis.ts` | Seed script populates test courses, 50 matric numbers (`ZMB-2026-001..050`), and store products. Redis ping verified. |
| **Day 4** | Clerk Project + User Sync & Matric Claim | **Backend** | `server/src/modules/auth/clerk-webhook.ts`, `matric.service.ts`, `auth.controller.ts` | Clerk webhook / first-request upsert creates local `User`; atomic matric claim elevates role to `ZEEMBLE_STUDENT` (no password hashing). |
| **Day 5** | Clerk Session Verify & RBAC Guards | **Backend** | `server/src/middleware/clerk-auth.middleware.ts`, `server/src/middleware/rbac.middleware.ts` | Verify Clerk session JWT on protected routes; RBAC guards (`requireRole(['ZEEMBLE_STUDENT', 'ADMIN'])`) read role from Postgres. |
| **Day 6** | Clerk UI + Matric Claim Component | **Frontend** | `ClerkProvider`, `client/src/components/auth/MatricClaimForm.tsx`, `client/src/lib/api-client.ts` | Clerk `<SignIn />` / `<SignUp />` with Google (and email); matric claim form posts to Fastify with Clerk bearer token. |
| **Day 7** | Auth Pages & Role State Review | **Frontend** | `client/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`, `sign-up`, `claim-matric/page.tsx`, `client/middleware.ts` | E2E: social/email sign-in → optional matric claim → student role reflected in app; duplicate matric returns HTTP 400. |

---

### 📅 Week 2: Consultation Booking Engine & Zeemble LMS Core
*Goal: Time-slot booking engine with email notifications, and modular course lesson player with progress tracking.*

| Day | Focus Area | Layer | Single-File / Module Task | Deliverable & Acceptance |
| :--- | :--- | :--- | :--- | :--- |
| **Day 8** | Consultation API & Slot Lock | **Backend** | `server/src/modules/consultations/consultation.service.ts`, `consultation.controller.ts` | Booking endpoint with Redis slot locking to prevent double bookings; file upload handler for project briefs. |
| **Day 9** | Email Dispatcher & Calendar ICS | **Backend** | `server/src/utils/mailer.ts`, `server/src/utils/ics-generator.ts` | Resend email dispatch with generated `.ics` calendar attachment sent to both client and Zeemkolo admin. |
| **Day 10** | Consultation Slot Picker UI | **Frontend** | `client/src/components/consultation/CalendarSlotGrid.tsx`, `IntakeForm.tsx` | Timezone-aware date/slot grid component and multi-step intake form submitting directly to `/api/consultations`. |
| **Day 11** | LMS Course & Lesson Data Layer | **Backend** | `server/src/modules/lms/lms.service.ts`, `lms.controller.ts` | Endpoints for courses, modules, lessons, and preview gating logic (returns full content only to verified students). |
| **Day 12** | Student Progress Tracking API | **Backend** | `server/src/modules/lms/progress.service.ts`, `progress.controller.ts` | Upsert student progress per lesson; calculate course completion percentage and return resume-point deep link. |
| **Day 13** | LMS Markdown & Code Viewer UI | **Frontend** | `client/src/components/lms/LessonMarkdown.tsx`, `client/src/components/lms/CodeBlock.tsx` | KaTeX math rendering, syntax highlighting with copy/download buttons built as isolated, performant components. |
| **Day 14** | Schematic Viewer & Lesson Player UI | **Frontend** | `client/src/components/lms/SchematicViewer.tsx`, `client/src/app/(zeemble)/zeemble/courses/[courseSlug]/[lessonSlug]/page.tsx` | Vector schematic viewer with pan/zoom; course navigation tree with progress checkboxes. |

---

### 📅 Week 3: Community Forum & E-Commerce Store
*Goal: Public-read / student-write forum, store catalog, Paystack/Stripe webhooks, and secure digital downloads.*

| Day | Focus Area | Layer | Single-File / Module Task | Deliverable & Acceptance |
| :--- | :--- | :--- | :--- | :--- |
| **Day 15** | Forum Backend & Write Guard API | **Backend** | `server/src/modules/forum/forum.service.ts`, `forum.controller.ts` | Thread creation, reply nesting, upvoting; strict RBAC rejecting non-student write attempts with HTTP 403. |
| **Day 16** | Forum Thread & Discussion UI | **Frontend** | `client/src/components/forum/ThreadCard.tsx`, `client/src/components/forum/ReplyBox.tsx`, `client/src/app/(forum)/forum/page.tsx` | SSR-rendered thread listings for SEO; guest banner prompt (*"Enroll in Zeemble to reply"*). |
| **Day 17** | Store Data Layer & Inventory API | **Backend** | `server/src/modules/store/store.service.ts`, `store.controller.ts` | Product catalog endpoints, stock reservation mechanism, and price formatting in lowest currency units. |
| **Day 18** | Payment Gateway Webhook Engine | **Backend** | `server/src/modules/payments/paystack.webhook.ts`, `stripe.webhook.ts` | Webhook verification: decrements stock on payment confirmation, sets order to `PAID`, triggers fulfillment. |
| **Day 19** | Digital Download Token System | **Backend** | `server/src/utils/r2-signed-url.ts`, `server/src/modules/store/download.controller.ts` | Generates 15-minute cryptographically signed Cloudflare R2 download tokens for purchased ebooks and firmware bundles. |
| **Day 20** | Store Catalog & Cart Drawer UI | **Frontend** | `client/src/components/store/ProductCard.tsx`, `client/src/components/store/CartDrawer.tsx`, `client/src/hooks/useCart.ts` | Product grid with physical/digital badges; slide-over cart drawer with persistent local storage. |
| **Day 21** | Checkout & Order Confirmation UI | **Frontend** | `client/src/app/(store)/store/checkout/page.tsx`, `client/src/components/store/OrderSuccessCard.tsx` | Currency selector (NGN / USD), payment modal integration, and instant download portal for digital assets. |

---

### 📅 Week 4: Marketing Showcase, QR Compatibility & Production Deployment
*Goal: High-conversion landing page, legacy barcode redirects, admin panel, Railway/Vercel deployment, and DNS cutover.*

| Day | Focus Area | Layer | Single-File / Module Task | Deliverable & Acceptance |
| :--- | :--- | :--- | :--- | :--- |
| **Day 22** | Zeemkolo Marketing Homepage | **Frontend** | `client/src/app/(marketing)/page.tsx`, `client/src/components/marketing/HeroSection.tsx`, `ServicesGrid.tsx` | Industrial engineering branding, Zeemble academy spotlight, client testimonials, and consultation CTA. |
| **Day 23** | Barcode & Legacy QR Redirect Engine | **Frontend** | `client/next.config.ts`, `client/src/middleware.ts` | Labels already hit `zeemkolo.com`; replace placeholder path map with final routes (from inventory/QR scans); configure explicit 301s for legacy Canva paths. |
| **Day 24** | Admin Management API | **Backend** | `server/src/modules/admin/admin.service.ts`, `admin.controller.ts` | Batch matric number generator, consultation status updater, and order tracking endpoints. |
| **Day 25** | Admin Portal UI | **Frontend** | `client/src/app/(admin)/admin/page.tsx`, `client/src/components/admin/MatricGeneratorModal.tsx` | Admin control panel: generate & export matric CSVs, review consultation inquiries, and update store items. |
| **Day 26** | Security Audit & Rate Limiting | Full Stack | `server/src/middleware/rate-limiter.ts`, `client/src/lib/security-headers.ts` | Redis-backed rate limiting on matric-claim and booking endpoints; audit CORS, Clerk webhook signatures, Helmet headers, and SQL injection safety. |
| **Day 27** | Production Deployment (Vercel & Railway) | DevOps | Railway + Vercel projects, Clerk production instance keys, env wiring | Server on Railway with live migrations; Client on Vercel with Clerk; API verifies production Clerk JWTs. |
| **Day 28** | DNS Cutover & Zero-Downtime Launch | DevOps | Custom domain (`zeemkolo.com`) DNS configuration, SSL certification check, physical QR code scan verification | Live site running on `zeemkolo.com`; all barcodes resolve seamlessly; system live and operational. |

---

## 8. Quality Assurance & Acceptance Test Scenarios

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               ACCEPTANCE TEST PROTOCOL                                 │
├──────────────────────┬──────────────────────────────────┬──────────────────────────────┤
│ Test Feature         │ Action                           │ Expected Behavior            │
├──────────────────────┼──────────────────────────────────┼──────────────────────────────┤
│ Matric Verification  │ Clerk sign-in, then claim      │ Local user synced; role       │
│                      │ `ZMB-2026-005`                 │ elevated to `ZEEMBLE_STUDENT`│
├──────────────────────┼────────────────────────────────┼──────────────────────────────┤
│ Social Login         │ Sign in with Google via Clerk  │ Session established; User    │
│                      │                                │ upserted in Postgres         │
├──────────────────────┼────────────────────────────────┼──────────────────────────────┤
│ Duplicate Matric     │ Second user claims same matric │ HTTP 400: *"Matric number    │
│                      │                                │ already activated"*          │
├──────────────────────┼────────────────────────────────┼──────────────────────────────┤
│ LMS Course Gating    │ Anonymous user visits Lesson 3 │ Markdown truncated; modal    │
│                      │                                │ prompts sign-in + matric     │
├──────────────────────┼────────────────────────────────┼──────────────────────────────┤
│ Forum RBAC Guard     │ General customer submits reply │ Server rejects (403); UI     │
│                      │                                │ shows enrollment banner      │
├──────────────────────┼────────────────────────────────┼──────────────────────────────┤
│ Consultation Booking │ Client picks slot & uploads zip│ Booking recorded; ICS email  │
│                      │                                │ dispatched in < 5 seconds    │
├──────────────────────┼────────────────────────────────┼──────────────────────────────┤
│ Physical Barcodes    │ Scan existing hardware QR      │ Hits `zeemkolo.com`; path    │
│                      │ (domain already zeemkolo.com)  │ 301 to correct app route     │
└──────────────────────┴────────────────────────────────┴──────────────────────────────┘
```

---

*Master Engineering Roadmap finalized for **Zeemkolo Technical Solutions** & **Zeemble Program**.*  
*Identity: **Clerk** (auth + social) · Authorization: **Postgres RBAC** · Matric claim: **Fastify**.*  
*Ready for implementation starting with **Phase 1** (Clerk + matric).*
