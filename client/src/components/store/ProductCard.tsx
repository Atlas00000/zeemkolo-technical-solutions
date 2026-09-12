import Link from "next/link";
import type { StoreProduct } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

type ProductCardProps = {
  product: StoreProduct;
  currency: "NGN" | "USD";
  onAdd: (product: StoreProduct) => void;
};

export function ProductCard({ product, currency, onAdd }: ProductCardProps) {
  const price = currency === "USD" ? product.priceUsd : product.priceNgn;

  return (
    <article className="border-t border-border py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
            {product.type === "DIGITAL" ? "Digital" : "Physical"}
          </p>
          <h2 className="mt-1 font-display text-2xl text-foreground">
            <Link
              href={`/store/${product.slug}`}
              className="hover:text-primary"
            >
              {product.title}
            </Link>
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {price.formatted} · {product.stock} in stock
          </p>
        </div>
        <Button
          type="button"
          onClick={() => onAdd(product)}
          disabled={product.stock < 1}
        >
          Add to cart
        </Button>
      </div>
    </article>
  );
}
