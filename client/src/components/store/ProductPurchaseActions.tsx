"use client";

import { useState } from "react";
import type { StoreProduct } from "@/lib/api-client";
import { useCart } from "@/hooks/useCart";
import { CartDrawer } from "@/components/store/CartDrawer";
import { Button } from "@/components/ui/button";

export function ProductPurchaseActions({ product }: { product: StoreProduct }) {
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useCart();
  const price = currency === "USD" ? product.priceUsd : product.priceNgn;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2" role="group" aria-label="Currency">
          <Button
            type="button"
            size="sm"
            variant={currency === "NGN" ? "default" : "outline"}
            aria-pressed={currency === "NGN"}
            onClick={() => setCurrency("NGN")}
          >
            NGN
          </Button>
          <Button
            type="button"
            size="sm"
            variant={currency === "USD" ? "default" : "outline"}
            aria-pressed={currency === "USD"}
            onClick={() => setCurrency("USD")}
          >
            USD
          </Button>
        </div>
        <p className="text-sm text-foreground">{price.formatted}</p>
        <Button
          type="button"
          disabled={product.stock < 1}
          onClick={() => {
            cart.addItem({
              productId: product.id,
              slug: product.slug,
              title: product.title,
              type: product.type,
              unitPriceNgn: product.priceNgn.amountMinor,
              unitPriceUsd: product.priceUsd.amountMinor,
            });
            setCartOpen(true);
          }}
        >
          Add to cart
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setCartOpen(true)}
          aria-haspopup="dialog"
        >
          Cart ({cart.count})
        </Button>
      </div>
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart.items}
        currency={currency}
        onQuantity={cart.setQuantity}
        onRemove={cart.removeItem}
      />
    </div>
  );
}
