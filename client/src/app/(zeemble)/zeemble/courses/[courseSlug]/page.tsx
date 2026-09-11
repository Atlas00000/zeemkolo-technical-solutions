import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchLmsCourse } from "@/lib/api-client";
import { CourseNavTree } from "@/components/lms/CourseNavTree";

type CoursePageProps = {
  params: Promise<{ courseSlug: string }>;
};

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
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <p className="font-display text-sm tracking-[0.2em] text-brand-signal uppercase">
        Zeemble Program
      </p>
      <h1 className="mt-3 font-display text-4xl text-brand-ink">{course.title}</h1>
      {course.description ? (
        <p className="mt-3 max-w-2xl text-brand-steel/80">{course.description}</p>
      ) : null}

      {firstLesson ? (
        <Link
          href={`/zeemble/courses/${course.slug}/${firstLesson.slug}`}
          className="mt-8 inline-block bg-brand-signal px-4 py-2 text-sm text-white"
        >
          Continue to first lesson
        </Link>
      ) : null}

      <div className="mt-10">
        <CourseNavTree courseSlug={course.slug} modules={course.modules} />
      </div>

      <Link
        href="/zeemble"
        className="mt-12 inline-block text-sm text-brand-signal underline-offset-2 hover:underline"
      >
        ← All courses
      </Link>
    </main>
  );
}
