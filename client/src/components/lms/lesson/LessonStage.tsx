"use client";

import { LessonHeader } from "./LessonHeader";
import { LessonBody } from "./LessonBody";
import { useLessonDesk } from "./useLessonDesk";

/**
 * Lesson stage column — header + body.
 */
export function LessonStage() {
  const { lesson, reducedMotion } = useLessonDesk();
  if (!lesson) return null;

  return (
    <article
      key={lesson.id}
      className={
        reducedMotion
          ? "min-w-0 flex-1 border-t border-[var(--ln-signal)] pt-8 xl:border-t-0 xl:border-l xl:pl-12 xl:pt-0"
          : "lesson-stage-enter min-w-0 flex-1 border-t border-[var(--ln-signal)] pt-8 xl:border-t-0 xl:border-l xl:pl-12 xl:pt-0"
      }
      data-lesson-stage
    >
      <LessonHeader />
      <LessonBody />
    </article>
  );
}
