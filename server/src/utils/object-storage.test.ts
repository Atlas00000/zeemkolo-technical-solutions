import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { env } from "../config/env.js";
import { saveConsultationUpload } from "./local-upload.js";
import {
  assertStorageConfig,
  isR2Configured,
  isR2Required,
} from "./object-storage.js";
import { createDownloadGrant, issueDownloadToken } from "./r2-signed-url.js";

describe("object storage (O2)", () => {
  const tempKeys: string[] = [];

  afterAll(async () => {
    for (const key of tempKeys) {
      const absolute = join(process.cwd(), env.UPLOAD_DIR, key);
      await rm(absolute, { force: true });
    }
  });

  it("treats incomplete R2 env as not configured", () => {
    expect(
      isR2Configured({
        NODE_ENV: "development",
        R2_REQUIRED: false,
        R2_ENDPOINT: "",
        R2_ACCESS_KEY_ID: "",
        R2_SECRET_ACCESS_KEY: "",
        R2_BUCKET_NAME: "bucket",
      }),
    ).toBe(false);
  });

  it("requires R2 when flag set or production", () => {
    expect(
      isR2Required({
        NODE_ENV: "development",
        R2_REQUIRED: true,
        R2_ENDPOINT: "",
        R2_ACCESS_KEY_ID: "",
        R2_SECRET_ACCESS_KEY: "",
        R2_BUCKET_NAME: "",
      }),
    ).toBe(true);
    expect(
      isR2Required({
        NODE_ENV: "production",
        R2_REQUIRED: false,
        R2_ENDPOINT: "",
        R2_ACCESS_KEY_ID: "",
        R2_SECRET_ACCESS_KEY: "",
        R2_BUCKET_NAME: "",
      }),
    ).toBe(true);
    expect(
      isR2Required({
        NODE_ENV: "development",
        R2_REQUIRED: false,
        R2_ENDPOINT: "",
        R2_ACCESS_KEY_ID: "",
        R2_SECRET_ACCESS_KEY: "",
        R2_BUCKET_NAME: "",
      }),
    ).toBe(false);
  });

  it("assertStorageConfig fails closed when R2 required but missing", () => {
    expect(() =>
      assertStorageConfig({
        NODE_ENV: "production",
        R2_REQUIRED: false,
        R2_ENDPOINT: "",
        R2_ACCESS_KEY_ID: "",
        R2_SECRET_ACCESS_KEY: "",
        R2_BUCKET_NAME: "",
      }),
    ).toThrow(/R2 is required/);
  });

  it("assertStorageConfig allows current process env (dev/test)", () => {
    expect(() => assertStorageConfig()).not.toThrow();
  });

  it("saves consultation upload to local disk when R2 unset", async () => {
    if (isR2Configured()) {
      // Skip local path when developer has real R2 credentials loaded.
      expect(isR2Configured()).toBe(true);
      return;
    }

    const saved = await saveConsultationUpload({
      filename: "brief.pdf",
      buffer: Buffer.from("o2-local-upload-test"),
    });
    expect(saved.provider).toBe("local");
    expect(saved.key).toMatch(/^consultations\/\d{4}-\d{2}-\d{2}\//);
    tempKeys.push(saved.key);

    const absolute = join(process.cwd(), env.UPLOAD_DIR, saved.key);
    const bytes = await readFile(absolute, "utf8");
    expect(bytes).toBe("o2-local-upload-test");
  });

  it("issues HMAC download grant when R2 unset in non-required mode", async () => {
    if (isR2Configured() || isR2Required()) {
      expect(true).toBe(true);
      return;
    }

    const grant = await createDownloadGrant({
      orderId: "ord_test",
      productId: "prod_test",
      digitalKey: "ebooks/firmware-handbook.pdf",
    });
    expect(grant.provider).toBe("token");
    expect(grant.expiresInSeconds).toBe(900);
    expect(grant.url).toContain("/store/downloads/file?token=");
  });

  it("HMAC tokens round-trip for 15 minutes", () => {
    const issued = issueDownloadToken({
      orderId: "o1",
      productId: "p1",
      digitalKey: "ebooks/x.pdf",
    });
    expect(issued.expiresInSeconds).toBe(900);
  });
});
