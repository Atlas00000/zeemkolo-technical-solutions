import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../config/env.js";

const DOWNLOAD_TTL_SECONDS = 15 * 60;

function r2Configured() {
  return Boolean(
    env.R2_ENDPOINT && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY,
  );
}

function s3Client() {
  return new S3Client({
    region: "auto",
    endpoint: env.R2_ENDPOINT,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}

export async function createR2SignedDownloadUrl(key: string) {
  if (!r2Configured()) {
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

  const token = issueDownloadToken(input);
  const base = input.publicApiBase ?? `http://localhost:${env.PORT}`;
  return {
    url: `${base}/store/downloads/file?token=${token.token}`,
    expiresInSeconds: token.expiresInSeconds,
    provider: token.provider,
  };
}
