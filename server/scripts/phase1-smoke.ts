/**
 * Live smoke checks against running Phase 1 servers.
 * Usage: pnpm --filter @zeemkolo/server test:smoke
 */
const API = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:5000";
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
    await check("API /health", async () => {
      const res = await fetch(`${API}/health`);
      const body = (await res.json()) as { status?: string; database?: string; redis?: string };
      const ok = res.status === 200 && body.status === "ok" && body.database === "up" && body.redis === "up";
      return { ok, detail: JSON.stringify(body) };
    }),
  );

  checks.push(
    await check("API /auth/me unauthorized", async () => {
      const res = await fetch(`${API}/auth/me`);
      const body = (await res.json()) as { error?: string };
      const ok = res.status === 401 && body.error === "Unauthorized";
      return { ok, detail: `status=${res.status} body=${JSON.stringify(body)}` };
    }),
  );

  checks.push(
    await check("API /auth/matric/claim unauthorized", async () => {
      const res = await fetch(`${API}/auth/matric/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "ZMB-2026-001" }),
      });
      const body = (await res.json()) as { error?: string };
      const ok = res.status === 401 && body.error === "Unauthorized";
      return { ok, detail: `status=${res.status} body=${JSON.stringify(body)}` };
    }),
  );

  checks.push(
    await check("Web /", async () => {
      const res = await fetch(WEB);
      const html = await res.text();
      const ok = res.status === 200 && html.includes("Zeemkolo");
      return { ok, detail: `status=${res.status}` };
    }),
  );

  checks.push(
    await check("Web /sign-in", async () => {
      const res = await fetch(`${WEB}/sign-in`);
      return { ok: res.status === 200, detail: `status=${res.status}` };
    }),
  );

  checks.push(
    await check("Web /claim-matric", async () => {
      const res = await fetch(`${WEB}/claim-matric`);
      const html = await res.text();
      const ok = res.status === 200 && html.toLowerCase().includes("matric");
      return { ok, detail: `status=${res.status}` };
    }),
  );

  const failed = checks.filter((c) => !c.ok);
  for (const c of checks) {
    console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.name} — ${c.detail}`);
  }

  if (failed.length) {
    console.error(`\n${failed.length}/${checks.length} smoke checks failed`);
    process.exit(1);
  }

  console.log(`\nAll ${checks.length} Phase 1 smoke checks passed`);
}

await main();
