"use client";

import type { PointerEvent } from "react";
import Link from "next/link";
import type { ForumThreadDetail } from "@/lib/api-client";
import { ForumAtmosphere } from "@/components/forum/desk/ForumAtmosphere";
import { ThreadComposer } from "./ThreadComposer";
import { ThreadHeader } from "./ThreadHeader";
import { ThreadReplyTree } from "./ThreadReplyTree";
import { ThreadDeskProvider, useThreadDesk } from "./useThreadDesk";
import "./thread-motion.css";

function ThreadDeskInner() {
  const { setPointer, reducedMotion, pointer } = useThreadDesk();

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPointer({
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
      active: true,
    });
  }

  function onPointerLeave() {
    setPointer({ x: 0.65, y: 0.28, active: false });
  }

  const glowX =
    pointer.active && !reducedMotion
      ? `${pointer.x * 100}%`
      : "65%";
  const glowY =
    pointer.active && !reducedMotion
      ? `${pointer.y * 100}%`
      : "28%";
  const gridShiftX =
    pointer.active && !reducedMotion ? (pointer.x - 0.5) * 16 : 0;
  const gridShiftY =
    pointer.active && !reducedMotion ? (pointer.y - 0.5) * 10 : 0;

  return (
    <section
      className="relative isolate overflow-hidden text-[var(--ln-ink)]"
      data-thread-desk
      aria-label="Forum thread"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <ForumAtmosphere
        glowX={glowX}
        glowY={glowY}
        gridShiftX={gridShiftX}
        gridShiftY={gridShiftY}
        reducedMotion={reducedMotion}
      />

      <div className="relative z-10 mx-auto max-w-shell px-[var(--ln-page-x)] py-16 md:py-24">
        <div className="max-w-3xl border-t border-[var(--ln-signal)] pt-8">
          <ThreadHeader />
          <ThreadReplyTree />
          <ThreadComposer />
        </div>
        <Link
          href="/forum"
          className="mt-14 inline-block font-mono text-xs tracking-[0.16em] text-[var(--ln-signal)] uppercase transition-colors hover:text-[var(--ln-ink)]"
        >
          All threads
        </Link>
      </div>
    </section>
  );
}

/**
 * Thread detail desk — Header / Replies / Composer on forum atmosphere.
 */
export function ThreadDesk({ thread }: { thread: ForumThreadDetail }) {
  return (
    <ThreadDeskProvider thread={thread}>
      <ThreadDeskInner />
    </ThreadDeskProvider>
  );
}
