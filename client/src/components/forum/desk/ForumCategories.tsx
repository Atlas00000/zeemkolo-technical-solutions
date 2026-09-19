"use client";

import { useForumDesk } from "./useForumDesk";

/**
 * Category strip — hairline meta rows, not badge pills.
 */
export function ForumCategories() {
  const { categories } = useForumDesk();
  if (categories.length === 0) return null;

  return (
    <div className="mt-12" data-forum-categories>
      <p className="mb-3 font-mono text-[10px] tracking-[0.22em] text-[var(--ln-faint)] uppercase">
        Channels
      </p>
      <ul className="flex flex-col border-t border-[var(--ln-hairline)] sm:flex-row sm:flex-wrap sm:gap-x-10">
        {categories.map((c) => (
          <li
            key={c.id}
            className="flex items-baseline justify-between gap-6 border-b border-[var(--ln-hairline)] py-3 sm:border-b-0 sm:py-4"
          >
            <span className="font-display text-base text-[var(--ln-ink)] md:text-lg">
              {c.title}
            </span>
            <span className="ln-tabular font-mono text-xs tracking-[0.12em] text-[var(--ln-signal)]">
              {String(c.threadCount).padStart(2, "0")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
