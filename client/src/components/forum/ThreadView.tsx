"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import type { ForumReplyNode, ForumThreadDetail } from "@/lib/api-client";
import { fetchMe } from "@/lib/api-client";
import { ReplyBox } from "@/components/forum/ReplyBox";
import { VoteWidget } from "@/components/forum/VoteWidget";

type ThreadViewProps = {
  thread: ForumThreadDetail;
};

function ReplyTree({
  replies,
  threadId,
  canWrite,
  locked,
  canVote,
  depth = 0,
}: {
  replies: ForumReplyNode[];
  threadId: string;
  canWrite: boolean;
  locked: boolean;
  canVote: boolean;
  depth?: number;
}) {
  return (
    <ul className="space-y-6">
      {replies.map((reply) => (
        <li key={reply.id} style={{ marginLeft: depth ? Math.min(depth, 4) * 16 : 0 }}>
          <div className="flex gap-4 border-t border-brand-steel/10 pt-4">
            <VoteWidget
              score={reply.score}
              viewerVote={reply.viewerVote}
              replyId={reply.id}
              canVote={canVote}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-brand-steel/70">
                {reply.author.fullName} · {new Date(reply.createdAt).toLocaleString()}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-brand-ink">{reply.body}</p>
              <div className="mt-3">
                <ReplyBox
                  threadId={threadId}
                  parentId={reply.id}
                  canWrite={canWrite}
                  locked={locked}
                />
              </div>
              {reply.children.length ? (
                <div className="mt-4">
                  <ReplyTree
                    replies={reply.children}
                    threadId={threadId}
                    canWrite={canWrite}
                    locked={locked}
                    canVote={canVote}
                    depth={depth + 1}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ThreadView({ thread }: ThreadViewProps) {
  const { getToken, isSignedIn } = useAuth();
  const [canWrite, setCanWrite] = useState(false);

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

  return (
    <div className="space-y-8">
      <header className="flex gap-4">
        <VoteWidget
          score={thread.score}
          viewerVote={thread.viewerVote}
          threadId={thread.id}
          canVote={canWrite}
        />
        <div>
          <p className="text-sm tracking-[0.14em] text-brand-steel uppercase">
            {thread.category.title}
          </p>
          <h1 className="mt-2 font-display text-3xl text-brand-ink md:text-4xl">
            {thread.title}
          </h1>
          <p className="mt-2 text-sm text-brand-steel/70">
            {thread.author.fullName} · {new Date(thread.createdAt).toLocaleString()}
            {thread.isLocked ? " · Locked" : ""}
          </p>
          <p className="mt-6 whitespace-pre-wrap leading-relaxed text-brand-ink">
            {thread.body}
          </p>
        </div>
      </header>

      <section>
        <h2 className="font-display text-2xl text-brand-ink">
          Replies ({thread.replyCount})
        </h2>
        <div className="mt-4">
          <ReplyTree
            replies={thread.replies}
            threadId={thread.id}
            canWrite={canWrite}
            locked={thread.isLocked}
            canVote={canWrite}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl text-brand-ink">Join the discussion</h2>
        <ReplyBox
          threadId={thread.id}
          canWrite={canWrite}
          locked={thread.isLocked}
        />
      </section>
    </div>
  );
}
