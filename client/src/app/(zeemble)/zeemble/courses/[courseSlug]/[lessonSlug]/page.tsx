import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { LessonPlayer } from "@/components/lms/LessonPlayer";
import { fetchLmsLesson } from "@/lib/api-client";

type LessonPageProps = {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
};

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  try {
    const lesson = await fetchLmsLesson(courseSlug, lessonSlug);
    return {
      title: `${lesson.title} | Zeemble`,
      description: `Lesson in ${lesson.course.title}`,
    };
  } catch {
    return { title: "Lesson | Zeemble" };
  }
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseSlug, lessonSlug } = await params;

  return (
    <AppShell showFooter={false}>
      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="font-display text-sm tracking-[0.2em] text-brand-signal uppercase">
          Zeemble Program
        </p>
        <div className="mt-8">
          <LessonPlayer courseSlug={courseSlug} lessonSlug={lessonSlug} />
        </div>
        <Link
          href={`/zeemble/courses/${courseSlug}`}
          className="mt-12 inline-block text-sm text-brand-signal underline-offset-2 hover:underline"
        >
          ← Course overview
        </Link>
      </main>
    </AppShell>
  );
}
