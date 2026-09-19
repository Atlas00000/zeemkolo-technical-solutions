"use client";

import { useAuth } from "@clerk/nextjs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchLmsCourse,
  fetchLmsCourseProgress,
  fetchLmsLesson,
  upsertLmsProgress,
  type LmsCourse,
  type LmsCourseProgress,
  type LmsLesson,
} from "@/lib/api-client";

type LessonDeskState = {
  courseSlug: string;
  lessonSlug: string;
  course: LmsCourse | null;
  lesson: LmsLesson | null;
  progress: LmsCourseProgress | null;
  error: string | null;
  saving: boolean;
  isSignedIn: boolean | undefined;
  isComplete: boolean;
  reducedMotion: boolean;
  reload: () => Promise<void>;
  toggleComplete: () => Promise<void>;
};

const LessonDeskContext = createContext<LessonDeskState | null>(null);

export function useLessonDesk() {
  const ctx = useContext(LessonDeskContext);
  if (!ctx) throw new Error("useLessonDesk requires LessonDeskProvider");
  return ctx;
}

export function LessonDeskProvider({
  courseSlug,
  lessonSlug,
  children,
}: {
  courseSlug: string;
  lessonSlug: string;
  children: ReactNode;
}) {
  const { getToken, isSignedIn } = useAuth();
  const [course, setCourse] = useState<LmsCourse | null>(null);
  const [lesson, setLesson] = useState<LmsLesson | null>(null);
  const [progress, setProgress] = useState<LmsCourseProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const reload = useCallback(async () => {
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
    void reload();
  }, [reload]);

  const toggleComplete = useCallback(async () => {
    if (!lesson || !isSignedIn) return;
    const token = await getToken();
    if (!token) return;
    const currentlyDone = progress?.lessons.find(
      (l) => l.id === lesson.id,
    )?.completed;
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
  }, [courseSlug, getToken, isSignedIn, lesson, progress]);

  const isComplete = Boolean(
    lesson &&
      progress?.lessons.find((l) => l.id === lesson.id)?.completed,
  );

  const value = useMemo(
    () => ({
      courseSlug,
      lessonSlug,
      course,
      lesson,
      progress,
      error,
      saving,
      isSignedIn,
      isComplete,
      reducedMotion,
      reload,
      toggleComplete,
    }),
    [
      courseSlug,
      lessonSlug,
      course,
      lesson,
      progress,
      error,
      saving,
      isSignedIn,
      isComplete,
      reducedMotion,
      reload,
      toggleComplete,
    ],
  );

  return (
    <LessonDeskContext.Provider value={value}>
      {children}
    </LessonDeskContext.Provider>
  );
}
