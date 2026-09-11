# ADR-003: Auto-assign matric at signup

- **Status:** Accepted
- **Date:** 2026-09-11

## Context

Zeemble students need a matric (`ZMB-YYYY-NNN`) to unlock full LMS and forum write access. Manual “claim a printed code” was considered early, then revised for smoother onboarding.

## Decision

**Auto-assign** an unused matric when a user is created/synced (signup / first auth), elevating role to `ZEEMBLE_STUDENT` (admins stay `ADMIN`).

- Page `/claim-matric` shows **My matric** (and retains claim API for edge/admin flows).
- Format remains `ZMB-YYYY-NNN`; batch generation for packs stays an admin capability.

## Consequences

- Seeded unused matrics still support batch/pre-print workflows.
- Duplicate claim of an already-owned code is rejected.
- Product copy should not tell every user they must manually claim to enroll.
