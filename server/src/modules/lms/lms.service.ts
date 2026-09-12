import { Role } from "@prisma/client";
import { prisma } from "../../config/db.js";

export class LmsError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = "LmsError";
  }
}

const PREVIEW_CHAR_LIMIT = 280;

function canAccessFullContent(role?: Role): boolean {
  return role === Role.ZEEMBLE_STUDENT || role === Role.ADMIN;
}

function truncateMarkdown(body: string): string {
  if (body.length <= PREVIEW_CHAR_LIMIT) return body;
  return `${body.slice(0, PREVIEW_CHAR_LIMIT).trimEnd()}\n\n…`;
}

export async function listPublishedCourses() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
    include: {
      modules: {
        orderBy: { sortOrder: "asc" },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              slug: true,
              title: true,
              isPreview: true,
              sortOrder: true,
            },
          },
        },
      },
    },
  });

  return courses.map((course) => ({
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    modules: course.modules.map((mod) => ({
      id: mod.id,
      slug: mod.slug,
      title: mod.title,
      description: mod.description,
      lessons: mod.lessons,
    })),
  }));
}

export async function getCourseBySlug(courseSlug: string) {
  const course = await prisma.course.findFirst({
    where: { slug: courseSlug, isPublished: true },
    include: {
      modules: {
        orderBy: { sortOrder: "asc" },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              slug: true,
              title: true,
              isPreview: true,
              sortOrder: true,
            },
          },
        },
      },
    },
  });

  if (!course) {
    throw new LmsError("Course not found", 404);
  }

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    modules: course.modules.map((mod) => ({
      id: mod.id,
      slug: mod.slug,
      title: mod.title,
      description: mod.description,
      lessons: mod.lessons,
    })),
  };
}

export async function getLessonBySlugs(input: {
  courseSlug: string;
  lessonSlug: string;
  role?: Role;
}) {
  const lesson = await prisma.lesson.findFirst({
    where: {
      slug: input.lessonSlug,
      isPublished: true,
      module: {
        course: {
          slug: input.courseSlug,
          isPublished: true,
        },
      },
    },
    include: {
      module: {
        include: {
          course: true,
          lessons: {
            where: { isPublished: true },
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              slug: true,
              title: true,
              isPreview: true,
              sortOrder: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    throw new LmsError("Lesson not found", 404);
  }

  const fullAccess = canAccessFullContent(input.role) || lesson.isPreview;
  const markdownBody = fullAccess
    ? lesson.markdownBody
    : truncateMarkdown(lesson.markdownBody);

  return {
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    isPreview: lesson.isPreview,
    gated: !fullAccess,
    markdownBody,
    videoUrl: fullAccess ? lesson.videoUrl : null,
    schematicKey: fullAccess || lesson.isPreview ? lesson.schematicKey : null,
    codeBundleKey: fullAccess ? lesson.codeBundleKey : null,
    course: {
      id: lesson.module.course.id,
      slug: lesson.module.course.slug,
      title: lesson.module.course.title,
    },
    module: {
      id: lesson.module.id,
      slug: lesson.module.slug,
      title: lesson.module.title,
      lessons: lesson.module.lessons,
    },
  };
}

export async function upsertLessonProgress(input: {
  userId: string;
  lessonId: string;
  completed: boolean;
}) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: input.lessonId },
    include: {
      module: { include: { course: true } },
    },
  });
  if (!lesson || !lesson.isPublished || !lesson.module.course.isPublished) {
    throw new LmsError("Lesson not found", 404);
  }

  return prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: input.userId,
        lessonId: input.lessonId,
      },
    },
    create: {
      userId: input.userId,
      lessonId: input.lessonId,
      completed: input.completed,
      completedAt: input.completed ? new Date() : null,
    },
    update: {
      completed: input.completed,
      completedAt: input.completed ? new Date() : null,
    },
  });
}

export async function getCourseProgress(input: {
  userId: string;
  courseSlug: string;
}) {
  const course = await prisma.course.findFirst({
    where: { slug: input.courseSlug, isPublished: true },
    include: {
      modules: {
        orderBy: { sortOrder: "asc" },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { sortOrder: "asc" },
            select: { id: true, slug: true, title: true, sortOrder: true },
          },
        },
      },
    },
  });

  if (!course) {
    throw new LmsError("Course not found", 404);
  }

  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const progressRows = await prisma.lessonProgress.findMany({
    where: {
      userId: input.userId,
      lessonId: { in: lessonIds },
    },
  });

  const progressByLesson = new Map(progressRows.map((p) => [p.lessonId, p]));
  const completedCount = progressRows.filter((p) => p.completed).length;
  const totalLessons = lessonIds.length;
  const percentComplete =
    totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);

  const flatLessons = course.modules.flatMap((m) =>
    m.lessons.map((l) => ({
      ...l,
      moduleSlug: m.slug,
    })),
  );

  const resumeLesson =
    flatLessons.find((l) => !progressByLesson.get(l.id)?.completed) ??
    flatLessons[flatLessons.length - 1] ??
    null;

  return {
    courseSlug: course.slug,
    totalLessons,
    completedCount,
    percentComplete,
    resumePoint: resumeLesson
      ? {
          lessonSlug: resumeLesson.slug,
          moduleSlug: resumeLesson.moduleSlug,
          href: `/zeemble/courses/${course.slug}/${resumeLesson.slug}`,
        }
      : null,
    lessons: flatLessons.map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      completed: Boolean(progressByLesson.get(l.id)?.completed),
    })),
  };
}
