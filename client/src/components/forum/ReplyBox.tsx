"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createForumReply } from "@/lib/api-client";
import { EnrollBanner } from "@/components/forum/EnrollBanner";
import { Button } from "@/design/primitives/Button";

type ReplyBoxProps = {
  threadId: string;
  parentId?: string | null;
  canWrite: boolean;
  locked?: boolean;
  compact?: boolean;
  onPosted?: () => void;
};

const fieldClass =
  "mt-2 w-full border-0 border-b border-[var(--ln-hairline-strong)] bg-transparent px-0 py-2 text-sm text-[var(--ln-ink)] outline-none transition-colors focus:border-[var(--ln-signal)]";

/**
 * Reply composer — open plane, hairline field. No boxed Surface.
 */
export function ReplyBox({
  threadId,
  parentId,
  canWrite,
  locked,
  compact,
  onPosted,
}: ReplyBoxProps) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(!compact);

  if (locked) {
    return (
      <p className="font-mono text-[10px] tracking-[0.16em] text-[var(--ln-mark)] uppercase">
        Locked — replies closed
      </p>
    );
  }

  if (!canWrite) {
    if (compact) return null;
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
      if (compact) setOpen(false);
      onPosted?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post reply");
    } finally {
      setBusy(false);
    }
  }

  if (compact && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-mono text-[10px] tracking-[0.16em] text-[var(--ln-signal)] uppercase transition-colors hover:text-[var(--ln-ink)]"
      >
        Reply
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className={
        compact
          ? "space-y-3 border-t border-[var(--ln-hairline)] pt-4"
          : "space-y-4 border-t border-[var(--ln-signal)] pt-6"
      }
      data-forum-reply-box
    >
      <label className="block font-mono text-[10px] tracking-[0.16em] text-[var(--ln-faint)] uppercase">
        {parentId ? "Nested reply" : "Your reply"}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          minLength={2}
          rows={compact ? 3 : 4}
          className={fieldClass}
        />
      </label>
      {error ? (
        <p className="text-sm text-[var(--ln-halt)]" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy} size="sm">
          {busy ? "Posting…" : "Post reply"}
        </Button>
        {compact ? (
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setBody("");
            }}
            className="font-mono text-[10px] tracking-[0.14em] text-[var(--ln-faint)] uppercase hover:text-[var(--ln-ink)]"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
