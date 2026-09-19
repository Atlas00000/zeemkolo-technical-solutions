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
  SPOTLIGHT_GATES,
  type SpotlightGateId,
} from "./spotlight-data";

type SpotlightState = {
  activeGate: SpotlightGateId;
  setActiveGate: (id: SpotlightGateId) => void;
  /** Sticky demo claim (click-locked) */
  claimed: boolean;
  setClaimed: (v: boolean) => void;
  /** Transient hover/focus preview on the matric */
  previewing: boolean;
  setPreviewing: (v: boolean) => void;
  /** claimed || previewing — drives gate allow visuals */
  live: boolean;
  reducedMotion: boolean;
};

const SpotlightContext = createContext<SpotlightState | null>(null);

export function useSpotlight() {
  const ctx = useContext(SpotlightContext);
  if (!ctx) throw new Error("useSpotlight requires SpotlightProvider");
  return ctx;
}

export function SpotlightProvider({ children }: { children: ReactNode }) {
  const [activeGate, setActiveGateState] = useState<SpotlightGateId>("library");
  const [claimed, setClaimed] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setActiveGate = useCallback((id: SpotlightGateId) => {
    if (SPOTLIGHT_GATES.some((g) => g.id === id)) setActiveGateState(id);
  }, []);

  const live = claimed || previewing;

  const value = useMemo(
    () => ({
      activeGate,
      setActiveGate,
      claimed,
      setClaimed,
      previewing,
      setPreviewing,
      live,
      reducedMotion,
    }),
    [activeGate, setActiveGate, claimed, previewing, live, reducedMotion],
  );

  return (
    <SpotlightContext.Provider value={value}>{children}</SpotlightContext.Provider>
  );
}
