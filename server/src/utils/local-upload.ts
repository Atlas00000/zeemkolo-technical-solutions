import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";

export async function saveConsultationUpload(input: {
  filename: string;
  buffer: Buffer;
}): Promise<string> {
  const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const key = `consultations/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}`;
  const absolute = join(process.cwd(), env.UPLOAD_DIR, key);
  await mkdir(join(absolute, ".."), { recursive: true });
  await writeFile(absolute, input.buffer);
  return key;
}
