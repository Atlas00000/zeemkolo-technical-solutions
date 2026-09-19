import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { fetchLmsCourse } from "@/lib/api-client";
import { CourseNavTree } from "@/components/lms/CourseNavTree";
import { LibraryAtmosphere } from "@/components/lms/library/LibraryAtmosphere";
import { Button } from "@/design/primitives/Button";
import "@/components/lms/library/library-motion.css";

export const revalidate = 60;

type CoursePageProps = {
  params: Promise<{ courseSlug: string }>;
};

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { courseSlug } = await params;
  try {
    const course = await fetchLmsCourse(courseSlug);
    return {
      title: `${course.title} | Zeemble`,
      description:
        course.description?.slice(0, 160) ||
        `Zeemble course: ${course.title}`,
    };
  } catch {
    return { title: "Course | Zeemble" };
  }
}

export default async function CourseOverviewPage({ params }: CoursePageProps) {
  const { courseSlug } = await params;

  let course: Awaited<ReturnType<typeof fetchLmsCourse>> | null = null;
  try {
    course = await fetchLmsCourse(courseSlug);
  } catch {
    notFound();
  }

  const firstLesson = course.modules[0]?.lessons[0];

  return (
    <AppShell>
      <main className="relative isolate overflow-hidden text-[var(--ln-ink)]">
        <LibraryAtmosphere />
        <div className="relative z-10 mx-auto max-w-shell px-[var(--ln-page-x)] py-14 md:py-20">
          <p className="font-sans text-sm font-medium tracking-[0.28em] text-[var(--ln-signal)] uppercase">
            Zeemble Program
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.08] tracking-[-0.04em] text-[var(--ln-ink)]">
            {course.title}
          </h1>
          {course.description ? (
            <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-[var(--ln-muted)] md:text-lg">
              {course.description}
            </p>
          ) : null}
          {firstLesson ? (
            <div className="mt-8">
              <Button asChild>
                <Link
                  href={`/zeemble/courses/${course.slug}/${firstLesson.slug}`}
                >
                  Continue to first lesson
                </Link>
              </Button>
            </div>
          ) : null}

          <div className="mt-12 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
            <div
              className="min-w-0 flex-1 border-t border-[var(--ln-signal)] pt-6"
              data-library-rail
            >
              <p className="font-mono text-xs tracking-[0.22em] text-[var(--ln-signal)] uppercase">
                Modules
              </p>
              <div className="mt-4">
                <CourseNavTree
                  courseSlug={course.slug}
                  modules={course.modules}
                />
              </div>
            </div>
            <aside
              className="min-w-0 border-t border-[var(--ln-hairline)] pt-6 lg:w-64 lg:shrink-0 lg:border-t-0 lg:border-l lg:border-[var(--ln-signal)] lg:pl-10 lg:pt-0"
              data-library-stage
            >
              <p className="font-mono text-xs tracking-[0.22em] text-[var(--ln-signal)] uppercase">
                Resume
              </p>
              <p className="mt-3 text-sm text-[var(--ln-muted)]">
                {course.modules.length} modules in this course. Open any lesson
                from the rail, or continue from the first lesson.
              </p>
            </aside>
          </div>

          <Link
            href="/zeemble"
            className="mt-12 inline-block text-sm text-[var(--ln-signal)] underline-offset-2 hover:underline"
          >
            ← All courses
          </Link>
        </div>
      </main>
    </AppShell>
  );
}
