"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { castForumVote } from "@/lib/api-client";

type VoteWidgetProps = {
  score: number;
  viewerVote: number | null;
  threadId?: string;
  replyId?: string;
  canVote: boolean;
  onChange?: (next: { score: number; viewerVote: number | null }) => void;
};

export function VoteWidget({
  score,
  viewerVote,
  threadId,
  replyId,
  canVote,
  onChange,
}: VoteWidgetProps) {
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
    <div className="flex flex-col items-center gap-1 text-sm text-brand-steel">
      <button
        type="button"
        disabled={!canVote || busy}
        onClick={() => void cast(1)}
        className={`px-1 disabled:opacity-40 ${localVote === 1 ? "text-brand-signal" : ""}`}
        aria-label="Upvote"
      >
        ▲
      </button>
      <span className="font-mono text-brand-ink">{localScore}</span>
      <button
        type="button"
        disabled={!canVote || busy}
        onClick={() => void cast(-1)}
        className={`px-1 disabled:opacity-40 ${localVote === -1 ? "text-brand-signal" : ""}`}
        aria-label="Downvote"
      >
        ▼
      </button>
      {error ? <p className="max-w-[6rem] text-center text-xs text-brand-signal">{error}</p> : null}
    </div>
  );
}
