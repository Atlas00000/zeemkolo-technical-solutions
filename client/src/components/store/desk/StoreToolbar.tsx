"use client";

import { useStoreDesk, type StoreCurrency } from "./useStoreDesk";

/**
 * Currency segment + cart trigger — hairlines, not twin boxed buttons.
 */
export function StoreToolbar() {
  const { currency, setCurrency, cartCount, setCartOpen } = useStoreDesk();

  const currencies: StoreCurrency[] = ["NGN", "USD"];

  return (
    <div
      className="mt-10 flex flex-wrap items-end justify-between gap-6 border-b border-[var(--ln-hairline)] pb-4"
      data-store-toolbar
    >
      <div role="group" aria-label="Currency" className="flex gap-1">
        {currencies.map((c) => {
          const active = currency === c;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={active}
              onClick={() => setCurrency(c)}
              className={
                active
                  ? "border-b-2 border-[var(--ln-signal)] px-3 py-2 font-mono text-xs tracking-[0.18em] text-[var(--ln-ink)] uppercase"
                  : "border-b-2 border-transparent px-3 py-2 font-mono text-xs tracking-[0.18em] text-[var(--ln-muted)] uppercase transition-colors hover:text-[var(--ln-ink)]"
              }
            >
              {c}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setCartOpen(true)}
        aria-haspopup="dialog"
        className="group flex items-baseline gap-3 font-display text-base text-[var(--ln-ink)] transition-colors hover:text-[var(--ln-signal)] md:text-lg"
      >
        <span>Cart</span>
        <span className="ln-tabular font-mono text-xs tracking-[0.14em] text-[var(--ln-signal)]">
          {String(cartCount).padStart(2, "0")}
        </span>
      </button>
    </div>
  );
}
