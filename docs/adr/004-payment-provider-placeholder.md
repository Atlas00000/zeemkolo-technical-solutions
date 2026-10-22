# ADR-004: Payment provider — Flutterwave → Paystack

- **Status:** Accepted for Flutterwave; **migration to Paystack in progress** (see [paystack-integration.md](../dev-notes/paystack-integration.md))
- **Date:** 2026-09-30 (Flutterwave lock); revised 2026-10-22 (Paystack chosen)

## Context

Store checkout needed a live payment rail. Paystack and Stripe were scaffolded as placeholders; Flutterwave was selected first. Owner decision (2026-10-22): switch the live rail to **Paystack**.

## Decision

Lock **Flutterwave** as the production checkout rail:

- `POST /store/orders` with `paymentProvider: "flutterwave"` creates a `PENDING` order + `paymentRef` (`zk_…`).
- `POST /store/orders/:id/flutterwave/initialize` calls Flutterwave Standard payments and returns `paymentUrl`.
- Buyer redirects to Flutterwave; `redirect_url` returns to `/store/orders/:id`.
- `POST /payments/webhooks/flutterwave` (`verif-hash` + optional tx_ref verify) calls `confirmOrderPaid`.
- Dev without keys: initialize returns `dev_placeholder`; client may use `confirm-test` (404 in production).
- Paystack/Stripe webhook routes remain as unused scaffolding.

## Consequences

- Production (Flutterwave era) required `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_SECRET_HASH`, and `PAYMENT_CALLBACK_BASE_URL` (or a usable `CORS_ORIGIN`).
- UI currently still exposes Flutterwave only until Paystack Phases 1–2 land.
- Paystack webhook HMAC already exists; initialize + client wire-up are the remaining code work.
- Catalog / order schema does not need redesign — only initialize + webhook + UI provider string.

## Next decision (when Phase 3 lands)

Supersede this ADR’s “Flutterwave locked” decision with Paystack as the production rail; keep Flutterwave modules as unused/legacy scaffolding unless dual-rail is explicitly requested.
