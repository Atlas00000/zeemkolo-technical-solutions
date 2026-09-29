# ADR-005: Phase 8 production paused → unlocked

- **Status:** Superseded (unlocked)
- **Date:** 2026-09-11
- **Unlocked:** 2026-09-29

## Context

Roadmap Phase 8 covers Railway + Vercel deploy, env wiring, DNS/`zeemkolo.com` cutover, and live QR verification. Cutover was paused pending owner sign-off.

## Decision (original)

**Do not** execute Phase 8 (public DNS cutover / production launch) until the owner signs off.

## Unlock (2026-09-29)

Owner authorized custom-domain cutover via CLI:

- Site: `www.zeemkolo.com` (canonical) + apex `zeemkolo.com` → Vercel `zeemkolo-client`
- API: `api.zeemkolo.com` → Railway `zeemkolo-server`

Live DNS records at the third-party registrar remain an owner/ops step using the records printed by Vercel/Railway CLIs. Clerk dashboard allow-lists remain a manual Clerk console step.

## Consequences

- Agents may attach domains, update `CORS_ORIGIN` / `NEXT_PUBLIC_API_URL`, and redeploy for this cutover.
- Do not delete the Railway `*.up.railway.app` fallback domain unless explicitly asked.
