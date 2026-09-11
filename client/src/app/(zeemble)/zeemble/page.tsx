import Link from "next/link";
import { fetchLmsCourses } from "@/lib/api-client";

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
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <p className="font-display text-sm tracking-[0.2em] text-brand-signal uppercase">
        Zeemble Program
      </p>
      <h1 className="mt-3 font-display text-4xl text-brand-ink">Course library</h1>
      <p className="mt-3 max-w-2xl text-brand-steel/80">
        Preview Module 1 as a guest. Full lessons unlock for Zeemble students.
      </p>

      {error ? (
        <p className="mt-10 text-brand-signal">{error}</p>
      ) : (
        <ul className="mt-10 space-y-6">
          {courses.map((course) => {
            const firstLesson = course.modules[0]?.lessons[0];
            return (
              <li key={course.id} className="border-t border-brand-steel/15 pt-6">
                <h2 className="font-display text-2xl text-brand-ink">{course.title}</h2>
                {course.description ? (
                  <p className="mt-2 text-brand-steel">{course.description}</p>
                ) : null}
                <p className="mt-2 text-sm text-brand-steel/70">
                  {course.modules.length} modules ·{" "}
                  {course.modules.reduce((n, m) => n + m.lessons.length, 0)} lessons
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
      )}

      <Link
        href="/"
        className="mt-12 inline-block text-sm text-brand-signal underline-offset-2 hover:underline"
      >
        ← Back home
      </Link>
    </main>
  );
}
