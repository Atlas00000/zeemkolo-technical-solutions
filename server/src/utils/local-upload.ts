import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import {
  StorageError,
  guessContentType,
  isR2Configured,
  isR2Required,
  putObject,
} from "./object-storage.js";

function buildConsultationKey(filename: string): string {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  return `consultations/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}`;
}

/**
 * Persist a consultation attachment.
 * - R2 when configured (PutObject)
 * - Local disk only in development/test when R2 is optional and unset
 */
export async function saveConsultationUpload(input: {
  filename: string;
  buffer: Buffer;
}): Promise<{ key: string; provider: "r2" | "local" }> {
  const key = buildConsultationKey(input.filename);

  if (isR2Configured()) {
    await putObject({
      key,
      body: input.buffer,
      contentType: guessContentType(input.filename),
    });
    return { key, provider: "r2" };
  }

  if (isR2Required()) {
    throw new StorageError(
      "R2 is required for consultation uploads but is not configured",
      503,
    );
  }

  const absolute = join(process.cwd(), env.UPLOAD_DIR, key);
  await mkdir(join(absolute, ".."), { recursive: true });
  await writeFile(absolute, input.buffer);
  return { key, provider: "local" };
}
