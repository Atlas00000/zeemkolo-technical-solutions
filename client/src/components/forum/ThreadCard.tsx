import Link from "next/link";
import type { ForumThreadSummary } from "@/lib/api-client";
import { Badge } from "@/design/primitives/Badge";
import { Text } from "@/design/primitives/Text";

type ThreadCardProps = {
  thread: ForumThreadSummary;
};

export function ThreadCard({ thread }: ThreadCardProps) {
  return (
    <article className="border-t border-[var(--ln-hairline)] py-5">
      <div className="flex flex-wrap items-center gap-2">
        {thread.isPinned ? <Badge tone="signal">Pinned</Badge> : null}
        <Text variant="meta">{thread.category.title}</Text>
      </div>
      <h2 className="mt-2 font-display text-xl tracking-tight text-[var(--ln-ink)]">
        <Link
          href={`/forum/threads/${thread.id}`}
          className="transition-colors hover:text-[var(--ln-signal)]"
        >
          {thread.title}
        </Link>
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--ln-muted)]">
        {thread.bodyPreview}
      </p>
      <p className="mt-3 text-xs text-[var(--ln-faint)]">
        {thread.author.fullName} ·{" "}
        <span className="ln-tabular">{thread.replyCount}</span> replies · score{" "}
        <span className="ln-tabular">{thread.score}</span> ·{" "}
        {new Date(thread.createdAt).toLocaleDateString()}
      </p>
    </article>
  );
}
