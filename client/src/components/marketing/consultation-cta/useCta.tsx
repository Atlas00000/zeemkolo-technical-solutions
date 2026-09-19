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
import { CTA_STEPS, type CtaStepId } from "./cta-data";

type CtaPointer = { x: number; y: number; active: boolean };

type CtaState = {
  activeStep: CtaStepId;
  setActiveStep: (id: CtaStepId) => void;
  pointer: CtaPointer;
  setPointer: (p: CtaPointer) => void;
  reducedMotion: boolean;
};

const CtaContext = createContext<CtaState | null>(null);

export function useCta() {
  const ctx = useContext(CtaContext);
  if (!ctx) throw new Error("useCta requires CtaProvider");
  return ctx;
}

export function CtaProvider({ children }: { children: ReactNode }) {
  const [activeStep, setActiveStepState] = useState<CtaStepId>("slot");
  const [pointer, setPointer] = useState<CtaPointer>({
    x: 0.7,
    y: 0.4,
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

  const setActiveStep = useCallback((id: CtaStepId) => {
    if (CTA_STEPS.some((s) => s.id === id)) setActiveStepState(id);
  }, []);

  const value = useMemo(
    () => ({
      activeStep,
      setActiveStep,
      pointer,
      setPointer,
      reducedMotion,
    }),
    [activeStep, setActiveStep, pointer, reducedMotion],
  );

  return <CtaContext.Provider value={value}>{children}</CtaContext.Provider>;
}
