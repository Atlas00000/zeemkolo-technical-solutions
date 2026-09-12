#!/usr/bin/env node
/**
 * Run Wrangler without CF_API_TOKEN / CLOUDFLARE_API_TOKEN from .env
 * blocking OAuth (Wrangler refuses login when those are set).
 *
 *   node scripts/r2-wrangler.mjs login
 *   node scripts/r2-wrangler.mjs r2 bucket list
 *   node scripts/r2-wrangler.mjs r2 object get ...
 */
import {
  copyFileSync,
  existsSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(process.cwd());
const envFiles = [resolve(root, ".env"), resolve(root, "server/.env")].filter(
  (p) => existsSync(p),
);

function stripTokens(path) {
  const bak = `${path}.wrangler-tmp`;
  const original = readFileSync(path, "utf8");
  copyFileSync(path, bak);
  const stripped = original
    .split(/\r?\n/)
    .map((line) =>
      /^(CF_API_TOKEN|CLOUDFLARE_API_TOKEN)=/.test(line)
        ? `# ${line} (stripped for wrangler)`
        : line,
    )
    .join("\n");
  writeFileSync(path, stripped);
  return { path, bak, original };
}

function restore(backups) {
  for (const b of backups) {
    writeFileSync(b.path, b.original);
    try {
      unlinkSync(b.bak);
    } catch {
      /* ignore */
    }
  }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    "Usage: node scripts/r2-wrangler.mjs login | r2 bucket list | ...",
  );
  process.exit(1);
}

const backups = envFiles.map(stripTokens);
const env = { ...process.env, CF_API_TOKEN: "", CLOUDFLARE_API_TOKEN: "" };

let status = 1;
try {
  const result = spawnSync("wrangler", args, {
    stdio: "inherit",
    shell: true,
    env,
    cwd: root,
  });
  status = result.status ?? 1;
} catch (err) {
  console.error(err);
  status = 1;
} finally {
  restore(backups);
}

process.exit(status);
