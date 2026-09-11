"use client";

import Link from "next/link";

type NavLesson = {
  id: string;
  slug: string;
  title: string;
  isPreview: boolean;
  completed?: boolean;
};

type NavModule = {
  id: string;
  title: string;
  lessons: NavLesson[];
};

type CourseNavTreeProps = {
  courseSlug: string;
  modules: NavModule[];
  activeLessonSlug?: string;
};

export function CourseNavTree({
  courseSlug,
  modules,
  activeLessonSlug,
}: CourseNavTreeProps) {
  return (
    <nav className="space-y-5 text-sm">
      {modules.map((mod) => (
        <div key={mod.id}>
          <p className="mb-2 font-medium text-brand-ink">{mod.title}</p>
          <ul className="space-y-1 border-l border-brand-steel/20 pl-3">
            {mod.lessons.map((lesson) => {
              const active = lesson.slug === activeLessonSlug;
              return (
                <li key={lesson.id}>
                  <Link
                    href={`/zeemble/courses/${courseSlug}/${lesson.slug}`}
                    className={`flex items-start gap-2 py-1 ${
                      active
                        ? "text-brand-signal"
                        : "text-brand-steel hover:text-brand-ink"
                    }`}
                  >
                    <span
                      className={`mt-1 inline-block h-2.5 w-2.5 shrink-0 border ${
                        lesson.completed
                          ? "border-brand-signal bg-brand-signal"
                          : "border-brand-steel/40"
                      }`}
                      aria-hidden
                    />
                    <span>
                      {lesson.title}
                      {lesson.isPreview ? (
                        <span className="ml-1 text-xs text-brand-steel/70">(preview)</span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
