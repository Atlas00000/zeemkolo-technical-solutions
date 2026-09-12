import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env.js";

export const DOWNLOAD_TTL_SECONDS = 15 * 60;

export class StorageError extends Error {
  constructor(
    message: string,
    readonly statusCode: number = 503,
  ) {
    super(message);
    this.name = "StorageError";
  }
}

type StorageEnv = {
  NODE_ENV: string;
  R2_REQUIRED: boolean;
  R2_ENDPOINT: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
};

export function isR2Configured(config: StorageEnv = env): boolean {
  return Boolean(
    config.R2_ENDPOINT &&
      config.R2_ACCESS_KEY_ID &&
      config.R2_SECRET_ACCESS_KEY &&
      config.R2_BUCKET_NAME,
  );
}

/** R2 mode: explicit flag, or production NODE_ENV. */
export function isR2Required(config: StorageEnv = env): boolean {
  return config.R2_REQUIRED || config.NODE_ENV === "production";
}

/** Call at process start — fail closed when R2 is required but incomplete. */
export function assertStorageConfig(config: StorageEnv = env): void {
  if (isR2Required(config) && !isR2Configured(config)) {
    throw new Error(
      "R2 is required (R2_REQUIRED=true or NODE_ENV=production) but R2_ENDPOINT / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET_NAME are incomplete",
    );
  }
}

function s3Client(config: StorageEnv = env) {
  return new S3Client({
    region: "auto",
    endpoint: config.R2_ENDPOINT,
    credentials: {
      accessKeyId: config.R2_ACCESS_KEY_ID,
      secretAccessKey: config.R2_SECRET_ACCESS_KEY,
    },
  });
}

export function guessContentType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".zip")) return "application/zip";
  if (lower.endsWith(".txt") || lower.endsWith(".md")) return "text/plain";
  return "application/octet-stream";
}

export async function putObject(input: {
  key: string;
  body: Buffer;
  contentType?: string;
}) {
  if (!isR2Configured()) {
    throw new StorageError("R2 is not configured", 503);
  }

  await s3Client().send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType ?? "application/octet-stream",
    }),
  );

  return { key: input.key, provider: "r2" as const };
}

export async function createR2SignedDownloadUrl(key: string) {
  if (!isR2Configured()) {
    return null;
  }

  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3Client(), command, {
    expiresIn: DOWNLOAD_TTL_SECONDS,
  });

  return {
    url,
    expiresInSeconds: DOWNLOAD_TTL_SECONDS,
    provider: "r2" as const,
  };
}
