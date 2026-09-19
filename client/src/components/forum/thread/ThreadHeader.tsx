"use client";

import { ThreadVote } from "./ThreadVote";
import { useThreadDesk } from "./useThreadDesk";

/**
 * OP header — category signal, display title, body. Vote rail on the left.
 */
export function ThreadHeader() {
  const { thread, canVote, reducedMotion } = useThreadDesk();

  return (
    <header
      className={
        reducedMotion
          ? "flex gap-6 md:gap-8"
          : "thread-stage-enter flex gap-6 md:gap-8"
      }
      data-thread-header
    >
      <ThreadVote
        score={thread.score}
        viewerVote={thread.viewerVote}
        threadId={thread.id}
        canVote={canVote}
      />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--ln-signal)] uppercase">
          {thread.category.title}
          {thread.isLocked ? " · Locked" : ""}
        </p>
        <h1 className="mt-4 font-display text-[clamp(1.85rem,4vw,3rem)] leading-[1.08] tracking-[-0.035em] text-[var(--ln-ink)]">
          {thread.title}
        </h1>
        <p className="mt-3 text-sm text-[var(--ln-faint)]">
          <span className="text-[var(--ln-mark)]">{thread.author.fullName}</span>
          {" · "}
          {new Date(thread.createdAt).toLocaleString()}
        </p>
        <div
          className="mt-6 h-px w-20 bg-[var(--ln-signal)] md:w-28"
          aria-hidden
        />
        <p className="mt-6 whitespace-pre-wrap text-pretty text-base leading-relaxed text-[var(--ln-ink)] md:text-lg">
          {thread.body}
        </p>
      </div>
    </header>
  );
}
