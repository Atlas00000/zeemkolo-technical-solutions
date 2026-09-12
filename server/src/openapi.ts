/** Published OpenAPI 3.1 contract for Zeemkolo API (O4.5). */
export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "Zeemkolo Technical Solutions API",
    version: "0.5.0",
    description:
      "Fastify API for Zeemkolo / Zeemble. Errors use `{ error, message, code?, requestId }`. Pass `X-Request-Id` and `Idempotency-Key` on mutating POSTs where documented. Health: `/health/live` (liveness) and `/health/ready` (readiness).",
  },
  servers: [{ url: "http://localhost:5000", description: "Local" }],
  paths: {
    "/health/live": {
      get: {
        summary: "Liveness probe (no dependency checks)",
        responses: {
          "200": { description: "Process alive" },
        },
      },
    },
    "/health/ready": {
      get: {
        summary: "Readiness probe (Postgres + Redis)",
        responses: {
          "200": { description: "Ready" },
          "503": { description: "Not ready" },
        },
      },
    },
    "/health": {
      get: {
        summary: "Readiness alias (503 when degraded)",
        responses: {
          "200": {
            description: "Service status",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                    database: { type: "string" },
                    redis: { type: "string" },
                  },
                },
              },
            },
          },
          "503": { description: "Dependencies down" },
        },
      },
    },
    "/consultations": {
      post: {
        summary: "Book a consultation slot",
        parameters: [
          {
            name: "Idempotency-Key",
            in: "header",
            required: false,
            schema: { type: "string" },
          },
          {
            name: "X-Request-Id",
            in: "header",
            required: false,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "guestName",
                  "guestEmail",
                  "serviceType",
                  "projectBrief",
                  "slotStartsAt",
                ],
                properties: {
                  guestName: { type: "string" },
                  guestEmail: { type: "string", format: "email" },
                  serviceType: { type: "string" },
                  projectBrief: { type: "string" },
                  slotStartsAt: { type: "string", format: "date-time" },
                  timezone: { type: "string" },
                  attachmentKey: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Booked" },
          "409": { description: "Slot locked / conflict" },
        },
      },
    },
    "/store/orders": {
      post: {
        summary: "Create PENDING order (15m reservation metadata in Redis)",
        parameters: [
          {
            name: "Idempotency-Key",
            in: "header",
            required: false,
            schema: { type: "string" },
          },
        ],
        responses: {
          "201": { description: "Order created" },
          "409": { description: "Insufficient stock" },
        },
      },
    },
    "/admin/orders": {
      get: {
        summary: "Admin order list (cursor pagination)",
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer" } },
          { name: "cursor", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Paginated orders" } },
      },
    },
    "/admin/consultations": {
      get: {
        summary: "Admin consultation list (cursor pagination)",
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer" } },
          { name: "cursor", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Paginated consultations" } },
      },
    },
    "/forum/threads": {
      get: {
        summary: "Public forum threads (cursor pagination)",
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer" } },
          { name: "cursor", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Paginated threads" } },
      },
    },
    "/payments/webhooks/paystack": {
      post: {
        summary: "Paystack webhook (HMAC over raw body)",
        responses: { "200": { description: "Accepted" } },
      },
    },
    "/payments/webhooks/stripe": {
      post: {
        summary: "Stripe webhook (signature over raw body)",
        responses: { "200": { description: "Accepted" } },
      },
    },
    "/openapi.json": {
      get: {
        summary: "This OpenAPI document",
        responses: { "200": { description: "OpenAPI JSON" } },
      },
    },
  },
  components: {
    schemas: {
      ErrorEnvelope: {
        type: "object",
        required: ["error", "message", "requestId"],
        properties: {
          error: { type: "string" },
          message: { type: "string" },
          code: { type: "string" },
          requestId: { type: "string" },
        },
      },
    },
  },
} as const;
