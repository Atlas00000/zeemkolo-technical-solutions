"use client";

import { useEffect, useState } from "react";
import {
  fetchStoreProducts,
  type StoreProduct,
} from "@/lib/api-client";
import { useCart } from "@/hooks/useCart";
import { ProductCard } from "@/components/store/ProductCard";
import { CartDrawer } from "@/components/store/CartDrawer";

export function StoreCatalog() {
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useCart();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchStoreProducts(currency);
        if (!cancelled) {
          setProducts(data.products);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load products");
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [currency]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setCurrency("NGN")}
            className={`border px-3 py-1.5 ${
              currency === "NGN"
                ? "border-brand-signal text-brand-signal"
                : "border-brand-steel/25"
            }`}
          >
            NGN
          </button>
          <button
            type="button"
            onClick={() => setCurrency("USD")}
            className={`border px-3 py-1.5 ${
              currency === "USD"
                ? "border-brand-signal text-brand-signal"
                : "border-brand-steel/25"
            }`}
          >
            USD
          </button>
        </div>
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="border border-brand-steel/25 px-3 py-1.5 text-sm"
        >
          Cart ({cart.count})
        </button>
      </div>

      {error ? <p className="mt-6 text-brand-signal">{error}</p> : null}

      <div className="mt-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            currency={currency}
            onAdd={(p) => {
              cart.addItem({
                productId: p.id,
                slug: p.slug,
                title: p.title,
                type: p.type,
                unitPriceNgn: p.priceNgn.amountMinor,
                unitPriceUsd: p.priceUsd.amountMinor,
              });
              setCartOpen(true);
            }}
          />
        ))}
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
