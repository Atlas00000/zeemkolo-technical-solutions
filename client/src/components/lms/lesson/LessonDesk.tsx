"use client";

import { Text } from "@/design/primitives/Text";
import { SkeletonBlock, SkeletonLine } from "@/design/patterns/Skeleton";
import { LessonNavRail } from "./LessonNavRail";
import { LessonStage } from "./LessonStage";
import {
  LessonDeskProvider,
  useLessonDesk,
} from "./useLessonDesk";
import "./lesson-motion.css";

function LessonDeskInner() {
  const { course, lesson, error } = useLessonDesk();

  if (error && !lesson) {
    return (
      <p className="text-[var(--ln-halt)]" role="alert">
        {error}
      </p>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="space-y-4" role="status" aria-live="polite">
        <SkeletonLine className="w-48" />
        <SkeletonBlock className="h-40" />
        <Text variant="meta">Loading lesson…</Text>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-14"
      data-lesson-desk-grid
    >
      <LessonNavRail />
      <LessonStage />
    </div>
  );
}

/**
 * Lesson player desk — rail + stage. Modular, open plane, no Surface box.
 */
export function LessonDesk({
  courseSlug,
  lessonSlug,
}: {
  courseSlug: string;
  lessonSlug: string;
}) {
  return (
    <LessonDeskProvider courseSlug={courseSlug} lessonSlug={lessonSlug}>
      <LessonDeskInner />
    </LessonDeskProvider>
  );
}
