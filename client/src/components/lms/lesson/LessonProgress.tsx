"use client";

import { useLessonDesk } from "./useLessonDesk";

/**
 * Course progress — hairline signal fill. Not a boxed meter.
 */
export function LessonProgress() {
  const { progress, reducedMotion } = useLessonDesk();
  if (!progress) return null;

  const value = Math.max(0, Math.min(100, progress.percentComplete));

  return (
    <div className="mb-8" data-lesson-progress>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--ln-faint)] uppercase">
          Course progress
        </p>
        <span className="ln-tabular font-mono text-xs tracking-[0.12em] text-[var(--ln-signal)]">
          {value}%
        </span>
      </div>
      <div className="mt-3 h-px w-full bg-[var(--ln-hairline)]" aria-hidden>
        <div
          className={
            reducedMotion
              ? "h-px bg-[var(--ln-signal)]"
              : "lesson-progress-fill h-px bg-[var(--ln-signal)]"
          }
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="mt-2 font-mono text-[10px] tracking-[0.14em] text-[var(--ln-faint)]">
        <span className="ln-tabular">{progress.completedCount}</span>
        {" / "}
        <span className="ln-tabular">{progress.totalLessons}</span>
        {" lessons"}
      </p>
    </div>
  );
}
