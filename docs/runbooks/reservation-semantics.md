# Reservation semantics

Canonical rules for consultation slot locks and store PENDING orders (O4.6).

## Consultation slots

| Rule | Value |
| :--- | :--- |
| Short lock while booking | Redis `SET NX EX` **120 seconds**, value `"locking"` |
| After successful book | Same key rewritten to consultation id, TTL **30 days** |
| On booking failure (while locking) | Key deleted |
| Booking status written | `CONFIRMED` (not PENDING) |
| Concurrent book | Second caller gets conflict while lock is held |

Source: `server/src/modules/consultations/consultation.service.ts` (`SLOT_LOCK_TTL_SECONDS = 120`).

## Store orders

| Rule | Value |
| :--- | :--- |
| Create | Order row `PENDING` + Redis `store:reserve:{orderId}` TTL **15 minutes** |
| Stock at create | **Not decremented** — only availability checked |
| Stock at pay | Decremented in `confirmOrderPaid` transaction |
| Expiry | When Redis key is gone **and** order is still PENDING past 15m, sweep cancels → `CANCELLED` |
| Sweep trigger | Opportunistic on each `createOrder` (`sweepExpiredPendingOrders`) |

Source: `server/src/modules/store/store.service.ts` (`RESERVE_TTL_SECONDS = 15 * 60`).

## Idempotency (related)

`Idempotency-Key` on `POST /consultations` and `POST /store/orders` stores the successful response in Redis for **24h**. Replay returns the same body/status without creating a second booking/order.

## Webhooks (O4.7)

Paystack / Stripe handlers verify HMAC against **`request.rawBody`** (raw JSON string from the content-type parser), not `JSON.stringify(parsedBody)`.
