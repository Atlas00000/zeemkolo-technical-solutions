import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../config/db.js";
import { requireAuth } from "../../middleware/clerk-auth.middleware.js";
import { rateLimitMatricClaim } from "../../middleware/rate-limiter.js";
import { claimMatric, MatricClaimError } from "./matric.service.js";
import { handleClerkWebhook } from "./clerk-webhook.js";

const claimBodySchema = z.object({
  code: z.string().min(3).max(32),
});

export async function authRoutes(app: FastifyInstance) {
  app.get(
    "/auth/me",
    { preHandler: [requireAuth] },
    async (request) => {
      const full = await prisma.user.findUnique({
        where: { id: request.auth!.user.id },
        include: { matric: true },
      });

      return {
        id: full!.id,
        clerkUserId: full!.clerkUserId,
        email: full!.email,
        fullName: full!.fullName,
        role: full!.role,
        matric: full!.matric
          ? { code: full!.matric.code, claimedAt: full!.matric.claimedAt }
          : null,
      };
    },
  );

  app.post(
    "/auth/matric/claim",
    { preHandler: [requireAuth, rateLimitMatricClaim] },
    async (request, reply) => {
      const parsed = claimBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "ValidationError",
          message: parsed.error.flatten(),
        });
      }

      try {
        const result = await claimMatric(request.auth!.user.id, parsed.data.code);
        return {
          role: result.user.role,
          matric: {
            code: result.matric.code,
            claimedAt: result.matric.claimedAt,
          },
        };
      } catch (error) {
        if (error instanceof MatricClaimError) {
          return reply.status(error.statusCode).send({
            error: "MatricClaimError",
            message: error.message,
          });
        }
        throw error;
      }
    },
  );

  app.post("/auth/webhooks/clerk", async (request, reply) => {
    return handleClerkWebhook(request, reply);
  });
}
