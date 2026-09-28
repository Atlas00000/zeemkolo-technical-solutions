/**
 * Push local server/.env (+ root .env) into Railway zeemkolo-server variables.
 * Prints key names only — never values.
 */
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const SERVICE = "zeemkolo-server";

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const out = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i < 0) continue;
    const key = trimmed.slice(0, i).trim();
    let value = trimmed.slice(i + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function setVar(key, value, { skipDeploys = true } = {}) {
  const args = [
    "variable",
    "set",
    key,
    "--stdin",
    "--service",
    SERVICE,
    "--json",
  ];
  if (skipDeploys) args.push("--skip-deploys");
  const result = spawnSync("railway", args, {
    input: value,
    encoding: "utf8",
    shell: true,
  });
  if (result.status !== 0) {
    const err = (result.stderr || result.stdout || "").trim();
    throw new Error(`Failed to set ${key}: ${err || `exit ${result.status}`}`);
  }
}

const root = resolve(process.cwd(), "..");
const merged = {
  ...parseEnvFile(resolve(root, ".env")),
  ...parseEnvFile(resolve(process.cwd(), ".env")),
};

const staticVars = {
  NODE_ENV: "production",
  HOST: "0.0.0.0",
  R2_REQUIRED: "true",
  LOG_LEVEL: merged.LOG_LEVEL?.trim() || "info",
  EMAIL_FROM: merged.EMAIL_FROM?.trim() || "noreply@zeemkolo.com",
  ADMIN_EMAIL: merged.ADMIN_EMAIL?.trim() || "admin@zeemkolo.com",
  R2_BUCKET_NAME:
    merged.R2_BUCKET_NAME?.trim() || "zeemkolo-technical-solutions",
  // Placeholder until Vercel URL exists — update later
  CORS_ORIGIN:
    merged.CORS_ORIGIN?.trim() &&
    !merged.CORS_ORIGIN.includes("localhost:3000") &&
    merged.NODE_ENV === "production"
      ? merged.CORS_ORIGIN.trim()
      : "http://localhost:3000",
  DATABASE_URL: "${{Postgres.DATABASE_URL}}",
  REDIS_URL: "${{Redis.REDIS_URL}}",
};

const fromLocal = [
  "CLERK_SECRET_KEY",
  "CLERK_PUBLISHABLE_KEY",
  "CLERK_WEBHOOK_SECRET",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_ENDPOINT",
  "R2_PUBLIC_URL",
  "RESEND_API_KEY",
  "SENTRY_DSN",
  "DOWNLOAD_TOKEN_SECRET",
];

const report = { set: [], skipped: [], generated: [] };

for (const [key, value] of Object.entries(staticVars)) {
  setVar(key, value);
  report.set.push(key);
}

for (const key of fromLocal) {
  let value = merged[key]?.trim() ?? "";
  if (key === "DOWNLOAD_TOKEN_SECRET") {
    if (
      !value ||
      value === "dev-download-token-secret" ||
      value.length < 24
    ) {
      value = randomBytes(32).toString("hex");
      report.generated.push(key);
    }
  }
  if (!value) {
    report.skipped.push(key);
    continue;
  }
  setVar(key, value);
  report.set.push(key);
}

console.log(JSON.stringify(report, null, 2));
