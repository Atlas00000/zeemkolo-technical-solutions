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

async function followRedirectMeta(path: string) {
  const res = await fetch(`${WEB}${path}`, { redirect: "manual" });
  const location = res.headers.get("location") ?? "";
  return { status: res.status, location };
}

async function main() {
  const checks: Check[] = [];

  checks.push(
    await check("Web marketing homepage", async () => {
      const res = await fetch(`${WEB}/`);
      const html = await res.text();
      const ok =
        res.status === 200 &&
        html.includes("Zeemkolo") &&
        html.toLowerCase().includes("consultation");
      return { ok, detail: `status=${res.status}` };
    }),
  );

  checks.push(
    await check("Homepage has services + Zeemble signals", async () => {
      const html = await (await fetch(`${WEB}/`)).text();
      const ok =
        html.toLowerCase().includes("services") &&
        html.toLowerCase().includes("zeemble");
      return { ok, detail: ok ? "brand sections present" : "missing sections" };
    }),
  );

  for (const [path, expectContains] of [
    ["/qr/placeholder", "/"],
    ["/qr/consult", "/consultation"],
    ["/qr/zeemble", "/zeemble"],
    ["/qr/store", "/store"],
    ["/shop", "/store"],
  ] as const) {
    checks.push(
      await check(`301 ${path}`, async () => {
        const { status, location } = await followRedirectMeta(path);
        const permanent = status === 301 || status === 308;
        const ok = permanent && location.includes(expectContains);
        return {
          ok,
          detail: `status=${status} location=${location || "(none)"}`,
        };
      }),
    );
  }

  const failed = checks.filter((c) => !c.ok);
  for (const c of checks) {
    console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.name} — ${c.detail}`);
  }

  if (failed.length) {
    console.error(`\n${failed.length}/${checks.length} Phase 6 smoke checks failed`);
    process.exit(1);
  }

  console.log(`\nAll ${checks.length} Phase 6 smoke checks passed`);
}

await main();
