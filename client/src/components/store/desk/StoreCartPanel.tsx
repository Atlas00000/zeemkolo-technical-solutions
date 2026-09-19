"use client";

import Link from "next/link";
import type { CartItem } from "@/hooks/useCart";
import { EmptyState } from "@/components/feedback/UiState";
import { Button } from "@/design/primitives/Button";
import { Input } from "@/design/primitives/Input";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { StoreCurrency } from "./useStoreDesk";

export type StoreCartPanelProps = {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: StoreCurrency;
  onQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
};

function lineTotal(item: CartItem, currency: StoreCurrency) {
  const unit = currency === "USD" ? item.unitPriceUsd : item.unitPriceNgn;
  return unit * item.quantity;
}

function format(amountMinor: number, currency: StoreCurrency) {
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

/**
 * Cart sheet panel — hairline rows. Prop-driven for catalog + PDP.
 */
export function StoreCartPanel({
  open,
  onClose,
  items,
  currency,
  onQuantity,
  onRemove,
}: StoreCartPanelProps) {
  const total = items.reduce((sum, item) => sum + lineTotal(item, currency), 0);

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-[var(--ln-hairline)] bg-[var(--ln-canvas)] sm:max-w-md"
      >
        <SheetHeader className="border-b border-[var(--ln-hairline)] pb-4">
          <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--ln-faint)] uppercase">
            Order
          </p>
          <SheetTitle className="mt-2 font-display text-3xl tracking-tight text-[var(--ln-ink)]">
            Cart
          </SheetTitle>
        </SheetHeader>

        <ul className="mt-2 flex-1 space-y-0 overflow-y-auto">
          {items.length === 0 ? (
            <li className="py-8">
              <EmptyState
                title="Your cart is empty"
                description="Add a kit or handbook from the store catalog."
              />
            </li>
          ) : (
            items.map((item) => (
              <li
                key={item.productId}
                className="border-b border-[var(--ln-hairline)] py-5"
              >
                <p className="font-display text-lg text-[var(--ln-ink)]">
                  {item.title}
                </p>
                <p className="mt-1 font-mono text-[10px] tracking-[0.16em] text-[var(--ln-faint)] uppercase">
                  {item.type}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <label className="flex items-center gap-2 text-[var(--ln-muted)]">
                    Qty
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={item.quantity}
                      onChange={(e) =>
                        onQuantity(item.productId, Number(e.target.value) || 1)
                      }
                      className="w-16"
                    />
                  </label>
                  <span className="ln-tabular font-mono text-xs tracking-[0.08em] text-[var(--ln-signal)]">
                    {format(lineTotal(item, currency), currency)}
                  </span>
                  <button
                    type="button"
                    className="ml-auto font-mono text-[10px] tracking-[0.14em] text-[var(--ln-muted)] uppercase transition-colors hover:text-[var(--ln-halt)]"
                    onClick={() => onRemove(item.productId)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>

        <SheetFooter className="mt-auto gap-4 border-t border-[var(--ln-hairline)] pt-6 sm:flex-col">
          <p className="flex w-full items-baseline justify-between">
            <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--ln-faint)] uppercase">
              Total
            </span>
            <span className="ln-tabular font-display text-xl text-[var(--ln-ink)]">
              {format(total, currency)}
            </span>
          </p>
          {items.length === 0 ? (
            <Button type="button" className="w-full" disabled>
              Checkout
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link href="/store/checkout" onClick={onClose}>
                Checkout
              </Link>
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
