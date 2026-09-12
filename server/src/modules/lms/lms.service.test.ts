import { Role } from "@prisma/client";
import { beforeAll, describe, expect, it } from "vitest";
import {
  getCourseBySlug,
  getCourseProgress,
  getLessonBySlugs,
  listPublishedCourses,
  upsertLessonProgress,
} from "./lms.service.js";
import { prisma } from "../../config/db.js";

describe("lms.service (Phase 3)", () => {
  beforeAll(async () => {
    const courses = await listPublishedCourses();
    expect(courses.length).toBeGreaterThan(0);
  });

  it("lists published courses with modules and lessons", async () => {
    const courses = await listPublishedCourses();
    const embedded = courses.find((c) => c.slug === "embedded-systems-foundations");
    expect(embedded).toBeTruthy();
    expect(embedded!.modules.length).toBeGreaterThan(0);
    expect(embedded!.modules[0]!.lessons.length).toBeGreaterThan(0);
  });

  it("returns full preview lesson content to guests", async () => {
    const lesson = await getLessonBySlugs({
      courseSlug: "embedded-systems-foundations",
      lessonSlug: "welcome-to-zeemble",
    });
    expect(lesson.gated).toBe(false);
    expect(lesson.isPreview).toBe(true);
    expect(lesson.markdownBody).toContain("Welcome to Zeemble");
    expect(lesson.markdownBody).toContain("```c");
    expect(lesson.schematicKey).toBeTruthy();
  });

  it("gates non-preview lessons for guests", async () => {
    const lesson = await getLessonBySlugs({
      courseSlug: "embedded-systems-foundations",
      lessonSlug: "lab-safety-and-tools",
    });
    expect(lesson.gated).toBe(true);
    expect(lesson.markdownBody.length).toBeLessThanOrEqual(300);
    expect(lesson.markdownBody).toContain("…");
    expect(lesson.videoUrl).toBeNull();
    expect(lesson.codeBundleKey).toBeNull();
  });

  it("returns full gated lesson for students", async () => {
    const lesson = await getLessonBySlugs({
      courseSlug: "embedded-systems-foundations",
      lessonSlug: "lab-safety-and-tools",
      role: Role.ZEEMBLE_STUDENT,
    });
    expect(lesson.gated).toBe(false);
    expect(lesson.markdownBody).toContain("Bench rules");
    expect(lesson.markdownBody.length).toBeGreaterThan(280);
  });

  it("hides unpublished lessons from student catalog and detail", async () => {
    const course = await getCourseBySlug("embedded-systems-foundations");
    const lesson = course.modules[0]!.lessons[0]!;

    await prisma.lesson.update({
      where: { id: lesson.id },
      data: { isPublished: false },
    });

    try {
      const listed = await listPublishedCourses();
      const embedded = listed.find((c) => c.slug === "embedded-systems-foundations");
      expect(
        embedded!.modules[0]!.lessons.some((l) => l.id === lesson.id),
      ).toBe(false);

      await expect(
        getLessonBySlugs({
          courseSlug: "embedded-systems-foundations",
          lessonSlug: lesson.slug,
          role: Role.ZEEMBLE_STUDENT,
        }),
      ).rejects.toMatchObject({ statusCode: 404 });
    } finally {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { isPublished: true },
      });
    }
  });

  it("upserts progress and computes course percent", async () => {
    const course = await getCourseBySlug("embedded-systems-foundations");
    const lessonId = course.modules[0]!.lessons[0]!.id;

    const user = await prisma.user.upsert({
      where: { email: "phase3-student@example.com" },
      update: { role: Role.ZEEMBLE_STUDENT },
      create: {
        email: "phase3-student@example.com",
        clerkUserId: "user_phase3_student_test",
        fullName: "Phase 3 Student",
        role: Role.ZEEMBLE_STUDENT,
      },
    });

    await prisma.lessonProgress.deleteMany({ where: { userId: user.id } });

    await upsertLessonProgress({
      userId: user.id,
      lessonId,
      completed: true,
    });

    const progress = await getCourseProgress({
      userId: user.id,
      courseSlug: "embedded-systems-foundations",
    });

    expect(progress.completedCount).toBe(1);
    expect(progress.percentComplete).toBeGreaterThan(0);
    expect(progress.resumePoint?.href).toContain("/zeemble/courses/");
    expect(progress.lessons.find((l) => l.id === lessonId)?.completed).toBe(true);

    await prisma.lessonProgress.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });
});
