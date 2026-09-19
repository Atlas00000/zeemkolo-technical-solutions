"use client";

import Link from "next/link";
import { LessonProgress } from "./LessonProgress";
import { useLessonDesk } from "./useLessonDesk";

/**
 * Module / lesson rail — open plane, hairlines. No inset Surface box.
 */
export function LessonNavRail() {
  const { course, courseSlug, lessonSlug, progress } = useLessonDesk();
  if (!course) return null;

  const completedMap = new Map(
    (progress?.lessons ?? []).map((l) => [l.id, l.completed]),
  );

  return (
    <aside className="min-w-0 lg:w-[min(100%,17.5rem)] lg:shrink-0" data-lesson-nav>
      <LessonProgress />

      <p className="mb-3 font-mono text-[10px] tracking-[0.22em] text-[var(--ln-faint)] uppercase">
        Syllabus
      </p>

      <nav aria-label="Course lessons" className="flex flex-col">
        {course.modules.map((mod, modIndex) => (
          <div
            key={mod.id}
            className="border-t border-[var(--ln-hairline)] pt-4 pb-5"
          >
            <p className="flex items-baseline gap-3">
              <span className="ln-tabular font-mono text-[10px] tracking-[0.14em] text-[var(--ln-signal)]">
                M{String(modIndex + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-sm text-[var(--ln-ink)] md:text-base">
                {mod.title}
              </span>
            </p>
            <ul className="mt-3 flex flex-col">
              {mod.lessons.map((lesson, lessonIndex) => {
                const active = lesson.slug === lessonSlug;
                const done = Boolean(completedMap.get(lesson.id));
                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/zeemble/courses/${courseSlug}/${lesson.slug}`}
                      aria-current={active ? "page" : undefined}
                      className={
                        active
                          ? "lesson-rail-active group relative flex w-full items-baseline gap-3 border-l-2 border-[var(--ln-signal)] py-2.5 pl-3 text-left outline-none"
                          : "group relative flex w-full items-baseline gap-3 border-l-2 border-transparent py-2.5 pl-3 text-left outline-none transition-colors hover:border-[var(--ln-hairline-strong)]"
                      }
                    >
                      <span
                        className={
                          active
                            ? "ln-tabular shrink-0 font-mono text-[10px] tracking-[0.12em] text-[var(--ln-signal)]"
                            : "ln-tabular shrink-0 font-mono text-[10px] tracking-[0.12em] text-[var(--ln-faint)]"
                        }
                      >
                        {String(lessonIndex + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={
                          active
                            ? "min-w-0 text-sm leading-snug text-[var(--ln-ink)]"
                            : "min-w-0 text-sm leading-snug text-[var(--ln-muted)] group-hover:text-[var(--ln-ink)]"
                        }
                      >
                        {lesson.title}
                      </span>
                      {done ? (
                        <span className="ml-auto shrink-0 font-mono text-[9px] tracking-[0.14em] text-[var(--ln-signal)] uppercase">
                          Done
                        </span>
                      ) : lesson.isPreview ? (
                        <span className="ml-auto shrink-0 font-mono text-[9px] tracking-[0.14em] text-[var(--ln-faint)] uppercase">
                          Preview
                        </span>
                      ) : null}
                      {active ? (
                        <span
                          className="lesson-rail-scan absolute inset-x-0 bottom-0 h-px bg-[var(--ln-signal)]"
                          aria-hidden
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
