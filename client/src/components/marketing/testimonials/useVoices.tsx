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
  VOICES_CATALOG,
  VOICES_ROTATE_MS,
  type VoiceEntry,
} from "./voices-data";

type VoicesState = {
  active: number;
  entry: VoiceEntry;
  setActive: (index: number) => void;
  paused: boolean;
  setPaused: (v: boolean) => void;
  reducedMotion: boolean;
  /** 0–1 progress through current auto-advance window */
  progress: number;
};

const VoicesContext = createContext<VoicesState | null>(null);

export function useVoices() {
  const ctx = useContext(VoicesContext);
  if (!ctx) throw new Error("useVoices requires VoicesProvider");
  return ctx;
}

export function VoicesProvider({ children }: { children: ReactNode }) {
  const [active, setActiveState] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setActive = useCallback((index: number) => {
    setActiveState(
      ((index % VOICES_CATALOG.length) + VOICES_CATALOG.length) %
        VOICES_CATALOG.length,
    );
    setProgress(0);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;

    const started = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - started;
      const p = Math.min(1, elapsed / VOICES_ROTATE_MS);
      setProgress(p);
      if (p >= 1) {
        setActiveState((i) => (i + 1) % VOICES_CATALOG.length);
        setProgress(0);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, paused, reducedMotion]);

  const value = useMemo(
    () => ({
      active,
      entry: VOICES_CATALOG[active]!,
      setActive,
      paused,
      setPaused,
      reducedMotion,
      progress,
    }),
    [active, setActive, paused, reducedMotion, progress],
  );

  return (
    <VoicesContext.Provider value={value}>{children}</VoicesContext.Provider>
  );
}
