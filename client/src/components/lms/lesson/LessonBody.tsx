"use client";

import { LessonMarkdown } from "@/components/lms/LessonMarkdown";
import { LessonSchematic } from "./LessonSchematic";
import { LessonVideo } from "./LessonVideo";
import { useLessonDesk } from "./useLessonDesk";

/**
 * Lesson content stage — markdown + optional media. Open plane.
 */
export function LessonBody() {
  const { lesson } = useLessonDesk();
  if (!lesson) return null;

  return (
    <div className="mt-10 space-y-2" data-lesson-body>
      <LessonMarkdown markdown={lesson.markdownBody} gated={lesson.gated} />

      {lesson.schematicKey ? (
        <LessonSchematic src={lesson.schematicKey} />
      ) : null}

      {lesson.videoUrl ? <LessonVideo src={lesson.videoUrl} /> : null}
    </div>
  );
}
