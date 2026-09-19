"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { castForumVote } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type ThreadVoteProps = {
  score: number;
  viewerVote: number | null;
  threadId?: string;
  replyId?: string;
  canVote: boolean;
  onChange?: (next: { score: number; viewerVote: number | null }) => void;
};

/**
 * Vote control — mono Up/Dn, no triangle glyphs or boxed chrome.
 */
export function ThreadVote({
  score,
  viewerVote,
  threadId,
  replyId,
  canVote,
  onChange,
}: ThreadVoteProps) {
  const { getToken } = useAuth();
  const [busy, setBusy] = useState(false);
  const [localScore, setLocalScore] = useState(score);
  const [localVote, setLocalVote] = useState(viewerVote);
  const [error, setError] = useState<string | null>(null);

  async function cast(value: 1 | -1) {
    if (!canVote || busy) return;
    setBusy(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Sign in required");
      const result = await castForumVote({ threadId, replyId, value }, token);
      const prev = localVote ?? 0;
      const nextValue = result.value;
      const nextScore = localScore - prev + nextValue;
      setLocalScore(nextScore);
      setLocalVote(nextValue === 0 ? null : nextValue);
      onChange?.({
        score: nextScore,
        viewerVote: nextValue === 0 ? null : nextValue,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vote failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="flex shrink-0 flex-col items-center gap-1.5"
      data-thread-vote
    >
      <button
        type="button"
        disabled={!canVote || busy}
        onClick={() => void cast(1)}
        className={cn(
          "font-mono text-[10px] tracking-[0.16em] uppercase transition-colors disabled:opacity-40",
          localVote === 1
            ? "text-[var(--ln-signal)]"
            : "text-[var(--ln-faint)] hover:text-[var(--ln-ink)]",
        )}
        aria-label="Upvote"
        aria-pressed={localVote === 1}
      >
        Up
      </button>
      <span className="ln-tabular font-mono text-sm tracking-[0.08em] text-[var(--ln-ink)]">
        {localScore}
      </span>
      <button
        type="button"
        disabled={!canVote || busy}
        onClick={() => void cast(-1)}
        className={cn(
          "font-mono text-[10px] tracking-[0.16em] uppercase transition-colors disabled:opacity-40",
          localVote === -1
            ? "text-[var(--ln-signal)]"
            : "text-[var(--ln-faint)] hover:text-[var(--ln-ink)]",
        )}
        aria-label="Downvote"
        aria-pressed={localVote === -1}
      >
        Dn
      </button>
      {error ? (
        <p className="max-w-[4.5rem] text-center text-[10px] text-[var(--ln-halt)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
