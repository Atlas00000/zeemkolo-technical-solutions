import type { FastifyReply, FastifyRequest } from "fastify";
import { verifyToken } from "@clerk/backend";
import { env } from "../config/env.js";
import { prisma } from "../config/db.js";
import { clerkClient } from "./clerk-auth.middleware.js";
import { upsertUserFromClerk } from "../modules/auth/user-sync.service.js";

/**
 * Optional auth: attaches request.auth when a valid Bearer token is present;
 * never rejects anonymous requests.
 */
export async function optionalAuth(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return;
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) return;

  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });
    const clerkUserId = payload.sub;
    if (!clerkUserId) return;

    let user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      user = await upsertUserFromClerk(clerkUser);
    }

    request.auth = { clerkUserId, user };
  } catch {
    // Ignore invalid tokens for optional auth — treat as guest.
  }
}
