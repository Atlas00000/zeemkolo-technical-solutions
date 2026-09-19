"use client";

import type { KeyboardEvent } from "react";
import { useForumDesk } from "./useForumDesk";

/**
 * Recent threads rail — drives the stage.
 */
export function ForumRail() {
  const { threads, activeIndex, setActiveIndex, thread } = useForumDesk();
  if (threads.length === 0) return null;

  function onKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setActiveIndex((activeIndex + 1) % threads.length);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveIndex((activeIndex - 1 + threads.length) % threads.length);
    }
  }

  return (
    <div className="min-w-0 flex-1 lg:max-w-md" data-forum-rail-wrap>
      <ul
        className="flex min-w-0 flex-col"
        role="listbox"
        tabIndex={0}
        aria-label="Recent threads"
        aria-activedescendant={
          thread ? `forum-thread-${thread.id}` : undefined
        }
        data-forum-rail
        onKeyDown={onKeyDown}
      >
        {threads.map((t, index) => {
          const isActive = index === activeIndex;
          return (
            <li key={t.id} role="none">
              <button
                type="button"
                role="option"
                id={`forum-thread-${t.id}`}
                aria-selected={isActive}
                tabIndex={-1}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
                className={
                  isActive
                    ? "forum-rail-active group relative flex w-full flex-col gap-1 border-t border-[var(--ln-signal)] py-5 text-left outline-none md:py-6"
                    : "group relative flex w-full flex-col gap-1 border-t border-[var(--ln-hairline)] py-5 text-left outline-none transition-colors hover:border-[var(--ln-hairline-strong)] md:py-6"
                }
              >
                <span className="flex items-baseline gap-3">
                  <span
                    className={
                      isActive
                        ? "ln-tabular font-mono text-xs tracking-[0.14em] text-[var(--ln-signal)]"
                        : "ln-tabular font-mono text-xs tracking-[0.14em] text-[var(--ln-faint)]"
                    }
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={
                      isActive
                        ? "font-display text-base text-[var(--ln-ink)] md:text-lg"
                        : "font-display text-base text-[var(--ln-muted)] group-hover:text-[var(--ln-ink)] md:text-lg"
                    }
                  >
                    {t.title}
                  </span>
                </span>
                <span
                  className={
                    isActive
                      ? "pl-8 text-sm text-[var(--ln-mark)]"
                      : "pl-8 text-sm text-[var(--ln-faint)]"
                  }
                >
                  {t.author.fullName}
                </span>
                {isActive ? (
                  <span
                    className="forum-rail-scan absolute inset-x-0 bottom-0 h-px bg-[var(--ln-signal)]"
                    aria-hidden
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
