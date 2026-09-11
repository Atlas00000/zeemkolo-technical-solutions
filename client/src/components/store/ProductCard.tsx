import type { StoreProduct } from "@/lib/api-client";

type ProductCardProps = {
  product: StoreProduct;
  currency: "NGN" | "USD";
  onAdd: (product: StoreProduct) => void;
};

export function ProductCard({ product, currency, onAdd }: ProductCardProps) {
  const price = currency === "USD" ? product.priceUsd : product.priceNgn;

  return (
    <article className="border-t border-brand-steel/15 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.14em] text-brand-steel uppercase">
            {product.type === "DIGITAL" ? "Digital" : "Physical"}
          </p>
          <h2 className="mt-1 font-display text-2xl text-brand-ink">{product.title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-brand-steel">
            {product.description}
          </p>
          <p className="mt-3 text-sm text-brand-steel/70">
            {price.formatted} · {product.stock} in stock
          </p>
        </div>
        <button
          type="button"
          onClick={() => onAdd(product)}
          disabled={product.stock < 1}
          className="bg-brand-signal px-4 py-2 text-sm text-white disabled:opacity-40"
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}
