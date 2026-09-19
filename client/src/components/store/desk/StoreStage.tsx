"use client";

import Link from "next/link";
import { Button } from "@/design/primitives/Button";
import { Text } from "@/design/primitives/Text";
import { useStoreDesk } from "./useStoreDesk";

/**
 * Product stage — type, title, price, CTAs. Open plane, no cards.
 */
export function StoreStage() {
  const { product, currency, reducedMotion, addToCart } = useStoreDesk();
  if (!product) return null;

  const price = currency === "USD" ? product.priceUsd : product.priceNgn;

  return (
    <div
      key={product.id}
      data-store-stage
      className={
        reducedMotion
          ? "relative min-w-0 flex-[1.15] border-t border-[var(--ln-signal)] pt-8 lg:border-t-0 lg:border-l lg:pl-12 lg:pt-0"
          : "store-stage-enter relative min-w-0 flex-[1.15] border-t border-[var(--ln-signal)] pt-8 lg:border-t-0 lg:border-l lg:pl-12 lg:pt-0"
      }
    >
      <p className="font-mono text-xs tracking-[0.22em] text-[var(--ln-signal)] uppercase">
        {product.type === "DIGITAL" ? "Digital" : "Physical"}
      </p>

      <h2 className="mt-4 font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.08] tracking-[-0.03em] text-[var(--ln-ink)]">
        <Link
          href={`/store/${product.slug}`}
          className="transition-colors hover:text-[var(--ln-signal)]"
        >
          {product.title}
        </Link>
      </h2>

      <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-[var(--ln-muted)] md:text-base">
        {product.description}
      </p>

      <Text variant="metric" className="mt-6 text-2xl">
        {price.formatted}
      </Text>
      <p className="mt-2 font-mono text-[10px] tracking-[0.14em] text-[var(--ln-faint)] uppercase">
        <span className="ln-tabular">{product.stock}</span> in stock
      </p>

      <div className="mt-9 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          disabled={product.stock < 1}
          onClick={() => addToCart(product)}
        >
          Add to cart
        </Button>
        <Button asChild variant="ghost">
          <Link href={`/store/${product.slug}`}>View product</Link>
        </Button>
      </div>
    </div>
  );
}
