"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/design/primitives/Badge";
import { gateTone } from "@/design/map/backend-status";

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
          <p className="mb-2 font-medium text-[var(--ln-ink)]">{mod.title}</p>
          <ul className="space-y-1 border-l border-[var(--ln-hairline)] pl-3">
            {mod.lessons.map((lesson) => {
              const active = lesson.slug === activeLessonSlug;
              return (
                <li key={lesson.id}>
                  <Link
                    href={`/zeemble/courses/${courseSlug}/${lesson.slug}`}
                    className={cn(
                      "flex items-start gap-2 py-1 transition-colors",
                      active
                        ? "text-[var(--ln-signal)]"
                        : "text-[var(--ln-muted)] hover:text-[var(--ln-ink)]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1 inline-block h-2.5 w-2.5 shrink-0 border",
                        lesson.completed
                          ? "border-[var(--ln-signal)] bg-[var(--ln-signal)]"
                          : "border-[var(--ln-hairline-strong)]",
                      )}
                      aria-hidden
                    />
                    <span>
                      {lesson.title}
                      {lesson.isPreview ? (
                        <Badge tone={gateTone("allow")} className="ml-2 align-middle">
                          preview
                        </Badge>
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
