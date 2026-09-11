import type { FastifyReply, FastifyRequest } from "fastify";
import { Webhook } from "svix";
import { env } from "../../config/env.js";
import { clerkClient } from "../../middleware/clerk-auth.middleware.js";
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
    return reply.status(503).send({
      error: "WebhookNotConfigured",
      message: "CLERK_WEBHOOK_SECRET is not set",
    });
  }

  const svixId = request.headers["svix-id"];
  const svixTimestamp = request.headers["svix-timestamp"];
  const svixSignature = request.headers["svix-signature"];

  if (
    typeof svixId !== "string" ||
    typeof svixTimestamp !== "string" ||
    typeof svixSignature !== "string"
  ) {
    return reply.status(400).send({ error: "MissingSvixHeaders" });
  }

  const payload = typeof request.body === "string"
    ? request.body
    : JSON.stringify(request.body);

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return reply.status(400).send({ error: "InvalidWebhookSignature" });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const clerkUser = await clerkClient.users.getUser(event.data.id);
    await upsertUserFromClerk(clerkUser);
  }

  return reply.status(200).send({ received: true });
}
