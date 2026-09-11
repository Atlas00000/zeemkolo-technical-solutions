"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createForumReply } from "@/lib/api-client";
import { EnrollBanner } from "@/components/forum/EnrollBanner";

type ReplyBoxProps = {
  threadId: string;
  parentId?: string | null;
  canWrite: boolean;
  locked?: boolean;
  onPosted?: () => void;
};

export function ReplyBox({
  threadId,
  parentId,
  canWrite,
  locked,
  onPosted,
}: ReplyBoxProps) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (locked) {
    return (
      <p className="text-sm text-brand-steel">This thread is locked. New replies are closed.</p>
    );
  }

  if (!canWrite) {
    return <EnrollBanner message="Enroll in Zeemble to reply" />;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Sign in required");
      await createForumReply(threadId, { body, parentId }, token);
      setBody("");
      onPosted?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post reply");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-3">
      <label className="block text-sm text-brand-steel">
        Your reply
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          minLength={2}
          rows={4}
          className="mt-1 w-full border border-brand-steel/25 bg-white px-3 py-2 text-brand-ink"
        />
      </label>
      {error ? <p className="text-sm text-brand-signal">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="bg-brand-signal px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {busy ? "Posting…" : "Post reply"}
      </button>
    </form>
  );
}
