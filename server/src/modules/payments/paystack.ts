import { env } from "../../config/env.js";
import { StoreError } from "../store/store.service.js";

const PAYSTACK_INITIALIZE_URL = "https://api.paystack.co/transaction/initialize";
const PAYSTACK_VERIFY_URL = "https://api.paystack.co/transaction/verify";

export type PaystackInitResult = {
  mode: "paystack";
  paymentUrl: string;
  reference: string;
};

type PaystackInitResponse = {
  status?: boolean;
  message?: string;
  data?: {
    authorization_url?: string;
    access_code?: string;
    reference?: string;
  };
};

type PaystackVerifyResponse = {
  status?: boolean;
  message?: string;
  data?: {
    status?: string;
    reference?: string;
    amount?: number;
    currency?: string;
  };
};

export function paystackConfigured() {
  return Boolean(env.PAYSTACK_SECRET_KEY);
}

export async function initializePaystackPayment(input: {
  email: string;
  amountMinor: number;
  currency: "NGN" | "USD";
  reference: string;
  callbackUrl: string;
  orderId: string;
}): Promise<PaystackInitResult> {
  if (!env.PAYSTACK_SECRET_KEY) {
    throw new StoreError("Paystack is not configured", 503);
  }

  if (!(input.amountMinor > 0)) {
    throw new StoreError("Invalid payment amount", 400);
  }

  // Paystack amounts are minor units (kobo/cents) — same as Order.totalAmount.
  const res = await fetch(PAYSTACK_INITIALIZE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amountMinor),
      currency: input.currency,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: { orderId: input.orderId },
    }),
  });

  const body = (await res.json().catch(() => ({}))) as PaystackInitResponse;
  if (!res.ok || !body.status || !body.data?.authorization_url) {
    throw new StoreError(body.message || "Paystack initialize failed", 502);
  }

  return {
    mode: "paystack",
    paymentUrl: body.data.authorization_url,
    reference: body.data.reference || input.reference,
  };
}

/**
 * Optional post-webhook / return-path verification by reference.
 * Returns true when Paystack reports a successful charge for the reference.
 */
export async function verifyPaystackByReference(reference: string) {
  if (!env.PAYSTACK_SECRET_KEY) return false;

  const url = `${PAYSTACK_VERIFY_URL}/${encodeURIComponent(reference)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
    },
  });
  const body = (await res.json().catch(() => ({}))) as PaystackVerifyResponse;
  if (!res.ok || !body.status) return false;
  return body.data?.status === "success" && body.data?.reference === reference;
}
