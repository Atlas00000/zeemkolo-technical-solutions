# Dev note — payments (Paystack)

**Status:** Paystack is the store checkout rail (Phases 1–2 implemented).  
**Plan:** [paystack-integration.md](./paystack-integration.md)  
**ADR:** [ADR-004](../adr/004-payment-provider-placeholder.md) (transitional — still mentions Flutterwave until Phase 3 polish)

## Runtime

- UI creates orders with `paymentProvider: "paystack"` and calls `POST /store/orders/:id/paystack/initialize`.
- Without `PAYSTACK_SECRET_KEY`, initialize returns `dev_placeholder` → `confirm-test` (404 in production).
- Webhook: `POST /payments/webhooks/paystack` (HMAC + optional verify).

## Local checklist

1. `PAYSTACK_SECRET_KEY=sk_test_…` + `PAYMENT_CALLBACK_BASE_URL=http://localhost:3000` in `server/.env`
2. Checkout → Paystack test card → return to order page → `POST …/paystack/confirm` marks PAID (no tunnel required)
3. Optional webhook: tunnel API `:5000` and set Test Webhook URL to `https://<tunnel>/payments/webhooks/paystack`
4. Prefer `sk_test_…` for local; keep `sk_live_…` for production only
