"use client";

import Link from "next/link";
import type { CartItem } from "@/hooks/useCart";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: "NGN" | "USD";
  onQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
};

function lineTotal(item: CartItem, currency: "NGN" | "USD") {
  const unit = currency === "USD" ? item.unitPriceUsd : item.unitPriceNgn;
  return unit * item.quantity;
}

function format(amountMinor: number, currency: "NGN" | "USD") {
  if (currency === "NGN") {
    return `₦${(amountMinor / 100).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `$${(amountMinor / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function CartDrawer({
  open,
  onClose,
  items,
  currency,
  onQuantity,
  onRemove,
}: CartDrawerProps) {
  if (!open) return null;

  const total = items.reduce((sum, item) => sum + lineTotal(item, currency), 0);

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/35">
      <button
        type="button"
        className="h-full flex-1 cursor-default"
        aria-label="Close cart overlay"
        onClick={onClose}
      />
      <aside className="flex h-full w-full max-w-md flex-col bg-brand-mist p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-brand-ink">Cart</h2>
          <button type="button" onClick={onClose} className="text-sm text-brand-steel">
            Close
          </button>
        </div>

        <ul className="mt-6 flex-1 space-y-4 overflow-y-auto">
          {items.length === 0 ? (
            <li className="text-sm text-brand-steel">Your cart is empty.</li>
          ) : (
            items.map((item) => (
              <li key={item.productId} className="border-b border-brand-steel/15 pb-4">
                <p className="font-medium text-brand-ink">{item.title}</p>
                <p className="text-xs text-brand-steel/70">{item.type}</p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <label>
                    Qty
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={item.quantity}
                      onChange={(e) =>
                        onQuantity(item.productId, Number(e.target.value) || 1)
                      }
                      className="ml-2 w-16 border border-brand-steel/25 bg-white px-2 py-1"
                    />
                  </label>
                  <span className="text-brand-steel">
                    {format(lineTotal(item, currency), currency)}
                  </span>
                  <button
                    type="button"
                    className="ml-auto text-brand-signal"
                    onClick={() => onRemove(item.productId)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="mt-4 border-t border-brand-steel/15 pt-4">
          <p className="flex justify-between text-sm text-brand-ink">
            <span>Total</span>
            <span>{format(total, currency)}</span>
          </p>
          <Link
            href="/store/checkout"
            onClick={onClose}
            className={`mt-4 block bg-brand-ink px-4 py-3 text-center text-sm text-white ${
              items.length === 0 ? "pointer-events-none opacity-40" : ""
            }`}
          >
            Checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}
