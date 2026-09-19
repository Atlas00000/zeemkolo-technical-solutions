"use client";

import type { KeyboardEvent } from "react";
import { useStoreDesk } from "./useStoreDesk";

/**
 * Product rail — drives the stage. Hairlines only.
 */
export function StoreRail() {
  const {
    products,
    activeIndex,
    setActiveIndex,
    currency,
    product,
  } = useStoreDesk();

  if (products.length === 0) return null;

  function onKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setActiveIndex((activeIndex + 1) % products.length);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveIndex((activeIndex - 1 + products.length) % products.length);
    }
  }

  return (
    <div className="min-w-0 flex-1 lg:max-w-md" data-store-rail-wrap>
      <p className="mb-2 font-mono text-[10px] tracking-[0.22em] text-[var(--ln-faint)] uppercase">
        Catalog
      </p>
      <ul
        className="flex min-w-0 flex-col"
        role="listbox"
        tabIndex={0}
        aria-label="Products"
        aria-activedescendant={
          product ? `store-product-${product.id}` : undefined
        }
        data-store-rail
        onKeyDown={onKeyDown}
      >
        {products.map((p, index) => {
          const isActive = index === activeIndex;
          const rowPrice = currency === "USD" ? p.priceUsd : p.priceNgn;
          return (
            <li key={p.id} role="none">
              <button
                type="button"
                role="option"
                id={`store-product-${p.id}`}
                aria-selected={isActive}
                tabIndex={-1}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
                className={
                  isActive
                    ? "store-rail-active group relative flex w-full flex-col gap-1 border-t border-[var(--ln-signal)] py-5 text-left outline-none md:py-6"
                    : "group relative flex w-full flex-col gap-1 border-t border-[var(--ln-hairline)] py-5 text-left outline-none transition-colors hover:border-[var(--ln-hairline-strong)] md:py-6"
                }
              >
                <span className="flex items-baseline gap-3">
                  <span
                    className={
                      isActive
                        ? "ln-tabular font-mono text-xs tracking-[0.14em] text-[var(--ln-signal)]"
                        : "ln-tabular font-mono text-xs tracking-[0.14em] text-[var(--ln-faint)]"
                    }
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={
                      isActive
                        ? "font-display text-lg text-[var(--ln-ink)] md:text-xl"
                        : "font-display text-lg text-[var(--ln-muted)] group-hover:text-[var(--ln-ink)] md:text-xl"
                    }
                  >
                    {p.title}
                  </span>
                </span>
                <span className="pl-8 font-mono text-xs tracking-[0.08em] text-[var(--ln-faint)]">
                  {rowPrice.formatted}
                </span>
                {isActive ? (
                  <span
                    className="store-rail-scan absolute inset-x-0 bottom-0 h-px bg-[var(--ln-signal)]"
                    aria-hidden
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
