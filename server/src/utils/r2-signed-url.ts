import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../config/env.js";
import {
  DOWNLOAD_TTL_SECONDS,
  StorageError,
  createR2SignedDownloadUrl,
  isR2Configured,
  isR2Required,
} from "./object-storage.js";

export { createR2SignedDownloadUrl, DOWNLOAD_TTL_SECONDS };

/** HMAC download token used when R2 is unavailable (local/dev fallback). */
export function issueDownloadToken(input: {
  orderId: string;
  productId: string;
  digitalKey: string;
}) {
  const exp = Math.floor(Date.now() / 1000) + DOWNLOAD_TTL_SECONDS;
  const payload = `${input.orderId}.${input.productId}.${exp}.${input.digitalKey}`;
  const sig = createHmac("sha256", env.DOWNLOAD_TOKEN_SECRET)
    .update(payload)
    .digest("hex");
  return {
    token: Buffer.from(`${payload}.${sig}`).toString("base64url"),
    expiresInSeconds: DOWNLOAD_TTL_SECONDS,
    provider: "token" as const,
  };
}

export function verifyDownloadToken(token: string) {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(".");
    if (parts.length < 5) return null;
    const [orderId, productId, expStr, ...rest] = parts;
    const sig = rest.pop()!;
    const digitalKey = rest.join(".");
    const exp = Number(expStr);
    if (!orderId || !productId || !digitalKey || !Number.isFinite(exp)) {
      return null;
    }
    if (exp < Math.floor(Date.now() / 1000)) return null;

    const payload = `${orderId}.${productId}.${exp}.${digitalKey}`;
    const expected = createHmac("sha256", env.DOWNLOAD_TOKEN_SECRET)
      .update(payload)
      .digest("hex");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    return { orderId, productId, digitalKey, exp };
  } catch {
    return null;
  }
}

export async function createDownloadGrant(input: {
  orderId: string;
  productId: string;
  digitalKey: string;
  publicApiBase?: string;
}) {
  const signed = await createR2SignedDownloadUrl(input.digitalKey);
  if (signed) return signed;

  if (isR2Required()) {
    throw new StorageError(
      "R2 is required for digital downloads but is not configured",
      503,
    );
  }

  // Development / test fallback only when R2 is optional and unset.
  if (isR2Configured()) {
    throw new StorageError("R2 signed URL could not be created", 503);
  }

  const token = issueDownloadToken(input);
  const base = input.publicApiBase ?? `http://localhost:${env.PORT}`;
  return {
    url: `${base}/store/downloads/file?token=${token.token}`,
    expiresInSeconds: token.expiresInSeconds,
    provider: token.provider,
  };
}
