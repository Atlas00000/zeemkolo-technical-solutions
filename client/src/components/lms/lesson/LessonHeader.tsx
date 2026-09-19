"use client";

import { Badge } from "@/design/primitives/Badge";
import { Button } from "@/design/primitives/Button";
import { gateTone } from "@/design/map/backend-status";
import { useLessonDesk } from "./useLessonDesk";

/**
 * Lesson stage header — module signal, title, completion action.
 */
export function LessonHeader() {
  const {
    lesson,
    isSignedIn,
    isComplete,
    saving,
    error,
    toggleComplete,
  } = useLessonDesk();

  if (!lesson) return null;

  return (
    <header
      className="border-b border-[var(--ln-hairline)] pb-8"
      data-lesson-header
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--ln-signal)] uppercase">
          {lesson.module.title}
        </p>
        {lesson.gated ? (
          <Badge tone={gateTone("halt")}>Gated</Badge>
        ) : lesson.isPreview ? (
          <Badge tone={gateTone("allow")}>Preview</Badge>
        ) : null}
        {isComplete ? <Badge tone="signal">Complete</Badge> : null}
      </div>

      <h1 className="mt-4 font-display text-[clamp(1.85rem,4vw,2.85rem)] leading-[1.08] tracking-[-0.035em] text-[var(--ln-ink)]">
        {lesson.title}
      </h1>

      <div
        className="mt-5 h-px w-20 bg-[var(--ln-signal)] md:w-28"
        aria-hidden
      />

      {isSignedIn ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-6"
          disabled={saving || lesson.gated}
          onClick={() => void toggleComplete()}
        >
          {isComplete ? "Mark incomplete" : "Mark complete"}
        </Button>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-[var(--ln-halt)]" role="alert">
          {error}
        </p>
      ) : null}
    </header>
  );
}
