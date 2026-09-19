"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";

export type HeroPointer = {
  /** 0–1 within the hero bounds */
  x: number;
  /** 0–1 within the hero bounds */
  y: number;
  active: boolean;
  reducedMotion: boolean;
};

const DEFAULT: HeroPointer = {
  x: 0.72,
  y: 0.42,
  active: false,
  reducedMotion: true,
};

const HeroPointerContext = createContext<HeroPointer>(DEFAULT);

export function useHeroPointer() {
  return useContext(HeroPointerContext);
}

export function HeroPointerProvider({ children }: { children: ReactNode }) {
  const [pointer, setPointer] = useState<HeroPointer>(DEFAULT);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () =>
      setPointer((p) => ({ ...p, reducedMotion: mq.matches }));
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const onMove = useCallback((e: PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setPointer((p) =>
      p.reducedMotion
        ? p
        : {
            ...p,
            x: Math.min(1, Math.max(0, x)),
            y: Math.min(1, Math.max(0, y)),
            active: true,
          },
    );
  }, []);

  const onLeave = useCallback(() => {
    setPointer((p) => ({ ...p, active: false }));
  }, []);

  const value = useMemo(() => pointer, [pointer]);

  return (
    <HeroPointerContext.Provider value={value}>
      <div
        className="relative isolate min-h-[100svh] overflow-hidden"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        {children}
      </div>
    </HeroPointerContext.Provider>
  );
}
