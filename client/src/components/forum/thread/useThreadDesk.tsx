"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";
import type { ForumThreadDetail } from "@/lib/api-client";
import { fetchMe } from "@/lib/api-client";

type ThreadPointer = { x: number; y: number; active: boolean };

type ThreadDeskState = {
  thread: ForumThreadDetail;
  canWrite: boolean;
  canVote: boolean;
  pointer: ThreadPointer;
  setPointer: (p: ThreadPointer) => void;
  reducedMotion: boolean;
};

const ThreadDeskContext = createContext<ThreadDeskState | null>(null);

export function useThreadDesk() {
  const ctx = useContext(ThreadDeskContext);
  if (!ctx) throw new Error("useThreadDesk requires ThreadDeskProvider");
  return ctx;
}

export function ThreadDeskProvider({
  thread,
  children,
}: {
  thread: ForumThreadDetail;
  children: ReactNode;
}) {
  const { getToken, isSignedIn } = useAuth();
  const [canWrite, setCanWrite] = useState(false);
  const [pointer, setPointer] = useState<ThreadPointer>({
    x: 0.65,
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

  useEffect(() => {
    let cancelled = false;
    async function loadRole() {
      if (!isSignedIn) {
        setCanWrite(false);
        return;
      }
      try {
        const token = await getToken();
        if (!token) return;
        const me = await fetchMe(token);
        if (!cancelled) {
          setCanWrite(me.role === "ZEEMBLE_STUDENT" || me.role === "ADMIN");
        }
      } catch {
        if (!cancelled) setCanWrite(false);
      }
    }
    void loadRole();
    return () => {
      cancelled = true;
    };
  }, [getToken, isSignedIn]);

  const value = useMemo(
    () => ({
      thread,
      canWrite,
      canVote: canWrite,
      pointer,
      setPointer,
      reducedMotion,
    }),
    [thread, canWrite, pointer, reducedMotion],
  );

  return (
    <ThreadDeskContext.Provider value={value}>
      {children}
    </ThreadDeskContext.Provider>
  );
}
