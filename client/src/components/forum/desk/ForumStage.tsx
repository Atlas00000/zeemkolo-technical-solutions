"use client";

import Link from "next/link";
import { Button } from "@/design/primitives/Button";
import { useForumDesk } from "./useForumDesk";

/**
 * Thread stage — category, title, preview, meta, open CTA.
 */
export function ForumStage() {
  const { thread, reducedMotion } = useForumDesk();
  if (!thread) return null;

  return (
    <div
      key={thread.id}
      data-forum-stage
      className={
        reducedMotion
          ? "relative min-w-0 flex-[1.15] border-t border-[var(--ln-signal)] pt-8 lg:border-t-0 lg:border-l lg:pl-12 lg:pt-0"
          : "forum-stage-enter relative min-w-0 flex-[1.15] border-t border-[var(--ln-signal)] pt-8 lg:border-t-0 lg:border-l lg:pl-12 lg:pt-0"
      }
    >
      <p className="font-mono text-xs tracking-[0.22em] text-[var(--ln-signal)] uppercase">
        {thread.category.title}
      </p>

      <h3 className="mt-4 font-display text-[clamp(1.5rem,2.8vw,2.25rem)] leading-[1.1] tracking-[-0.03em] text-[var(--ln-ink)]">
        <Link
          href={`/forum/threads/${thread.id}`}
          className="transition-colors hover:text-[var(--ln-signal)]"
        >
          {thread.title}
        </Link>
      </h3>

      <p className="mt-3 text-sm text-[var(--ln-mark)]">{thread.author.fullName}</p>

      <p className="mt-5 max-w-md text-pretty text-sm leading-relaxed text-[var(--ln-muted)] md:text-base">
        {thread.bodyPreview}
      </p>

      <p className="mt-5 font-mono text-[10px] tracking-[0.14em] text-[var(--ln-faint)] uppercase">
        <span className="ln-tabular">{thread.replyCount}</span> replies
        {" · "}
        score <span className="ln-tabular">{thread.score}</span>
      </p>

      <div className="mt-8">
        <Button asChild>
          <Link href={`/forum/threads/${thread.id}`}>Open thread</Link>
        </Button>
      </div>
    </div>
  );
}
