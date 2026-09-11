# ADR-005: Phase 8 production paused

- **Status:** Accepted
- **Date:** 2026-09-11

## Context

Roadmap Phase 8 covers Railway + Vercel deploy, env wiring, DNS/`zeemkolo.com` cutover, and live QR verification. The owner has paused production cutover pending explicit sign-off.

## Decision

**Do not** execute Phase 8 (public DNS cutover / production launch) until the owner signs off.

- Local/dev and optimization phases (O0+) may continue.
- Deploy *prep* (Dockerfiles, env examples, runbooks) is allowed.
- Live `zeemkolo.com` traffic switch is **out of scope** until unlocked.

## Consequences

- Optimization work (admin, R2, CI, etc.) proceeds without waiting on DNS.
- Agents must not “helpfully” point production DNS or assume production secrets.
- Revisit this ADR when sign-off is given; then execute Phase 8 from `roadmap.md`.
