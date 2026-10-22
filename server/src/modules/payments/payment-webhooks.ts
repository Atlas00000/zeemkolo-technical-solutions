import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../../config/env.js";
import { confirmOrderPaid, StoreError } from "../store/store.service.js";
import { verifyFlutterwaveByReference } from "./flutterwave.js";
import { verifyPaystackByReference } from "./paystack.js";

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Flutterwave sends `verif-hash` equal to the dashboard secret hash
 * (not an HMAC of the body).
 */
export function verifyFlutterwaveSignature(verifHash: string | undefined) {
  if (!env.FLUTTERWAVE_SECRET_HASH) {
    return env.NODE_ENV !== "production";
  }
  if (!verifHash) return false;
  return safeEqual(verifHash, env.FLUTTERWAVE_SECRET_HASH);
}

/** Paystack sends x-paystack-signature = HMAC SHA512 of raw body. */
export function verifyPaystackSignature(rawBody: string, signature: string | undefined) {
  if (!env.PAYSTACK_SECRET_KEY) {
    return env.NODE_ENV !== "production";
  }
  if (!signature) return false;
  const hash = createHmac("sha512", env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");
  return safeEqual(hash, signature);
}

/**
 * Stripe webhook verification (simplified):
 * expects `Stripe-Signature` with t=timestamp,v1=hmac when secret configured.
 */
export function verifyStripeSignature(
  rawBody: string,
  signatureHeader: string | undefined,
) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return env.NODE_ENV !== "production";
  }
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k, v];
    }),
  );
  const timestamp = parts.t;
  const v1 = parts.v1;
  if (!timestamp || !v1) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", env.STRIPE_WEBHOOK_SECRET)
    .update(signedPayload)
    .digest("hex");
  return safeEqual(expected, v1);
}

export async function handleFlutterwaveEvent(payload: {
  event?: string;
  data?: {
    tx_ref?: string;
    status?: string;
    id?: number | string;
  };
}) {
  if (payload.event !== "charge.completed") {
    return { ignored: true as const };
  }
  const reference = payload.data?.tx_ref;
  if (!reference) {
    throw new StoreError("Missing Flutterwave tx_ref", 400);
  }
  if (payload.data?.status && payload.data.status !== "successful") {
    return { ignored: true as const };
  }

  // Prefer live verify when secret key is present; skip in test/dev without key.
  if (env.FLUTTERWAVE_SECRET_KEY) {
    const ok = await verifyFlutterwaveByReference(reference);
    if (!ok) {
      throw new StoreError("Flutterwave transaction not verified", 400);
    }
  }

  const order = await confirmOrderPaid({
    paymentRef: reference,
    provider: "flutterwave",
  });
  return { ignored: false as const, order };
}

export async function handlePaystackEvent(payload: {
  event?: string;
  data?: { reference?: string; status?: string };
}) {
  if (payload.event !== "charge.success") {
    return { ignored: true as const };
  }
  const reference = payload.data?.reference;
  if (!reference) {
    throw new StoreError("Missing Paystack reference", 400);
  }
  if (payload.data?.status && payload.data.status !== "success") {
    return { ignored: true as const };
  }

  // Prefer live verify when secret key is present; skip in vitest / without key.
  if (env.PAYSTACK_SECRET_KEY && env.NODE_ENV !== "test") {
    const ok = await verifyPaystackByReference(reference);
    if (!ok) {
      throw new StoreError("Paystack transaction not verified", 400);
    }
  }

  const order = await confirmOrderPaid({
    paymentRef: reference,
    provider: "paystack",
  });
  return { ignored: false as const, order };
}

export async function handleStripeEvent(payload: {
  type?: string;
  data?: { object?: { metadata?: { paymentRef?: string }; payment_status?: string } };
}) {
  if (payload.type !== "checkout.session.completed") {
    return { ignored: true as const };
  }
  const paymentRef = payload.data?.object?.metadata?.paymentRef;
  if (!paymentRef) {
    throw new StoreError("Missing Stripe paymentRef metadata", 400);
  }

  const order = await confirmOrderPaid({
    paymentRef,
    provider: "stripe",
  });
  return { ignored: false as const, order };
}
