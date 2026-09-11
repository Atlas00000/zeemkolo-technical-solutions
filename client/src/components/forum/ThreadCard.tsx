import Link from "next/link";
import type { ForumThreadSummary } from "@/lib/api-client";

type ThreadCardProps = {
  thread: ForumThreadSummary;
};

export function ThreadCard({ thread }: ThreadCardProps) {
  return (
    <article className="border-t border-brand-steel/15 py-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {thread.isPinned ? (
          <span className="text-xs tracking-[0.14em] text-brand-signal uppercase">
            Pinned
          </span>
        ) : null}
        <span className="text-xs text-brand-steel/70">{thread.category.title}</span>
      </div>
      <h2 className="mt-1 font-display text-xl text-brand-ink">
        <Link
          href={`/forum/threads/${thread.id}`}
          className="hover:text-brand-signal"
        >
          {thread.title}
        </Link>
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-brand-steel">{thread.bodyPreview}</p>
      <p className="mt-3 text-xs text-brand-steel/70">
        {thread.author.fullName} · {thread.replyCount} replies · score {thread.score} ·{" "}
        {new Date(thread.createdAt).toLocaleDateString()}
      </p>
    </article>
  );
}
