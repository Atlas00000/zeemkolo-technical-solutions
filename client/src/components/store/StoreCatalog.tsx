"use client";

import { useEffect, useState } from "react";
import {
  fetchStoreProducts,
  type StoreProduct,
} from "@/lib/api-client";
import { useCart } from "@/hooks/useCart";
import { ProductCard } from "@/components/store/ProductCard";
import { CartDrawer } from "@/components/store/CartDrawer";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/feedback/UiState";
import { Button } from "@/components/ui/button";

export function StoreCatalog() {
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useCart();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
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
      } finally {
        if (!cancelled) setLoading(false);
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

      {loading ? <LoadingState label="Loading catalog…" /> : null}
      {!loading && error ? <ErrorState message={error} /> : null}
      {!loading && !error && products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Published store items will appear here."
        />
      ) : null}

      {!loading && !error ? (
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
      ) : null}

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
