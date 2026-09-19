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
import { SERVICES_CATALOG, type ServiceEntry } from "./services-catalog";

type ServicesSelection = {
  active: number;
  entry: ServiceEntry;
  setActive: (index: number) => void;
  reducedMotion: boolean;
};

const ServicesSelectionContext = createContext<ServicesSelection | null>(null);

export function useServicesSelection() {
  const ctx = useContext(ServicesSelectionContext);
  if (!ctx) {
    throw new Error("useServicesSelection requires ServicesSelectionProvider");
  }
  return ctx;
}

export function ServicesSelectionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [active, setActiveState] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setActive = useCallback((index: number) => {
    setActiveState(Math.max(0, Math.min(SERVICES_CATALOG.length - 1, index)));
  }, []);

  const value = useMemo(
    () => ({
      active,
      entry: SERVICES_CATALOG[active]!,
      setActive,
      reducedMotion,
    }),
    [active, setActive, reducedMotion],
  );

  return (
    <ServicesSelectionContext.Provider value={value}>
      {children}
    </ServicesSelectionContext.Provider>
  );
}
