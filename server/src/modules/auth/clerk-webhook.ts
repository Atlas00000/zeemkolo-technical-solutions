import type { FastifyReply, FastifyRequest } from "fastify";
import { Webhook } from "svix";
import { env } from "../../config/env.js";
import { clerkClient } from "../../middleware/clerk-auth.middleware.js";
import { sendApiError } from "../../utils/api-error.js";
import { upsertUserFromClerk } from "./user-sync.service.js";

type ClerkWebhookEvent = {
  type: string;
  data: { id: string };
};

export async function handleClerkWebhook(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!env.CLERK_WEBHOOK_SECRET) {
    return sendApiError(
      request,
      reply,
      503,
      "WebhookNotConfigured",
      "CLERK_WEBHOOK_SECRET is not set",
      "webhook_not_configured",
    );
  }

  const svixId = request.headers["svix-id"];
  const svixTimestamp = request.headers["svix-timestamp"];
  const svixSignature = request.headers["svix-signature"];

  if (
    typeof svixId !== "string" ||
    typeof svixTimestamp !== "string" ||
    typeof svixSignature !== "string"
  ) {
    return sendApiError(
      request,
      reply,
      400,
      "MissingSvixHeaders",
      "Missing Svix signature headers",
      "missing_svix_headers",
    );
  }

  const payload = request.rawBody ?? JSON.stringify(request.body ?? {});

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return sendApiError(
      request,
      reply,
      400,
      "InvalidWebhookSignature",
      "Invalid Clerk webhook signature",
      "webhook_signature_invalid",
    );
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const clerkUser = await clerkClient.users.getUser(event.data.id);
    await upsertUserFromClerk(clerkUser);
  }

  return reply.status(200).send({ received: true });
}
