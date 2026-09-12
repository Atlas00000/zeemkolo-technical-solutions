"use client";

import Link from "next/link";
import type { CartItem } from "@/hooks/useCart";
import { EmptyState } from "@/components/feedback/UiState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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
  const total = items.reduce((sum, item) => sum + lineTotal(item, currency), 0);

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Cart</SheetTitle>
        </SheetHeader>

        <ul className="mt-4 flex-1 space-y-4 overflow-y-auto px-1">
          {items.length === 0 ? (
            <li>
              <EmptyState
                title="Your cart is empty"
                description="Add a kit or handbook from the store catalog."
              />
            </li>
          ) : (
            items.map((item) => (
              <li key={item.productId} className="border-b border-border pb-4">
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.type}</p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <label className="flex items-center gap-2">
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
                  <span className="text-muted-foreground">
                    {format(lineTotal(item, currency), currency)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-primary"
                    onClick={() => onRemove(item.productId)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))
          )}
        </ul>

        <Separator className="my-4" />
        <SheetFooter className="gap-3 sm:flex-col">
          <p className="flex w-full justify-between text-sm text-foreground">
            <span>Total</span>
            <span>{format(total, currency)}</span>
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
