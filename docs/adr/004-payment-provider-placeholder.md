# ADR-004: Payment provider placeholder

- **Status:** Accepted
- **Date:** 2026-09-11

## Context

Store checkout needs a payment rail (Paystack and/or Stripe were sketched), but the commercial provider selection is not final.

## Decision

Keep **payment placeholders**:

- Order create + Redis reservation + stock decrement on confirm remain.
- Dev may use `POST /store/orders/:id/confirm-test` (disabled in production).
- Webhook route shapes exist; live checkout session/modal is deferred.
- Documented in `docs/dev-notes/payments-provider-pending.md`.

## Consequences

- No production card capture until provider sign-off.
- UI must not imply a finished Paystack/Stripe integration.
- When selection lands, replace placeholders without redesigning catalog/cart/order models.
