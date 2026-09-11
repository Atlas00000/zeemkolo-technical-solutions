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
    await check("API /consultations/services", async () => {
      const res = await fetch(`${API}/consultations/services`);
      const body = (await res.json()) as { services?: string[] };
      const ok = res.status === 200 && (body.services?.length ?? 0) > 0;
      return { ok, detail: `status=${res.status} count=${body.services?.length ?? 0}` };
    }),
  );

  checks.push(
    await check("API /consultations/slots", async () => {
      const res = await fetch(`${API}/consultations/slots`);
      const body = (await res.json()) as { slots?: unknown[] };
      const ok = res.status === 200 && Array.isArray(body.slots) && body.slots.length > 0;
      return { ok, detail: `status=${res.status} slots=${body.slots?.length ?? 0}` };
    }),
  );

  checks.push(
    await check("Web /consultation", async () => {
      const res = await fetch(`${WEB}/consultation`);
      const html = await res.text();
      const ok = res.status === 200 && html.toLowerCase().includes("consultation");
      return { ok, detail: `status=${res.status}` };
    }),
  );

  const failed = checks.filter((c) => !c.ok);
  for (const c of checks) {
    console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.name} — ${c.detail}`);
  }

  if (failed.length) {
    console.error(`\n${failed.length}/${checks.length} Phase 2 smoke checks failed`);
    process.exit(1);
  }

  console.log(`\nAll ${checks.length} Phase 2 smoke checks passed`);
}

await main();
