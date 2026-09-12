import { defineConfig, devices } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

function loadClientEnvLocal(): Record<string, string> {
  const path = resolve("client/.env.local");
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const clientEnv = loadClientEnvLocal();

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  timeout: 90_000,
  use: {
    baseURL,
    trace: "on-first-retry",
    ...devices["Desktop Chrome"],
  },
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command:
          "pnpm --filter @zeemkolo/client exec next dev --turbopack --port 3000",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        env: {
          ...process.env,
          ...clientEnv,
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
            process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
            clientEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
            "pk_test_Y2xlcmsucGxhY2Vob2xkZXIuZGV2JA",
          NEXT_PUBLIC_API_URL:
            process.env.NEXT_PUBLIC_API_URL ||
            clientEnv.NEXT_PUBLIC_API_URL ||
            "http://localhost:5000",
          // Keep Sentry off during e2e so OpenTelemetry does not load.
          NEXT_PUBLIC_SENTRY_DSN: "",
          SENTRY_DSN: "",
        },
      },
});
