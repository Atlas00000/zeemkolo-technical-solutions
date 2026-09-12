import type { FastifyReply, FastifyRequest } from "fastify";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { Role, type User } from "@prisma/client";
import { env } from "../config/env.js";
import { prisma } from "../config/db.js";
import { upsertUserFromClerk } from "../modules/auth/user-sync.service.js";
import { assignMatricAtSignup } from "../modules/auth/matric.service.js";
import { sendApiError } from "../utils/api-error.js";

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
    await sendApiError(request, reply, 401, "Unauthorized", "Missing Bearer token", "missing_bearer");
    return;
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });

    const clerkUserId = payload.sub;
    if (!clerkUserId) {
      await sendApiError(request, reply, 401, "Unauthorized", "Invalid token subject", "invalid_subject");
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
    await sendApiError(request, reply, 401, "Unauthorized", "Invalid or expired session", "invalid_session");
    return;
  }
}

export function requireRole(roles: Role[]) {
  return async function roleGuard(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    if (!request.auth?.user) {
      await sendApiError(request, reply, 401, "Unauthorized", "Authentication required", "unauthenticated");
      return;
    }

    if (!roles.includes(request.auth.user.role)) {
      await sendApiError(
        request,
        reply,
        403,
        "Forbidden",
        `Requires one of roles: ${roles.join(", ")}`,
        "forbidden_role",
      );
      return;
    }
  };
}
