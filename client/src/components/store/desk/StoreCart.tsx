"use client";

import { StoreCartPanel } from "./StoreCartPanel";
import { useStoreDesk } from "./useStoreDesk";

/**
 * Catalog cart — wired to StoreDeskProvider.
 */
export function StoreCart() {
  const {
    cartOpen,
    setCartOpen,
    cartItems,
    currency,
    setQuantity,
    removeItem,
  } = useStoreDesk();

  return (
    <StoreCartPanel
      open={cartOpen}
      onClose={() => setCartOpen(false)}
      items={cartItems}
      currency={currency}
      onQuantity={setQuantity}
      onRemove={removeItem}
    />
  );
}
