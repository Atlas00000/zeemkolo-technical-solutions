"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  confirmStoreOrderTest,
  createStoreOrder,
} from "@/lib/api-client";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      <div className="space-y-2">
        <Label htmlFor="checkout-email">Email</Label>
        <Input
          id="checkout-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <fieldset className="text-sm text-muted-foreground">
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

      <fieldset className="text-sm text-muted-foreground">
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

      <ul className="space-y-1 text-sm text-foreground">
        {cart.items.map((item) => (
          <li key={item.productId}>
            {item.quantity}× {item.title}
          </li>
        ))}
      </ul>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={busy || !cart.items.length}>
        {busy ? "Processing…" : "Pay & confirm (dev)"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Payment provider still under selection — checkout uses a local confirm
        placeholder until the live rail is chosen. See{" "}
        <code>docs/dev-notes/payments-provider-pending.md</code>.
      </p>
    </form>
  );
}
