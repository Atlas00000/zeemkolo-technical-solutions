# Paystack integration — plan, phases & required details

**Status:** Planned (replacing Flutterwave as the live store rail)  
**Related:** [ADR-004](../adr/004-payment-provider-placeholder.md) · [payments-provider-pending](./payments-provider-pending.md) · existing webhook stub in `server/src/modules/payments/payment-webhooks.ts`

## Goal

Make **Paystack** the production checkout provider for the Zeemkolo store, mirroring the current Flutterwave flow:

1. Create `PENDING` order + `paymentRef` (`zk_…`)
2. Initialize Paystack transaction → redirect buyer to Paystack
3. Webhook `charge.success` → `confirmOrderPaid`
4. Order page polls until status leaves `PENDING`

Schema and fulfillment already support `paymentProvider: "paystack"`. Webhook HMAC verification already exists. Missing pieces: initialize module, initialize route, client wire-up, ops config.

---

## Required info / keys / details (from Paystack dashboard)

Collect these before Phase 2 (live init). Prefer **test mode** first, then swap to live.

### 1. API keys (Settings → API Keys & Webhooks)

| Item | Where it lives | Env var | Notes |
| :--- | :--- | :--- | :--- |
| **Secret key** | Dashboard → Settings → API Keys | `PAYSTACK_SECRET_KEY` | `sk_test_…` locally/CI; `sk_live_…` in production. Server-only — never expose to the client. |
| **Public key** | Same page | Optional `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Only needed if we add Paystack Inline JS later. **Not required** for Standard redirect (same pattern as Flutterwave). |

### 2. Webhook (Settings → API Keys & Webhooks)

| Item | Value |
| :--- | :--- |
| **Webhook URL (local via tunnel)** | `https://<ngrok-or-cloudflared-host>/payments/webhooks/paystack` |
| **Webhook URL (production)** | `https://api.zeemkolo.com/payments/webhooks/paystack` |
| **Signature** | Paystack signs with HMAC-SHA512 of the **raw body** using the **secret key**. Header: `x-paystack-signature`. Already implemented. |
| **Events to enable** | At minimum: `charge.success`. Optional: `charge.failed` (log/ignore for now). |

No separate “webhook secret hash” like Flutterwave — the secret key is used for both API calls and webhook HMAC.

### 3. Callback / redirect

| Item | Env / value |
| :--- | :--- |
| **Buyer return URL base** | `PAYMENT_CALLBACK_BASE_URL` |
| Local example | `http://localhost:3000` |
| Production example | `https://www.zeemkolo.com` |
| Per-order callback | `{PAYMENT_CALLBACK_BASE_URL}/store/orders/{orderId}` |

Fallback today: first origin in `CORS_ORIGIN` if callback base is empty.

### 4. Business / product details (dashboard hygiene)

| Detail | Why |
| :--- | :--- |
| Business name / logo | Shown on Paystack checkout |
| Settlement bank / NGN account | Payouts |
| Preferred currency | Store already supports `NGN` and `USD` — confirm Paystack account supports the currencies you enable |
| Test cards | Use Paystack’s published test cards in test mode |

### 5. Amount units (no conversion needed)

Our `Order.totalAmount` is already in **minor units** (kobo for NGN, cents for USD). Paystack `amount` is also minor units. Do **not** divide by 100 (unlike Flutterwave, which uses major units).

### 6. Reference mapping

| Zeemkolo | Paystack |
| :--- | :--- |
| `Order.paymentRef` (`zk_<24 hex>`) | `reference` on initialize + webhook `data.reference` |
| `Order.id` | Pass in `metadata.orderId` on initialize |

---

## Current codebase state

| Piece | Status |
| :--- | :--- |
| `POST /store/orders` with `paymentProvider: "paystack"` | Supported |
| `POST /payments/webhooks/paystack` + HMAC | Implemented |
| `handlePaystackEvent` → `confirmOrderPaid` | Implemented (no extra verify call yet) |
| `paystack.ts` initialize + verify | **Missing** |
| `POST /store/orders/:id/paystack/initialize` | **Missing** |
| Client checkout UI | Hardcoded Flutterwave |
| Env `PAYSTACK_SECRET_KEY` | Present in schema / root `.env.example` |
| OpenAPI / ADR / AGENTS | Still Flutterwave-locked |

---

## Implementation phases

### Phase 0 — Dashboard prep (you / ops)

**Owner:** you (Paystack dashboard)  
**Done when:** test keys copied into local env; webhook URL ready (or deferred until tunnel).

Checklist:

- [ ] Create / confirm Paystack business (test mode)
- [ ] Copy **test** secret key → `server/.env` (and root `.env` if used) as `PAYSTACK_SECRET_KEY=sk_test_…`
- [ ] Confirm `PAYMENT_CALLBACK_BASE_URL=http://localhost:3000`
- [ ] Note production webhook URL for Railway cutover
- [ ] (Optional) Set up ngrok/cloudflared so local webhooks reach the API

Do **not** commit real keys. Only empty placeholders in `.env.example`.

---

### Phase 1 — Server: Paystack initialize + verify

**Owner:** engineering  
**Done when:** initialize returns a Paystack authorization URL; verify helper works; tests pass without live keys (dev placeholder).

Work:

1. Add `server/src/modules/payments/paystack.ts`
   - `paystackConfigured()` → `Boolean(env.PAYSTACK_SECRET_KEY)`
   - `initializePaystackPayment({ email, amountMinor, currency, reference, callbackUrl, orderId })`
     - `POST https://api.paystack.co/transaction/initialize`
     - Headers: `Authorization: Bearer ${PAYSTACK_SECRET_KEY}`
     - Body: `email`, `amount` (minor), `currency`, `reference`, `callback_url`, `metadata: { orderId }`
     - Return `{ mode: "paystack", paymentUrl: data.authorization_url, reference }`
   - `verifyPaystackByReference(reference)` → `GET /transaction/verify/:reference`
2. Add route `POST /store/orders/:orderId/paystack/initialize` (mirror Flutterwave)
   - 404 if order missing / wrong owner rules as today
   - 400 if `paymentProvider` set and not `paystack`
   - Without key (non-prod): `{ mode: "dev_placeholder", useConfirmTest: true }`
   - With key: call initialize; set `paymentProvider: "paystack"` if unset
3. Harden webhook: after signature OK + `charge.success`, optionally call verify (parity with Flutterwave)
4. Tests in `store.routes.test.ts` for initialize placeholder + existing Paystack webhook
5. Update OpenAPI (`server/src/openapi.ts` + published `docs/api/openapi.json`)

---

### Phase 2 — Client: checkout wire-up

**Owner:** engineering  
**Done when:** store checkout creates Paystack orders and redirects (or uses confirm-test in local without keys).

Work:

1. `api-client.ts`: `initializePaystackCheckout(orderId)`
2. `CheckoutForm.tsx`: `paymentProvider: "paystack"`; call Paystack initialize; redirect on `paymentUrl`; keep confirm-test fallback for `dev_placeholder`
3. `OrderSuccessCard.tsx`: copy/messaging if it mentions Flutterwave
4. Regenerate / update client OpenAPI types if that is the project convention

---

### Phase 3 — Docs, ADR, env examples

**Owner:** engineering  
**Done when:** docs say Paystack is the locked rail; Flutterwave marked legacy/unused.

Work:

1. Revise [ADR-004](../adr/004-payment-provider-placeholder.md) → Paystack locked (Flutterwave scaffolding retained)
2. Update this file’s status + [payments-provider-pending.md](./payments-provider-pending.md)
3. Update `AGENTS.md` env matrix / locked decisions
4. Root + `server/.env.example`: document `PAYSTACK_SECRET_KEY`; demote Flutterwave keys to legacy
5. Keep Flutterwave routes temporarily for rollback, or gate behind “legacy only”

---

### Phase 4 — Local end-to-end smoke

**Owner:** engineering + you  
**Done when:** one test-mode payment confirms an order to PAID/FULFILLED.

Checklist:

- [ ] `pnpm db:up` + `pnpm dev:server` + `pnpm dev:client`
- [ ] `PAYSTACK_SECRET_KEY=sk_test_…` set
- [ ] Tunnel → webhook URL registered in Paystack test settings
- [ ] Place a small NGN (or USD) order → Paystack checkout → pay with test card
- [ ] Confirm webhook hits API; order leaves `PENDING`; digital download / stock behaves as expected
- [ ] Without keys: confirm `dev_placeholder` → `confirm-test` still works for CI/local

Suggested test card (confirm against current Paystack docs): success card `4084084084084081` (any future expiry, any CVV) — always re-check Paystack’s test-card page.

---

### Phase 5 — Production cutover

**Owner:** you + engineering  
**Done when:** Paystack code deployed; live keys on Railway; webhook live; Flutterwave no longer used by UI.

Checklist:

- [ ] Deploy Paystack code (Phases 1–2 + return-path confirm) to Railway + Vercel
- [ ] Set on Railway `zeemkolo-server` (script: `server/scripts/set-railway-paystack.mjs`):
  - `PAYSTACK_SECRET_KEY=sk_live_…`
  - `PAYMENT_CALLBACK_BASE_URL=https://www.zeemkolo.com`
- [ ] Paystack Dashboard → **Live** → API Keys & Webhooks:
  - **Live Webhook URL:** `https://api.zeemkolo.com/payments/webhooks/paystack`
  - **Live Callback URL (fallback):** `https://www.zeemkolo.com`
  - Save changes
- [ ] Keep local `server/.env` on `sk_test_…` (do not overwrite with live)
- [ ] Smoke: `GET https://api.zeemkolo.com/health` then a low-value live order
- [ ] Remove unused Flutterwave keys from Railway if present
- [ ] Monitor first real orders (Railway logs + Paystack dashboard)

`confirm-test` must remain **404 when `NODE_ENV=production`**.

---

## Env matrix (Paystack era)

| Variable | Where | Required | Purpose |
| :--- | :--- | :--- | :--- |
| `PAYSTACK_SECRET_KEY` | `server/.env` / Railway | Yes for live checkout | Initialize, verify, webhook HMAC |
| `PAYMENT_CALLBACK_BASE_URL` | server | Yes in prod | Buyer return URL base |
| `CORS_ORIGIN` | server | Yes | API CORS; fallback callback origin |
| `FLUTTERWAVE_*` | server | No (legacy) | Keep only if dual-rail / rollback |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | client | No | Only for future Inline JS |

---

## API shape (target)

```http
POST /store/orders
{ "email", "currency", "items", "paymentProvider": "paystack" }

POST /store/orders/:orderId/paystack/initialize
→ { "mode": "paystack", "paymentUrl": "https://checkout.paystack.com/…", "reference": "zk_…" }
→ or { "mode": "dev_placeholder", "useConfirmTest": true }

POST /payments/webhooks/paystack
Header: x-paystack-signature
```

---

## Out of scope (for later)

- Dual-rail UI (buyer chooses Flutterwave vs Paystack)
- Paystack Inline / Popup (public key on client)
- Refunds / partial capture admin UI
- Subscriptions / plans

---

## Phase tracker

| Phase | Status |
| :--- | :--- |
| 0 Dashboard prep | Done (keys in `server/.env`) |
| 1 Server initialize + verify | Done |
| 2 Client checkout | Done |
| 3 Docs / ADR / env examples | Partial (this plan + env examples; ADR still transitional) |
| 4 Local E2E smoke | Return-path `POST …/paystack/confirm` shipped; tunnel webhook optional |
| 5 Production cutover | In progress — needs Railway login + deploy + dashboard webhook |

When Phase 0 keys are in local `.env`, say the word and implement Phases 1–3 in code.
