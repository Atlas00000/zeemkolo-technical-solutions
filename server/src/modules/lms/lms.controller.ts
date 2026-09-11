import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { optionalAuth } from "../../middleware/optional-auth.middleware.js";
import { requireAuth } from "../../middleware/clerk-auth.middleware.js";
import { requireStudent } from "../../middleware/rbac.middleware.js";
import {
  LmsError,
  getCourseBySlug,
  getCourseProgress,
  getLessonBySlugs,
  listPublishedCourses,
  upsertLessonProgress,
} from "./lms.service.js";

const progressBodySchema = z.object({
  lessonId: z.string().min(1),
  completed: z.boolean(),
});

export async function lmsRoutes(app: FastifyInstance) {
  app.get("/lms/courses", async () => {
    const courses = await listPublishedCourses();
    return { courses };
  });

  app.get("/lms/courses/:courseSlug", async (request, reply) => {
    const { courseSlug } = request.params as { courseSlug: string };
    try {
      const course = await getCourseBySlug(courseSlug);
      return course;
    } catch (error) {
      if (error instanceof LmsError) {
        return reply.status(error.statusCode).send({
          error: "LmsError",
          message: error.message,
        });
      }
      throw error;
    }
  });

  app.get(
    "/lms/courses/:courseSlug/lessons/:lessonSlug",
    { preHandler: [optionalAuth] },
    async (request, reply) => {
      const { courseSlug, lessonSlug } = request.params as {
        courseSlug: string;
        lessonSlug: string;
      };

      try {
        const lesson = await getLessonBySlugs({
          courseSlug,
          lessonSlug,
          role: request.auth?.user.role,
        });
        return lesson;
      } catch (error) {
        if (error instanceof LmsError) {
          return reply.status(error.statusCode).send({
            error: "LmsError",
            message: error.message,
          });
        }
        throw error;
      }
    },
  );

  app.get(
    "/lms/courses/:courseSlug/progress",
    { preHandler: [requireAuth, requireStudent] },
    async (request, reply) => {
      const { courseSlug } = request.params as { courseSlug: string };
      try {
        return await getCourseProgress({
          userId: request.auth!.user.id,
          courseSlug,
        });
      } catch (error) {
        if (error instanceof LmsError) {
          return reply.status(error.statusCode).send({
            error: "LmsError",
            message: error.message,
          });
        }
        throw error;
      }
    },
  );

  app.post(
    "/lms/progress",
    { preHandler: [requireAuth, requireStudent] },
    async (request, reply) => {
      const parsed = progressBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "ValidationError",
          message: parsed.error.flatten(),
        });
      }

      try {
        const progress = await upsertLessonProgress({
          userId: request.auth!.user.id,
          lessonId: parsed.data.lessonId,
          completed: parsed.data.completed,
        });
        return {
          lessonId: progress.lessonId,
          completed: progress.completed,
          completedAt: progress.completedAt,
        };
      } catch (error) {
        if (error instanceof LmsError) {
          return reply.status(error.statusCode).send({
            error: "LmsError",
            message: error.message,
          });
        }
        throw error;
      }
    },
  );
}
