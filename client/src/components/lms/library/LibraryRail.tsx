"use client";

import type { KeyboardEvent } from "react";
import { useLibrary } from "./useLibrary";

/**
 * Course rail — drives the stage. Hairlines only, keyboard listbox.
 */
export function LibraryRail() {
  const { courses, activeIndex, setActiveIndex } = useLibrary();

  function onKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setActiveIndex((activeIndex + 1) % courses.length);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveIndex((activeIndex - 1 + courses.length) % courses.length);
    }
  }

  const activeCourse = courses[activeIndex];

  return (
    <div className="min-w-0 flex-1 lg:max-w-md" data-library-rail-wrap>
      <p className="mb-2 font-mono text-[10px] tracking-[0.22em] text-[var(--ln-faint)] uppercase">
        Catalog
      </p>
      <ul
        className="flex min-w-0 flex-col"
        role="listbox"
        tabIndex={0}
        aria-label="Courses"
        aria-activedescendant={
          activeCourse ? `library-course-${activeCourse.id}` : undefined
        }
        data-library-rail
        onKeyDown={onKeyDown}
      >
        {courses.map((c, index) => {
          const isActive = index === activeIndex;
          return (
            <li key={c.id} role="none">
              <button
                type="button"
                role="option"
                id={`library-course-${c.id}`}
                aria-selected={isActive}
                tabIndex={-1}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
                className={
                  isActive
                    ? "library-rail-active group relative flex w-full items-baseline gap-4 border-t border-[var(--ln-signal)] py-5 text-left outline-none md:py-6"
                    : "group relative flex w-full items-baseline gap-4 border-t border-[var(--ln-hairline)] py-5 text-left outline-none transition-colors hover:border-[var(--ln-hairline-strong)] md:py-6"
                }
              >
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
                      ? "font-display text-lg text-[var(--ln-ink)] md:text-xl"
                      : "font-display text-lg text-[var(--ln-muted)] group-hover:text-[var(--ln-ink)] md:text-xl"
                  }
                >
                  {c.title}
                </span>
                {isActive ? (
                  <span
                    className="library-rail-scan absolute inset-x-0 bottom-0 h-px bg-[var(--ln-signal)]"
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
