"use client";

import type { ForumReplyNode } from "@/lib/api-client";
import { ReplyBox } from "@/components/forum/ReplyBox";
import { ThreadVote } from "./ThreadVote";
import { useThreadDesk } from "./useThreadDesk";

function ReplyNode({
  reply,
  depth = 0,
}: {
  reply: ForumReplyNode;
  depth?: number;
}) {
  const { thread, canWrite, canVote } = useThreadDesk();
  const indent = depth ? Math.min(depth, 4) * 1.25 : 0;

  return (
    <li
      className="border-t border-[var(--ln-hairline)] pt-6"
      style={{ marginLeft: indent ? `${indent}rem` : undefined }}
      data-thread-reply
    >
      <div className="flex gap-5 md:gap-6">
        <ThreadVote
          score={reply.score}
          viewerVote={reply.viewerVote}
          replyId={reply.id}
          canVote={canVote}
        />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] tracking-[0.12em] text-[var(--ln-faint)]">
            <span className="text-[var(--ln-mark)]">{reply.author.fullName}</span>
            {" · "}
            {new Date(reply.createdAt).toLocaleString()}
          </p>
          <p className="mt-3 whitespace-pre-wrap text-pretty text-sm leading-relaxed text-[var(--ln-ink)] md:text-base">
            {reply.body}
          </p>
          <div className="mt-4">
            <ReplyBox
              threadId={thread.id}
              parentId={reply.id}
              canWrite={canWrite}
              locked={thread.isLocked}
              compact
            />
          </div>
          {reply.children.length > 0 ? (
            <ul className="mt-6 space-y-6">
              {reply.children.map((child) => (
                <ReplyNode key={child.id} reply={child} depth={depth + 1} />
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </li>
  );
}

/**
 * Nested reply tree — hairline stack, no cards.
 */
export function ThreadReplyTree() {
  const { thread } = useThreadDesk();

  return (
    <section className="mt-14 md:mt-16" data-thread-replies>
      <p className="mb-2 font-mono text-[10px] tracking-[0.22em] text-[var(--ln-faint)] uppercase">
        Discussion
      </p>
      <h2 className="font-display text-2xl tracking-tight text-[var(--ln-ink)] md:text-3xl">
        Replies
        <span className="ln-tabular ml-3 font-mono text-sm tracking-[0.12em] text-[var(--ln-signal)]">
          {String(thread.replyCount).padStart(2, "0")}
        </span>
      </h2>

      {thread.replies.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--ln-muted)]">
          No replies yet. Be the first to respond.
        </p>
      ) : (
        <ul className="mt-8 space-y-6">
          {thread.replies.map((reply) => (
            <ReplyNode key={reply.id} reply={reply} />
          ))}
        </ul>
      )}
    </section>
  );
}
