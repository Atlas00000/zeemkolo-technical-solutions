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
  SUPPORT_FIT,
  type FitId,
  type TimelineSide,
} from "./support-data";

type SupportPointer = { x: number; y: number; active: boolean };

type SupportState = {
  fitId: FitId;
  setFitId: (id: FitId) => void;
  timeline: TimelineSide;
  setTimeline: (side: TimelineSide) => void;
  pointer: SupportPointer;
  setPointer: (p: SupportPointer) => void;
  reducedMotion: boolean;
};

const SupportContext = createContext<SupportState | null>(null);

export function useSupport() {
  const ctx = useContext(SupportContext);
  if (!ctx) throw new Error("useSupport requires SupportProvider");
  return ctx;
}

export function SupportProvider({ children }: { children: ReactNode }) {
  const [fitId, setFitIdState] = useState<FitId>(SUPPORT_FIT[0]!.id);
  const [timeline, setTimeline] = useState<TimelineSide>("before");
  const [pointer, setPointer] = useState<SupportPointer>({
    x: 0.65,
    y: 0.35,
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

  const setFitId = useCallback((id: FitId) => {
    if (SUPPORT_FIT.some((f) => f.id === id)) setFitIdState(id);
  }, []);

  const value = useMemo(
    () => ({
      fitId,
      setFitId,
      timeline,
      setTimeline,
      pointer,
      setPointer,
      reducedMotion,
    }),
    [fitId, setFitId, timeline, pointer, reducedMotion],
  );

  return (
    <SupportContext.Provider value={value}>{children}</SupportContext.Provider>
  );
}
