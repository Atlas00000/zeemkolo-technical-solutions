import type { FastifyReply, FastifyRequest } from "fastify";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { Role, type User } from "@prisma/client";
import { env } from "../config/env.js";
import { prisma } from "../config/db.js";
import { upsertUserFromClerk } from "../modules/auth/user-sync.service.js";
import { assignMatricAtSignup } from "../modules/auth/matric.service.js";

export const clerkClient = createClerkClient({
  secretKey: env.CLERK_SECRET_KEY,
  publishableKey: env.CLERK_PUBLISHABLE_KEY,
});

declare module "fastify" {
  interface FastifyRequest {
    auth?: {
      clerkUserId: string;
      user: User;
    };
  }
}

function getBearerToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  return header.slice("Bearer ".length).trim() || null;
}

async function ensureMatric(user: User): Promise<User> {
  if (user.role === Role.ADMIN) {
    return user;
  }
  const existing = await prisma.matric.findUnique({ where: { userId: user.id } });
  if (existing) {
    return user;
  }
  const assigned = await assignMatricAtSignup(user.id);
  return assigned.user;
}

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const token = getBearerToken(request);
  if (!token) {
    await reply.status(401).send({ error: "Unauthorized", message: "Missing Bearer token" });
    return;
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });

    const clerkUserId = payload.sub;
    if (!clerkUserId) {
      await reply.status(401).send({ error: "Unauthorized", message: "Invalid token subject" });
      return;
    }

    let user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      user = await upsertUserFromClerk(clerkUser);
    } else {
      user = await ensureMatric(user);
    }

    request.auth = { clerkUserId, user };
  } catch {
    await reply.status(401).send({ error: "Unauthorized", message: "Invalid or expired session" });
    return;
  }
}

export function requireRole(roles: Role[]) {
  return async function roleGuard(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    if (!request.auth?.user) {
      await reply.status(401).send({ error: "Unauthorized" });
      return;
    }

    if (!roles.includes(request.auth.user.role)) {
      await reply.status(403).send({
        error: "Forbidden",
        message: `Requires one of roles: ${roles.join(", ")}`,
      });
    }
  };
}
