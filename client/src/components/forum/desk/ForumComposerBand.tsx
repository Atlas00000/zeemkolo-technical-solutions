"use client";

import { ForumComposer } from "@/components/forum/ForumComposer";
import { useForumDesk } from "./useForumDesk";

/**
 * Composer band — wraps ForumComposer in an open plane (no boxed chrome here).
 */
export function ForumComposerBand() {
  const { categories } = useForumDesk();

  return (
    <div className="mt-14 max-w-2xl" data-forum-composer>
      <p className="mb-4 font-mono text-[10px] tracking-[0.22em] text-[var(--ln-faint)] uppercase">
        Start a thread
      </p>
      <ForumComposer
        categories={categories.map((c) => ({
          slug: c.slug,
          title: c.title,
        }))}
      />
    </div>
  );
}
