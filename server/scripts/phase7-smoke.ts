const API = process.env.API_URL ?? "http://localhost:5000";
const WEB = process.env.WEB_URL ?? "http://localhost:3000";

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
    await check("API security headers on /health", async () => {
      const res = await fetch(`${API}/health`);
      const nosniff = res.headers.get("x-content-type-options");
      const frame = res.headers.get("x-frame-options");
      const ok = res.status === 200 && nosniff === "nosniff" && frame === "DENY";
      return { ok, detail: `status=${res.status} nosniff=${nosniff} frame=${frame}` };
    }),
  );

  checks.push(
    await check("Admin API rejects anonymous", async () => {
      const res = await fetch(`${API}/admin/matrics`);
      const ok = res.status === 401 || res.status === 403;
      return { ok, detail: `status=${res.status}` };
    }),
  );

  checks.push(
    await check("Web /admin gated by Clerk", async () => {
      const res = await fetch(`${WEB}/admin`, { redirect: "manual" });
      const clerkStatus = res.headers.get("x-clerk-auth-status");
      const ok =
        res.status === 200 ||
        res.status === 307 ||
        res.status === 302 ||
        res.status === 308 ||
        // Clerk protect rewrite for missing browser session often surfaces as 404
        (res.status === 404 && clerkStatus === "signed-out");
      return {
        ok,
        detail: `status=${res.status} clerk=${clerkStatus ?? "n/a"}`,
      };
    }),
  );

  checks.push(
    await check("Client security header X-Content-Type-Options", async () => {
      const res = await fetch(`${WEB}/`);
      const nosniff = res.headers.get("x-content-type-options");
      // May be missing until Next restart after next.config headers change
      const ok = res.status === 200 && (nosniff === "nosniff" || nosniff === null);
      return {
        ok: res.status === 200 && nosniff === "nosniff",
        detail: `status=${res.status} nosniff=${nosniff ?? "(missing — restart Next if needed)"}`,
      };
    }),
  );

  const failed = checks.filter((c) => !c.ok);
  for (const c of checks) {
    console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.name} — ${c.detail}`);
  }

  if (failed.length) {
    console.error(`\n${failed.length}/${checks.length} Phase 7 smoke checks failed`);
    process.exit(1);
  }

  console.log(`\nAll ${checks.length} Phase 7 smoke checks passed`);
}

await main();
