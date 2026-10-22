"use client";

import { useState } from "react";
import {
  confirmStoreOrderTest,
  createStoreOrder,
  initializePaystackCheckout,
} from "@/lib/api-client";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/design/primitives/Button";
import { Input } from "@/design/primitives/Input";

export function CheckoutForm() {
  const cart = useCart();
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
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
        paymentProvider: "paystack",
        items: cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      });

      const init = await initializePaystackCheckout(order.id);

      if (init.mode === "dev_placeholder" || init.useConfirmTest) {
        await confirmStoreOrderTest(order.id);
        cart.clear();
        window.location.assign(`/store/orders/${order.id}`);
        return;
      }

      if (!init.paymentUrl) {
        throw new Error("Payment URL missing from Paystack");
      }

      cart.clear();
      window.location.assign(init.paymentUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="checkout-email"
          className="text-sm font-medium text-[var(--ln-muted)]"
        >
          Email
        </label>
        <Input
          id="checkout-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <fieldset className="text-sm text-[var(--ln-muted)]">
        <legend className="mb-2 font-medium text-[var(--ln-ink)]">
          Currency
        </legend>
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

      <p className="text-sm text-[var(--ln-muted)]">
        Payment via <span className="text-[var(--ln-ink)]">Paystack</span>
      </p>

      <ul className="space-y-1 border-t border-[var(--ln-hairline)] pt-4 text-sm text-[var(--ln-ink)]">
        {cart.items.map((item) => (
          <li key={item.productId}>
            <span className="ln-tabular">{item.quantity}</span>× {item.title}
          </li>
        ))}
      </ul>

      {error ? (
        <p className="text-sm text-[var(--ln-halt)]" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={busy || !cart.items.length}>
        {busy ? "Redirecting…" : "Pay with Paystack"}
      </Button>
    </form>
  );
}
