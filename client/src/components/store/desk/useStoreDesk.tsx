"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchStoreProducts,
  type StoreProduct,
} from "@/lib/api-client";
import { useCart, type CartItem } from "@/hooks/useCart";

export type StoreCurrency = "NGN" | "USD";

type StorePointer = { x: number; y: number; active: boolean };

type StoreDeskState = {
  products: StoreProduct[];
  loading: boolean;
  error: string | null;
  currency: StoreCurrency;
  setCurrency: (c: StoreCurrency) => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  product: StoreProduct | null;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (product: StoreProduct) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  pointer: StorePointer;
  setPointer: (p: StorePointer) => void;
  reducedMotion: boolean;
};

const StoreDeskContext = createContext<StoreDeskState | null>(null);

export function useStoreDesk() {
  const ctx = useContext(StoreDeskContext);
  if (!ctx) throw new Error("useStoreDesk requires StoreDeskProvider");
  return ctx;
}

export function StoreDeskProvider({ children }: { children: ReactNode }) {
  const cart = useCart();
  const [currency, setCurrency] = useState<StoreCurrency>("NGN");
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndexState] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [pointer, setPointer] = useState<StorePointer>({
    x: 0.72,
    y: 0.3,
    active: false,
  });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchStoreProducts(currency);
        if (!cancelled) {
          setProducts(data.products);
          setActiveIndexState(0);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load products",
          );
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

  const setActiveIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= products.length) return;
      setActiveIndexState(index);
    },
    [products.length],
  );

  const product = products[activeIndex] ?? products[0] ?? null;

  const addToCart = useCallback(
    (p: StoreProduct) => {
      cart.addItem({
        productId: p.id,
        slug: p.slug,
        title: p.title,
        type: p.type,
        unitPriceNgn: p.priceNgn.amountMinor,
        unitPriceUsd: p.priceUsd.amountMinor,
      });
      setCartOpen(true);
    },
    [cart],
  );

  const value = useMemo(
    () => ({
      products,
      loading,
      error,
      currency,
      setCurrency,
      activeIndex,
      setActiveIndex,
      product,
      cartOpen,
      setCartOpen,
      cartItems: cart.items,
      cartCount: cart.count,
      addToCart,
      setQuantity: cart.setQuantity,
      removeItem: cart.removeItem,
      pointer,
      setPointer,
      reducedMotion,
    }),
    [
      products,
      loading,
      error,
      currency,
      activeIndex,
      setActiveIndex,
      product,
      cartOpen,
      cart.items,
      cart.count,
      addToCart,
      cart.setQuantity,
      cart.removeItem,
      pointer,
      reducedMotion,
    ],
  );

  return (
    <StoreDeskContext.Provider value={value}>
      {children}
    </StoreDeskContext.Provider>
  );
}
