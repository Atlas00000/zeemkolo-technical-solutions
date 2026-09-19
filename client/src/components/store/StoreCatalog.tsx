"use client";

import type { PointerEvent } from "react";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/feedback/UiState";
import {
  StoreCart,
  StoreDeskProvider,
  StoreField,
  StoreMasthead,
  StoreRail,
  StoreStage,
  StoreToolbar,
  useStoreDesk,
} from "./desk";
import "./desk/store-motion.css";

function StoreCatalogInner() {
  const {
    loading,
    error,
    product,
    products,
    setPointer,
    reducedMotion,
  } = useStoreDesk();

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPointer({
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
      active: true,
    });
  }

  function onPointerLeave() {
    setPointer({ x: 0.72, y: 0.3, active: false });
  }

  return (
    <section
      className="relative isolate overflow-hidden text-[var(--ln-ink)]"
      data-store-desk
      aria-label="Zeemkolo store"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <StoreField />

      <div className="relative z-10 mx-auto max-w-shell px-[var(--ln-page-x)] py-16 md:py-24">
        <StoreMasthead />
        <StoreToolbar />

        {loading ? (
          <div className="mt-12">
            <LoadingState label="Loading catalog…" />
          </div>
        ) : null}
        {!loading && error ? (
          <div className="mt-12">
            <ErrorState message={error} />
          </div>
        ) : null}
        {!loading && !error && products.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              title="No products yet"
              description="Published store items will appear here."
            />
          </div>
        ) : null}

        {!loading && !error && product ? (
          <div className="mt-12 flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
            <StoreRail />
            <StoreStage />
          </div>
        ) : null}

        <StoreCart />
      </div>
    </section>
  );
}

/**
 * Zeemkolo store catalog — Field / Masthead / Toolbar / Rail / Stage / Cart.
 */
export function StoreCatalog() {
  return (
    <StoreDeskProvider>
      <StoreCatalogInner />
    </StoreDeskProvider>
  );
}
