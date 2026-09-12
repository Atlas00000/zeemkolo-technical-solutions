import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { EmptyState, ErrorState } from "@/components/feedback/UiState";
import { fetchLmsCourses } from "@/lib/api-client";
import Link from "next/link";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Zeemble course library | Zeemkolo",
  description:
    "Browse Zeemble Program courses. Preview Module 1 as a guest; full lessons unlock for students.",
};

export default async function ZeembleCatalogPage() {
  let courses: Awaited<ReturnType<typeof fetchLmsCourses>>["courses"] = [];
  let error: string | null = null;

  try {
    const data = await fetchLmsCourses();
    courses = data.courses;
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not load courses";
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-display text-sm tracking-[0.2em] text-brand-signal uppercase">
          Zeemble Program
        </p>
        <h1 className="mt-3 font-display text-4xl text-brand-ink">
          Course library
        </h1>
        <p className="mt-3 max-w-2xl text-brand-steel/80">
          Preview Module 1 as a guest. Full lessons unlock for Zeemble students.
        </p>

        {error ? <ErrorState message={error} /> : null}
        {!error && courses.length === 0 ? (
          <EmptyState
            title="No published courses"
            description="Check back soon for Zeemble modules."
          />
        ) : null}
        {!error && courses.length > 0 ? (
          <ul className="mt-10 space-y-6">
            {courses.map((course) => {
              const firstLesson = course.modules[0]?.lessons[0];
              return (
                <li
                  key={course.id}
                  className="border-t border-brand-steel/15 pt-6"
                >
                  <h2 className="font-display text-2xl text-brand-ink">
                    <Link
                      href={`/zeemble/courses/${course.slug}`}
                      className="hover:text-brand-signal"
                    >
                      {course.title}
                    </Link>
                  </h2>
                  {course.description ? (
                    <p className="mt-2 text-brand-steel">{course.description}</p>
                  ) : null}
                  <p className="mt-2 text-sm text-brand-steel/70">
                    {course.modules.length} modules ·{" "}
                    {course.modules.reduce((n, m) => n + m.lessons.length, 0)}{" "}
                    lessons
                  </p>
                  {firstLesson ? (
                    <Link
                      href={`/zeemble/courses/${course.slug}/${firstLesson.slug}`}
                      className="mt-4 inline-block bg-brand-signal px-4 py-2 text-sm text-white"
                    >
                      Start course
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </main>
    </AppShell>
  );
}
