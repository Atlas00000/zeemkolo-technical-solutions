"use client";

import Link from "next/link";
import { Badge } from "@/design/primitives/Badge";
import { Button } from "@/design/primitives/Button";
import { Text } from "@/design/primitives/Text";
import { gateTone, publishGate } from "@/design/map/backend-status";
import { useLibrary } from "./useLibrary";

const MODULE_PREVIEW = 4;

/**
 * Course stage — gate meta, module outline as hairlines, CTAs. No cards.
 */
export function LibraryStage() {
  const { course, reducedMotion } = useLibrary();

  const firstLesson = course.modules[0]?.lessons[0];
  const lessonCount = course.modules.reduce((n, m) => n + m.lessons.length, 0);
  const outline = course.modules.slice(0, MODULE_PREVIEW);

  return (
    <div
      key={course.id}
      data-library-stage
      className={
        reducedMotion
          ? "relative min-w-0 flex-[1.15] border-t border-[var(--ln-signal)] pt-8 lg:border-t-0 lg:border-l lg:pl-12 lg:pt-0"
          : "library-stage-enter relative min-w-0 flex-[1.15] border-t border-[var(--ln-signal)] pt-8 lg:border-t-0 lg:border-l lg:pl-12 lg:pt-0"
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={gateTone(publishGate(true))}>Published</Badge>
        <Text variant="meta">
          <span className="ln-tabular">{course.modules.length}</span> modules
          {" · "}
          <span className="ln-tabular">{lessonCount}</span> lessons
        </Text>
      </div>

      <h2 className="mt-5 font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.08] tracking-[-0.03em] text-[var(--ln-ink)]">
        <Link
          href={`/zeemble/courses/${course.slug}`}
          className="transition-colors hover:text-[var(--ln-signal)]"
        >
          {course.title}
        </Link>
      </h2>

      {course.description ? (
        <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-[var(--ln-muted)] md:text-base">
          {course.description}
        </p>
      ) : null}

      {outline.length > 0 ? (
        <ol className="mt-8 border-t border-[var(--ln-hairline)]" aria-label="Module outline">
          {outline.map((mod, i) => (
            <li
              key={mod.id}
              className="flex items-baseline gap-4 border-b border-[var(--ln-hairline)] py-3"
            >
              <span className="ln-tabular shrink-0 font-mono text-[10px] tracking-[0.16em] text-[var(--ln-signal)]">
                M{String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 font-display text-base text-[var(--ln-ink)] md:text-lg">
                {mod.title}
              </span>
              <span className="ln-tabular ml-auto shrink-0 font-mono text-[10px] tracking-[0.12em] text-[var(--ln-faint)]">
                {mod.lessons.length}L
              </span>
            </li>
          ))}
          {course.modules.length > MODULE_PREVIEW ? (
            <li className="py-3 font-mono text-[10px] tracking-[0.16em] text-[var(--ln-faint)] uppercase">
              +{course.modules.length - MODULE_PREVIEW} more modules
            </li>
          ) : null}
        </ol>
      ) : null}

      {firstLesson ? (
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link
              href={`/zeemble/courses/${course.slug}/${firstLesson.slug}`}
            >
              Start course
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href={`/zeemble/courses/${course.slug}`}>Overview</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
