import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { LessonDesk } from "@/components/lms/lesson";
import { LibraryAtmosphere } from "@/components/lms/library/LibraryAtmosphere";
import "@/components/lms/library/library-motion.css";

type LessonPageProps = {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
};

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  try {
    const { fetchLmsLesson } = await import("@/lib/api-client");
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
      <main
        className="relative isolate overflow-hidden text-[var(--ln-ink)]"
        data-lesson-desk
      >
        <LibraryAtmosphere />
        <div className="relative z-10 mx-auto max-w-shell px-[var(--ln-page-x)] py-10 md:py-14">
          <p className="font-sans text-sm font-medium tracking-[0.28em] text-[var(--ln-signal)] uppercase">
            Zeemble Program
          </p>
          <div
            className="mt-6 border-t border-[var(--ln-signal)] pt-6"
            data-library-stage
          >
            <LessonDesk courseSlug={courseSlug} lessonSlug={lessonSlug} />
          </div>
          <Link
            href={`/zeemble/courses/${courseSlug}`}
            className="mt-12 inline-block text-sm text-[var(--ln-signal)] underline-offset-2 hover:underline"
          >
            ← Course overview
          </Link>
        </div>
      </main>
    </AppShell>
  );
}
