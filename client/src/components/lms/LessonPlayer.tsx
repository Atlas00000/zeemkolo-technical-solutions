"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import {
  fetchLmsCourse,
  fetchLmsCourseProgress,
  fetchLmsLesson,
  upsertLmsProgress,
  type LmsCourse,
  type LmsCourseProgress,
  type LmsLesson,
} from "@/lib/api-client";
import { CourseNavTree } from "@/components/lms/CourseNavTree";
import { LessonMarkdown } from "@/components/lms/LessonMarkdown";
import { ProgressBar } from "@/components/lms/ProgressBar";
import { SchematicViewer } from "@/components/lms/SchematicViewer";

type LessonPlayerProps = {
  courseSlug: string;
  lessonSlug: string;
};

export function LessonPlayer({ courseSlug, lessonSlug }: LessonPlayerProps) {
  const { getToken, isSignedIn } = useAuth();
  const [course, setCourse] = useState<LmsCourse | null>(null);
  const [lesson, setLesson] = useState<LmsLesson | null>(null);
  const [progress, setProgress] = useState<LmsCourseProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const token = isSignedIn ? (await getToken()) ?? undefined : undefined;
      const [courseData, lessonData] = await Promise.all([
        fetchLmsCourse(courseSlug),
        fetchLmsLesson(courseSlug, lessonSlug, token),
      ]);
      setCourse(courseData);
      setLesson(lessonData);

      if (token) {
        try {
          const progressData = await fetchLmsCourseProgress(courseSlug, token);
          setProgress(progressData);
        } catch {
          setProgress(null);
        }
      } else {
        setProgress(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lesson");
    }
  }, [courseSlug, getToken, isSignedIn, lessonSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleComplete() {
    if (!lesson || !isSignedIn) return;
    const token = await getToken();
    if (!token) return;
    const currentlyDone = progress?.lessons.find((l) => l.id === lesson.id)?.completed;
    setSaving(true);
    try {
      await upsertLmsProgress(
        { lessonId: lesson.id, completed: !currentlyDone },
        token,
      );
      const next = await fetchLmsCourseProgress(courseSlug, token);
      setProgress(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save progress");
    } finally {
      setSaving(false);
    }
  }

  if (error && !lesson) {
    return <p className="text-brand-signal">{error}</p>;
  }

  if (!lesson || !course) {
    return <p className="text-brand-steel">Loading lesson…</p>;
  }

  const completedMap = new Map(
    (progress?.lessons ?? []).map((l) => [l.id, l.completed]),
  );
  const isComplete = Boolean(completedMap.get(lesson.id));

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-6">
        {progress ? <ProgressBar percent={progress.percentComplete} /> : null}
        <CourseNavTree
          courseSlug={courseSlug}
          activeLessonSlug={lessonSlug}
          modules={course.modules.map((mod) => ({
            id: mod.id,
            title: mod.title,
            lessons: mod.lessons.map((l) => ({
              ...l,
              completed: completedMap.get(l.id),
            })),
          }))}
        />
      </aside>

      <article className="space-y-8">
        <header>
          <p className="text-sm tracking-[0.16em] text-brand-steel uppercase">
            {lesson.module.title}
          </p>
          <h1 className="mt-2 font-display text-3xl text-brand-ink md:text-4xl">
            {lesson.title}
          </h1>
          {isSignedIn ? (
            <button
              type="button"
              disabled={saving || lesson.gated}
              onClick={() => void toggleComplete()}
              className="mt-4 border border-brand-steel/25 px-3 py-1.5 text-sm text-brand-ink disabled:opacity-50"
            >
              {isComplete ? "Mark incomplete" : "Mark complete"}
            </button>
          ) : null}
          {error ? <p className="mt-2 text-sm text-brand-signal">{error}</p> : null}
        </header>

        <LessonMarkdown markdown={lesson.markdownBody} gated={lesson.gated} />

        {lesson.schematicKey ? (
          <SchematicViewer src={lesson.schematicKey} title="Circuit schematic" />
        ) : null}

        {lesson.videoUrl ? (
          <div className="aspect-video border border-brand-steel/20 bg-black">
            <iframe
              title="Lesson video"
              src={lesson.videoUrl}
              className="h-full w-full"
              allowFullScreen
            />
          </div>
        ) : null}
      </article>
    </div>
  );
}
