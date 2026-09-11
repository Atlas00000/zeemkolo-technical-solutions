import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { optionalAuth } from "../../middleware/optional-auth.middleware.js";
import { requireAuth } from "../../middleware/clerk-auth.middleware.js";
import { requireStudent } from "../../middleware/rbac.middleware.js";
import {
  ForumError,
  createReply,
  createThread,
  getThreadById,
  listCategories,
  listThreads,
  vote,
} from "./forum.service.js";

const createThreadSchema = z.object({
  categorySlug: z.string().min(1),
  title: z.string().trim().min(3).max(200),
  body: z.string().trim().min(10).max(20_000),
});

const createReplySchema = z.object({
  body: z.string().trim().min(2).max(10_000),
  parentId: z.string().min(1).optional().nullable(),
});

const voteSchema = z
  .object({
    threadId: z.string().min(1).optional(),
    replyId: z.string().min(1).optional(),
    value: z.union([z.literal(1), z.literal(-1)]),
  })
  .refine((d) => Boolean(d.threadId) !== Boolean(d.replyId), {
    message: "Provide exactly one of threadId or replyId",
  });

function sendForumError(reply: import("fastify").FastifyReply, error: unknown) {
  if (error instanceof ForumError) {
    return reply.status(error.statusCode).send({
      error: "ForumError",
      message: error.message,
    });
  }
  throw error;
}

export async function forumRoutes(app: FastifyInstance) {
  app.get("/forum/categories", async () => {
    const categories = await listCategories();
    return { categories };
  });

  app.get("/forum/threads", async (request) => {
    const query = request.query as { category?: string };
    const threads = await listThreads({
      categorySlug: query.category || undefined,
    });
    return { threads };
  });

  app.get(
    "/forum/threads/:threadId",
    { preHandler: [optionalAuth] },
    async (request, reply) => {
      const { threadId } = request.params as { threadId: string };
      try {
        const thread = await getThreadById({
          threadId,
          viewerUserId: request.auth?.user.id,
        });
        return thread;
      } catch (error) {
        return sendForumError(reply, error);
      }
    },
  );

  app.post(
    "/forum/threads",
    { preHandler: [requireAuth, requireStudent] },
    async (request, reply) => {
      const parsed = createThreadSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "ValidationError",
          message: parsed.error.flatten(),
        });
      }

      try {
        const thread = await createThread({
          authorId: request.auth!.user.id,
          ...parsed.data,
        });
        return reply.status(201).send(thread);
      } catch (error) {
        return sendForumError(reply, error);
      }
    },
  );

  app.post(
    "/forum/threads/:threadId/replies",
    { preHandler: [requireAuth, requireStudent] },
    async (request, reply) => {
      const { threadId } = request.params as { threadId: string };
      const parsed = createReplySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "ValidationError",
          message: parsed.error.flatten(),
        });
      }

      try {
        const created = await createReply({
          authorId: request.auth!.user.id,
          threadId,
          body: parsed.data.body,
          parentId: parsed.data.parentId,
        });
        return reply.status(201).send(created);
      } catch (error) {
        return sendForumError(reply, error);
      }
    },
  );

  app.post(
    "/forum/votes",
    { preHandler: [requireAuth, requireStudent] },
    async (request, reply) => {
      const parsed = voteSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "ValidationError",
          message: parsed.error.flatten(),
        });
      }

      try {
        const result = await vote({
          userId: request.auth!.user.id,
          threadId: parsed.data.threadId,
          replyId: parsed.data.replyId,
          value: parsed.data.value,
        });
        return result;
      } catch (error) {
        return sendForumError(reply, error);
      }
    },
  );
}
