/**
 * Set Paystack production vars on Railway `zeemkolo-server`.
 * Reads LIVE key from argv or env — never prints secret values.
 *
 * Usage (from server/):
 *   node scripts/set-railway-paystack.mjs --key sk_live_…
 *   PAYSTACK_LIVE_SECRET_KEY=sk_live_… node scripts/set-railway-paystack.mjs
 *
 * Optional:
 *   --callback https://www.zeemkolo.com
 *   --deploy   (omit --skip-deploys so Railway redeploys)
 */
import { spawnSync } from "node:child_process";

const SERVICE = "zeemkolo-server";

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return undefined;
}

const liveKey =
  argValue("--key")?.trim() ||
  process.env.PAYSTACK_LIVE_SECRET_KEY?.trim() ||
  "";
const callback =
  argValue("--callback")?.trim() ||
  "https://www.zeemkolo.com";
const doDeploy = process.argv.includes("--deploy");

if (!liveKey.startsWith("sk_live_")) {
  console.error(
    "Refusing to set: provide a live secret via --key sk_live_… or PAYSTACK_LIVE_SECRET_KEY",
  );
  process.exit(1);
}

function setVar(key, value) {
  const args = [
    "variable",
    "set",
    `${key}=${value}`,
    "--service",
    SERVICE,
  ];
  if (!doDeploy) args.push("--skip-deploys");
  const result = spawnSync("railway", args, {
    encoding: "utf8",
    shell: true,
  });
  if (result.status !== 0) {
    const err = (result.stderr || result.stdout || "").trim();
    throw new Error(`Failed to set ${key}: ${err || `exit ${result.status}`}`);
  }
  console.log(`set ${key}`);
}

setVar("PAYSTACK_SECRET_KEY", liveKey);
setVar("PAYMENT_CALLBACK_BASE_URL", callback);

console.log(
  JSON.stringify(
    {
      service: SERVICE,
      callback,
      webhookUrl: "https://api.zeemkolo.com/payments/webhooks/paystack",
      redeploy: doDeploy,
      next: [
        "Paystack Dashboard → Settings → API Keys & Webhooks (Live)",
        "Live Webhook URL = https://api.zeemkolo.com/payments/webhooks/paystack",
        "Live Callback URL = https://www.zeemkolo.com (fallback)",
        "Deploy Paystack code to Railway if not already live",
      ],
    },
    null,
    2,
  ),
);
