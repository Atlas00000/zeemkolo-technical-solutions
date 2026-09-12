#!/usr/bin/env node
/**
 * R2 helpers using S3-compatible API + .env (R2_*).
 * Plain Node (no tsx) so Wrangler's esbuild pin cannot break this CLI.
 *
 *   pnpm r2:info
 *   pnpm r2:ls [prefix]
 *   pnpm r2:head -- <key>
 *   pnpm r2:get -- <key> [outfile]
 *   pnpm r2:put -- <key> <localFile>
 */
import { createWriteStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { pipeline } from "node:stream/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const serverRoot = resolve(repoRoot, "server");

// Resolve AWS SDK from the server package (workspace dep).
const requireFromServer = createRequire(resolve(serverRoot, "package.json"));
const {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} = requireFromServer("@aws-sdk/client-s3");

const dotenvPath = requireFromServer.resolve("dotenv");
const { config: loadEnv } = await import(pathToFileURL(dotenvPath).href);
loadEnv({ path: resolve(repoRoot, ".env") });
loadEnv({ path: resolve(serverRoot, ".env") });

function requireR2() {
  const endpoint = process.env.R2_ENDPOINT ?? "";
  const accessKeyId = process.env.R2_ACCESS_KEY_ID ?? "";
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY ?? "";
  const bucket = process.env.R2_BUCKET_NAME || "zeemkolo-technical-solutions";

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    console.error(
      "Missing R2_ENDPOINT / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY in .env",
    );
    process.exit(1);
  }

  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  return { client, bucket, endpoint };
}

function usage() {
  console.log(`R2 helpers (S3 API via .env)

  pnpm r2:info
  pnpm r2:ls [prefix]
  pnpm r2:head -- <key>
  pnpm r2:get -- <key> [outfile]
  pnpm r2:put -- <key> <localFile>

Wrangler (v3 pinned for Node 20):
  pnpm r2:login
  pnpm r2:buckets
`);
}

async function cmdInfo() {
  const { bucket, endpoint } = requireR2();
  console.log(`bucket=${bucket}`);
  console.log(`endpoint=${endpoint}`);
  console.log(`R2_REQUIRED=${process.env.R2_REQUIRED ?? "false"}`);
  console.log(`accountId=${process.env.R2_ACCOUNT_ID ? "set" : "unset"}`);
}

async function cmdLs(prefix = "consultations/") {
  const { client, bucket } = requireR2();
  let token;
  let total = 0;
  do {
    const out = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix || undefined,
        ContinuationToken: token,
        MaxKeys: 100,
      }),
    );
    for (const obj of out.Contents ?? []) {
      const size = obj.Size ?? 0;
      const when = obj.LastModified?.toISOString() ?? "";
      console.log(`${size.toString().padStart(10)}  ${when}  ${obj.Key}`);
      total += 1;
    }
    token = out.IsTruncated ? out.NextContinuationToken : undefined;
  } while (token);
  console.log(`\n${total} object(s) under prefix "${prefix}"`);
}

async function cmdHead(key) {
  if (!key) {
    console.error("Usage: pnpm r2:head -- <key>");
    process.exit(1);
  }
  const { client, bucket } = requireR2();
  const out = await client.send(
    new HeadObjectCommand({ Bucket: bucket, Key: key }),
  );
  console.log(
    JSON.stringify(
      {
        key,
        contentLength: out.ContentLength,
        contentType: out.ContentType,
        lastModified: out.LastModified?.toISOString(),
        etag: out.ETag,
      },
      null,
      2,
    ),
  );
}

async function cmdGet(key, outfile) {
  if (!key) {
    console.error("Usage: pnpm r2:get -- <key> [outfile]");
    process.exit(1);
  }
  const { client, bucket } = requireR2();
  const out = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );
  const dest = outfile || basename(key);
  await pipeline(out.Body, createWriteStream(dest));
  console.log(`wrote ${dest} (${out.ContentLength ?? "?"} bytes)`);
}

async function cmdPut(key, filePath) {
  if (!key || !filePath) {
    console.error("Usage: pnpm r2:put -- <key> <localFile>");
    process.exit(1);
  }
  const { client, bucket } = requireR2();
  const body = await readFile(filePath);
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
    }),
  );
  console.log(`put s3://${bucket}/${key} (${body.byteLength} bytes)`);
}

const [cmd, ...args] = process.argv.slice(2);

try {
  switch (cmd) {
    case "info":
      await cmdInfo();
      break;
    case "ls":
      await cmdLs(args[0] ?? "consultations/");
      break;
    case "head":
      await cmdHead(args[0]);
      break;
    case "get":
      await cmdGet(args[0], args[1]);
      break;
    case "put":
      await cmdPut(args[0], args[1]);
      break;
    case "help":
    case undefined:
      usage();
      break;
    default:
      console.error(`Unknown command: ${cmd}`);
      usage();
      process.exit(1);
  }
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
