import { env } from "../../config/env.js";
import { StoreError } from "../store/store.service.js";

const FLW_PAYMENTS_URL = "https://api.flutterwave.com/v3/payments";
const FLW_VERIFY_BY_REF_URL =
  "https://api.flutterwave.com/v3/transactions/verify_by_reference";

export type FlutterwaveInitResult = {
  mode: "flutterwave";
  paymentUrl: string;
  reference: string;
};

type FlwInitResponse = {
  status?: string;
  message?: string;
  data?: { link?: string };
};

type FlwVerifyResponse = {
  status?: string;
  data?: {
    status?: string;
    tx_ref?: string;
    amount?: number;
    currency?: string;
  };
};

/** Flutterwave amounts are major units; our store totals are minor (kobo/cents). */
export function minorToMajor(amountMinor: number): number {
  return Math.round(amountMinor) / 100;
}

export function flutterwaveConfigured() {
  return Boolean(env.FLUTTERWAVE_SECRET_KEY);
}

export async function initializeFlutterwavePayment(input: {
  email: string;
  amountMinor: number;
  currency: "NGN" | "USD";
  reference: string;
  callbackUrl: string;
  orderId: string;
}): Promise<FlutterwaveInitResult> {
  if (!env.FLUTTERWAVE_SECRET_KEY) {
    throw new StoreError("Flutterwave is not configured", 503);
  }

  const amount = minorToMajor(input.amountMinor);
  if (!(amount > 0)) {
    throw new StoreError("Invalid payment amount", 400);
  }

  const res = await fetch(FLW_PAYMENTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: input.reference,
      amount,
      currency: input.currency,
      redirect_url: input.callbackUrl,
      payment_options: "card,banktransfer,ussd",
      customer: { email: input.email },
      meta: { orderId: input.orderId },
      customizations: {
        title: "Zeemkolo Store",
        description: `Order ${input.orderId}`,
      },
    }),
  });

  const body = (await res.json().catch(() => ({}))) as FlwInitResponse;
  if (!res.ok || body.status !== "success" || !body.data?.link) {
    throw new StoreError(
      body.message || "Flutterwave initialize failed",
      502,
    );
  }

  return {
    mode: "flutterwave",
    paymentUrl: body.data.link,
    reference: input.reference,
  };
}

/**
 * Optional post-webhook / return-path verification by tx_ref.
 * Returns true when Flutterwave reports a successful charge for the reference.
 */
export async function verifyFlutterwaveByReference(reference: string) {
  if (!env.FLUTTERWAVE_SECRET_KEY) return false;

  const url = `${FLW_VERIFY_BY_REF_URL}?tx_ref=${encodeURIComponent(reference)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
    },
  });
  const body = (await res.json().catch(() => ({}))) as FlwVerifyResponse;
  if (!res.ok || body.status !== "success") return false;
  return body.data?.status === "successful" && body.data?.tx_ref === reference;
}
