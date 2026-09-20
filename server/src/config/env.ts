import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { z } from "zod";

loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), "../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z
    .string()
    .default(
      "postgresql://zeemkolo_admin:zeemkolo_secret_password@localhost:5432/zeemkolo_db?schema=public",
    ),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  /** Comma-separated origins, e.g. `https://app.example.com,http://localhost:3000` */
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().optional().default(""),
  RESEND_API_KEY: z.string().optional().default(""),
  EMAIL_FROM: z.string().default("noreply@zeemkolo.com"),
  ADMIN_EMAIL: z.string().default("admin@zeemkolo.com"),
  UPLOAD_DIR: z.string().default("uploads"),
  /** When true (or NODE_ENV=production), R2 must be fully configured — no local/HMAC fallback. */
  R2_REQUIRED: z
    .string()
    .optional()
    .default("false")
    .transform((v) => ["1", "true", "yes", "on"].includes(v.toLowerCase())),
  R2_ACCOUNT_ID: z.string().optional().default(""),
  R2_ACCESS_KEY_ID: z.string().optional().default(""),
  R2_SECRET_ACCESS_KEY: z.string().optional().default(""),
  R2_BUCKET_NAME: z.string().optional().default("zeemkolo-technical-solutions"),
  R2_ENDPOINT: z.string().optional().default(""),
  R2_PUBLIC_URL: z.string().optional().default(""),
  PAYSTACK_SECRET_KEY: z.string().optional().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
  DOWNLOAD_TOKEN_SECRET: z.string().optional().default("dev-download-token-secret"),
  /** Optional Sentry DSN — errors are no-ops when empty (O5.1). */
  SENTRY_DSN: z.string().optional().default(""),
  /** When true, enable GET /debug/sentry test route (never in production). */
  SENTRY_ENABLE_TEST_ROUTE: z
    .string()
    .optional()
    .default("false")
    .transform((v) => ["1", "true", "yes", "on"].includes(v.toLowerCase())),
  /** Pino log level for Fastify (default info). */
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
});

export const env = envSchema.parse(process.env);
