"use client";

import { ReplyBox } from "@/components/forum/ReplyBox";
import { useThreadDesk } from "./useThreadDesk";

/**
 * Root reply composer — join the discussion band.
 */
export function ThreadComposer() {
  const { thread, canWrite } = useThreadDesk();

  return (
    <section className="mt-14 md:mt-16" data-thread-composer>
      <p className="mb-2 font-mono text-[10px] tracking-[0.22em] text-[var(--ln-faint)] uppercase">
        Compose
      </p>
      <h2 className="font-display text-xl tracking-tight text-[var(--ln-ink)] md:text-2xl">
        Join the discussion
      </h2>
      <div className="mt-6 max-w-2xl">
        <ReplyBox
          threadId={thread.id}
          canWrite={canWrite}
          locked={thread.isLocked}
        />
      </div>
    </section>
  );
}
