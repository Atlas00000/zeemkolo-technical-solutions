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
import type { ForumCategory, ForumThreadSummary } from "@/lib/api-client";

type ForumPointer = { x: number; y: number; active: boolean };

type ForumDeskState = {
  categories: ForumCategory[];
  threads: ForumThreadSummary[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  thread: ForumThreadSummary | null;
  pointer: ForumPointer;
  setPointer: (p: ForumPointer) => void;
  reducedMotion: boolean;
};

const ForumDeskContext = createContext<ForumDeskState | null>(null);

export function useForumDesk() {
  const ctx = useContext(ForumDeskContext);
  if (!ctx) throw new Error("useForumDesk requires ForumDeskProvider");
  return ctx;
}

export function ForumDeskProvider({
  categories,
  threads,
  children,
}: {
  categories: ForumCategory[];
  threads: ForumThreadSummary[];
  children: ReactNode;
}) {
  const [activeIndex, setActiveIndexState] = useState(0);
  const [pointer, setPointer] = useState<ForumPointer>({
    x: 0.7,
    y: 0.32,
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
    if (activeIndex >= threads.length) {
      setActiveIndexState(Math.max(0, threads.length - 1));
    }
  }, [threads.length, activeIndex]);

  const setActiveIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= threads.length) return;
      setActiveIndexState(index);
    },
    [threads.length],
  );

  const thread = threads[activeIndex] ?? threads[0] ?? null;

  const value = useMemo(
    () => ({
      categories,
      threads,
      activeIndex,
      setActiveIndex,
      thread,
      pointer,
      setPointer,
      reducedMotion,
    }),
    [
      categories,
      threads,
      activeIndex,
      setActiveIndex,
      thread,
      pointer,
      reducedMotion,
    ],
  );

  return (
    <ForumDeskContext.Provider value={value}>
      {children}
    </ForumDeskContext.Provider>
  );
}
