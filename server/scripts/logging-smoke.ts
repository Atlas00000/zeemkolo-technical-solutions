/**
 * Live smoke: request-id echo on /health/live.
 * Usage: pnpm --filter @zeemkolo/server exec tsx scripts/logging-smoke.ts
 */
const API = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:5000";
const REQUEST_ID = "logging-smoke-req-id";

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

async function main() {
  const checks: Check[] = [];

  checks.push(
    await check("API /health/live echoes X-Request-Id", async () => {
      const res = await fetch(`${API}/health/live`, {
        headers: { "X-Request-Id": REQUEST_ID },
      });
      if (!res.ok) {
        return {
          ok: false,
          detail: `HTTP ${res.status} — is the API up at ${API}?`,
        };
      }
      const echoed = res.headers.get("x-request-id");
      if (echoed !== REQUEST_ID) {
        return {
          ok: false,
          detail: `expected X-Request-Id=${REQUEST_ID}, got ${echoed ?? "(missing)"}`,
        };
      }
      return { ok: true, detail: `echoed ${REQUEST_ID}` };
    }),
  );

  let failed = 0;
  for (const c of checks) {
    const mark = c.ok ? "PASS" : "FAIL";
    if (!c.ok) failed += 1;
    console.log(`[${mark}] ${c.name}: ${c.detail}`);
  }

  if (failed > 0) {
    console.error(`logging-smoke: ${failed} check(s) failed`);
    process.exit(1);
  }
  console.log("logging-smoke: all checks passed");
}

main();
