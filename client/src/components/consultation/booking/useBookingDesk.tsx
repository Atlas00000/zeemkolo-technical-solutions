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

export type BookingStep = 1 | 2 | 3;

export type BookingPointer = { x: number; y: number; active: boolean };

type BookingDeskState = {
  step: BookingStep;
  setStep: (s: BookingStep) => void;
  pointer: BookingPointer;
  setPointer: (p: BookingPointer) => void;
  reducedMotion: boolean;
};

const BookingDeskContext = createContext<BookingDeskState | null>(null);

export function useBookingDesk() {
  const ctx = useContext(BookingDeskContext);
  if (!ctx) throw new Error("useBookingDesk requires BookingDeskProvider");
  return ctx;
}

export function BookingDeskProvider({
  step,
  onStepChange,
  children,
}: {
  step: BookingStep;
  onStepChange?: (s: BookingStep) => void;
  children: ReactNode;
}) {
  const [pointer, setPointer] = useState<BookingPointer>({
    x: 0.72,
    y: 0.28,
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

  const setStep = useCallback(
    (s: BookingStep) => {
      onStepChange?.(s);
    },
    [onStepChange],
  );

  const value = useMemo(
    () => ({
      step,
      setStep,
      pointer,
      setPointer,
      reducedMotion,
    }),
    [step, setStep, pointer, reducedMotion],
  );

  return (
    <BookingDeskContext.Provider value={value}>
      {children}
    </BookingDeskContext.Provider>
  );
}
