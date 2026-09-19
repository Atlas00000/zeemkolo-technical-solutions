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
import type { LmsCourse } from "@/lib/api-client";

type LibraryPointer = { x: number; y: number; active: boolean };

type LibraryState = {
  courses: LmsCourse[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  course: LmsCourse;
  pointer: LibraryPointer;
  setPointer: (p: LibraryPointer) => void;
  reducedMotion: boolean;
};

const LibraryContext = createContext<LibraryState | null>(null);

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary requires LibraryProvider");
  return ctx;
}

export function LibraryProvider({
  courses,
  children,
}: {
  courses: LmsCourse[];
  children: ReactNode;
}) {
  const [activeIndex, setActiveIndexState] = useState(0);
  const [pointer, setPointer] = useState<LibraryPointer>({
    x: 0.72,
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
    if (activeIndex >= courses.length) {
      setActiveIndexState(Math.max(0, courses.length - 1));
    }
  }, [courses.length, activeIndex]);

  const setActiveIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= courses.length) return;
      setActiveIndexState(index);
    },
    [courses.length],
  );

  const course = courses[activeIndex] ?? courses[0]!;

  const value = useMemo(
    () => ({
      courses,
      activeIndex,
      setActiveIndex,
      course,
      pointer,
      setPointer,
      reducedMotion,
    }),
    [courses, activeIndex, setActiveIndex, course, pointer, reducedMotion],
  );

  if (!course) return null;

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}
