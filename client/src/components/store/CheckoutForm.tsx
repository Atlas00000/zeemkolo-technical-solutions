"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  confirmStoreOrderTest,
  createStoreOrder,
} from "@/lib/api-client";
import { useCart } from "@/hooks/useCart";

export function CheckoutForm() {
  const cart = useCart();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [provider, setProvider] = useState<"paystack" | "stripe">("paystack");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!cart.items.length) {
      setError("Cart is empty");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const order = await createStoreOrder({
        email,
        currency,
        paymentProvider: provider,
        items: cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      });

      // Dev path: simulate gateway confirmation so downloads work locally.
      await confirmStoreOrderTest(order.id);
      cart.clear();
      router.push(`/store/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      <label className="block text-sm text-brand-steel">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full border border-brand-steel/25 bg-white px-3 py-2 text-brand-ink"
        />
      </label>

      <fieldset className="text-sm text-brand-steel">
        <legend className="mb-2">Currency</legend>
        <label className="mr-4">
          <input
            type="radio"
            name="currency"
            checked={currency === "NGN"}
            onChange={() => setCurrency("NGN")}
          />{" "}
          NGN
        </label>
        <label>
          <input
            type="radio"
            name="currency"
            checked={currency === "USD"}
            onChange={() => setCurrency("USD")}
          />{" "}
          USD
        </label>
      </fieldset>

      <fieldset className="text-sm text-brand-steel">
        <legend className="mb-2">Payment</legend>
        <label className="mr-4">
          <input
            type="radio"
            name="provider"
            checked={provider === "paystack"}
            onChange={() => setProvider("paystack")}
          />{" "}
          Paystack
        </label>
        <label>
          <input
            type="radio"
            name="provider"
            checked={provider === "stripe"}
            onChange={() => setProvider("stripe")}
          />{" "}
          Stripe
        </label>
      </fieldset>

      <ul className="space-y-1 text-sm text-brand-ink">
        {cart.items.map((item) => (
          <li key={item.productId}>
            {item.quantity}× {item.title}
          </li>
        ))}
      </ul>

      {error ? <p className="text-sm text-brand-signal">{error}</p> : null}

      <button
        type="submit"
        disabled={busy || !cart.items.length}
        className="bg-brand-signal px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {busy ? "Processing…" : "Pay & confirm (dev)"}
      </button>
      <p className="text-xs text-brand-steel/70">
        Payment provider still under selection — checkout uses a local confirm
        placeholder until the live rail is chosen. See{" "}
        <code>docs/dev-notes/payments-provider-pending.md</code>.
      </p>
    </form>
  );
}
