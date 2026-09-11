# Dev note — payments provider selection (pending)

**Status:** Payment rails are **not locked** yet. Paystack vs Stripe (or both / another provider) is still under selection.

**Intent:** Finish the production payment handoff (hosted checkout / modal, live webhook secrets, currency routing) only after the provider choice is confirmed.

## What to do for now

- Treat Paystack/Stripe UI labels, webhook routes, and env keys as **scaffolding / placeholders**.
- Local checkout may use `POST /store/orders/:id/confirm-test` to simulate a successful payment so inventory, order status, and digital downloads can be verified without a live gateway.
- Fill real gateway secrets and public keys in `.env` only when a provider is chosen; empty placeholders in `.env.example` are intentional.
- Precise infra details still TBD (merchant accounts, webhook endpoints on Railway, success/cancel URLs, NGN vs USD primary rail) — use stubs until those are decided.

## Already in place (provider-agnostic)

- Catalog + cart + order create (`PENDING` + Redis reservation)
- Confirm paid → decrement stock → expose timed digital download grants
- Webhook handler shapes for Paystack / Stripe signatures (activate when secrets exist)

## When selection is final

1. Lock provider(s) and currencies in this note (or replace with a short ADR).
2. Wire real checkout session / initialize-transaction calls from `/store/checkout`.
3. Point production webhooks at `/payments/webhooks/{provider}` with verified secrets.
4. Remove or gate `confirm-test` so it cannot run in production (already 404 when `NODE_ENV=production`).

*— Zeemkolo store / Phase 5*
