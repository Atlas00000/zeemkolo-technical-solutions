/**
 * Live O2 acceptance smoke against a running API + configured R2.
 *
 * Usage (API on :5000):
 *   pnpm --filter @zeemkolo/server exec tsx scripts/o2-r2-smoke.ts
 */
import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), "../.env") });

const API = process.env.API_URL ?? "http://localhost:5000";

type Check = { name: string; ok: boolean; detail: string };

async function check(
  name: string,
  fn: () => Promise<{ ok: boolean; detail: string }>,
): Promise<Check> {
  try {
    const result = await fn();
    return { name, ...result };
  } catch (error) {
    return {
      name,
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

function r2Client() {
  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

async function main() {
  const checks: Check[] = [];

  checks.push(
    await check("API health", async () => {
      const res = await fetch(`${API}/health`);
      const body = (await res.json()) as { status?: string };
      return {
        ok: res.status === 200 && body.status === "ok",
        detail: `status=${res.status}`,
      };
    }),
  );

  checks.push(
    await check("R2 env present", async () => {
      const ok = Boolean(
        process.env.R2_ENDPOINT &&
          process.env.R2_ACCESS_KEY_ID &&
          process.env.R2_SECRET_ACCESS_KEY &&
          process.env.R2_BUCKET_NAME,
      );
      return {
        ok,
        detail: ok
          ? `bucket=${process.env.R2_BUCKET_NAME}`
          : "missing R2_* keys",
      };
    }),
  );

  let attachmentKey = "";

  checks.push(
    await check("POST /consultations/upload → provider r2", async () => {
      const payload = {
        filename: "o2-smoke.txt",
        contentBase64: Buffer.from(
          `o2-r2-smoke ${new Date().toISOString()}`,
        ).toString("base64"),
      };
      const res = await fetch(`${API}/consultations/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as {
        attachmentKey?: string;
        provider?: string;
        message?: string;
      };
      attachmentKey = body.attachmentKey ?? "";
      const ok =
        res.status === 200 &&
        body.provider === "r2" &&
        Boolean(body.attachmentKey?.startsWith("consultations/"));
      return {
        ok,
        detail: `status=${res.status} provider=${body.provider ?? "n/a"} key=${attachmentKey ? "set" : "missing"} ${body.message ?? ""}`.trim(),
      };
    }),
  );

  checks.push(
    await check("HeadObject confirms upload in bucket", async () => {
      if (!attachmentKey) {
        return { ok: false, detail: "no attachmentKey from upload step" };
      }
      const out = await r2Client().send(
        new HeadObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: attachmentKey,
        }),
      );
      const ok = (out.ContentLength ?? 0) > 0;
      return {
        ok,
        detail: `bytes=${out.ContentLength ?? 0} type=${out.ContentType ?? "n/a"}`,
      };
    }),
  );

  checks.push(
    await check("Paid digital download grant → provider r2", async () => {
      const productsRes = await fetch(`${API}/store/products`);
      const products = (await productsRes.json()) as {
        products: { id: string; slug: string; type: string }[];
      };
      const digital = products.products.find((p) => p.slug === "firmware-handbook");
      if (!digital) {
        return { ok: false, detail: "firmware-handbook product missing — seed DB?" };
      }

      const created = await fetch(`${API}/store/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "o2-r2-smoke@example.com",
          currency: "USD",
          paymentProvider: "stripe",
          items: [{ productId: digital.id, quantity: 1 }],
        }),
      });
      const order = (await created.json()) as { id?: string; message?: string };
      if (created.status !== 201 || !order.id) {
        return {
          ok: false,
          detail: `order create status=${created.status} ${order.message ?? ""}`,
        };
      }

      const paid = await fetch(`${API}/store/orders/${order.id}/confirm-test`, {
        method: "POST",
      });
      if (paid.status !== 200) {
        return { ok: false, detail: `confirm-test status=${paid.status}` };
      }

      const dl = await fetch(
        `${API}/store/orders/${order.id}/downloads/${digital.id}?email=${encodeURIComponent("o2-r2-smoke@example.com")}`,
        { method: "POST" },
      );
      const grant = (await dl.json()) as {
        provider?: string;
        expiresInSeconds?: number;
        url?: string;
        message?: string;
      };
      const ok =
        dl.status === 200 &&
        grant.provider === "r2" &&
        grant.expiresInSeconds === 900 &&
        Boolean(grant.url?.includes("r2.cloudflarestorage.com") || grant.url?.startsWith("http"));
      return {
        ok,
        detail: `status=${dl.status} provider=${grant.provider ?? "n/a"} ttl=${grant.expiresInSeconds ?? "n/a"} ${grant.message ?? ""}`.trim(),
      };
    }),
  );

  checks.push(
    await check("Fail-closed helper rejects incomplete required R2", async () => {
      const { assertStorageConfig } = await import("../src/utils/object-storage.js");
      let threw = false;
      try {
        assertStorageConfig({
          NODE_ENV: "production",
          R2_REQUIRED: false,
          R2_ENDPOINT: "",
          R2_ACCESS_KEY_ID: "",
          R2_SECRET_ACCESS_KEY: "",
          R2_BUCKET_NAME: "",
        });
      } catch {
        threw = true;
      }
      return { ok: threw, detail: threw ? "threw as expected" : "did not throw" };
    }),
  );

  const failed = checks.filter((c) => !c.ok);
  for (const c of checks) {
    console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.name} — ${c.detail}`);
  }
  console.log("");
  if (failed.length) {
    console.log(`Phase O2 live smoke: FAILED (${failed.length}/${checks.length})`);
    process.exit(1);
  }
  console.log(`Phase O2 live smoke: PASSED (${checks.length}/${checks.length})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
