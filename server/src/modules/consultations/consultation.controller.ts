import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { optionalAuth } from "../../middleware/optional-auth.middleware.js";
import { rateLimitConsultationBook } from "../../middleware/rate-limiter.js";
import { saveConsultationUpload } from "../../utils/local-upload.js";
import {
  ConsultationError,
  SERVICE_TYPES,
  createConsultation,
  listAvailableSlots,
} from "./consultation.service.js";

const bookBodySchema = z.object({
  guestName: z.string().min(2).max(120),
  guestEmail: z.string().email(),
  serviceType: z.enum([
    "Hardware Prototyping",
    "Firmware Review",
    "Product Design",
    "Embedded Systems Consulting",
    "General Engineering Inquiry",
  ]),
  projectBrief: z.string().min(20).max(10_000),
  slotStartsAt: z.string().datetime(),
  timezone: z.string().min(3).max(64).default("Africa/Lagos"),
  attachmentKey: z.string().min(3).max(512).optional(),
});

export async function consultationRoutes(app: FastifyInstance) {
  app.get("/consultations/services", async () => {
    return { services: SERVICE_TYPES };
  });

  app.get("/consultations/slots", async (request) => {
    const query = request.query as { days?: string };
    const days = Math.min(Math.max(Number(query.days ?? 14) || 14, 1), 30);
    const slots = await listAvailableSlots(days);
    return { timezone: "Africa/Lagos", slots };
  });

  app.post(
    "/consultations",
    { preHandler: [optionalAuth, rateLimitConsultationBook] },
    async (request, reply) => {
      const parsed = bookBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "ValidationError",
          message: parsed.error.flatten(),
        });
      }

      try {
        const result = await createConsultation({
          guestName: parsed.data.guestName,
          guestEmail: parsed.data.guestEmail,
          serviceType: parsed.data.serviceType,
          projectBrief: parsed.data.projectBrief,
          slotStartsAt: new Date(parsed.data.slotStartsAt),
          timezone: parsed.data.timezone,
          attachmentKey: parsed.data.attachmentKey,
          userId: request.auth?.user.id,
        });

        return reply.status(201).send({
          id: result.consultation.id,
          status: result.consultation.status,
          serviceType: result.consultation.serviceType,
          slotStartsAt: result.consultation.slotStartsAt.toISOString(),
          timezone: result.consultation.timezone,
          email: result.email,
        });
      } catch (error) {
        if (error instanceof ConsultationError) {
          return reply.status(error.statusCode).send({
            error: "ConsultationError",
            message: error.message,
          });
        }
        throw error;
      }
    },
  );

  app.post(
    "/consultations/upload",
    { preHandler: [optionalAuth] },
    async (request, reply) => {
      const body = request.body as {
        filename?: string;
        contentBase64?: string;
      };

      if (!body?.filename || !body?.contentBase64) {
        return reply.status(400).send({
          error: "ValidationError",
          message: "filename and contentBase64 are required",
        });
      }

      const buffer = Buffer.from(body.contentBase64, "base64");
      if (buffer.byteLength === 0 || buffer.byteLength > 5 * 1024 * 1024) {
        return reply.status(400).send({
          error: "ValidationError",
          message: "Attachment must be between 1 byte and 5MB",
        });
      }

      const key = await saveConsultationUpload({
        filename: body.filename,
        buffer,
      });

      return { attachmentKey: key };
    },
  );
}
