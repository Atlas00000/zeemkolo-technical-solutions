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
    await check("API /forum/categories", async () => {
      const res = await fetch(`${API}/forum/categories`);
      const body = (await res.json()) as { categories?: unknown[] };
      const ok = res.status === 200 && (body.categories?.length ?? 0) > 0;
      return { ok, detail: `status=${res.status} count=${body.categories?.length ?? 0}` };
    }),
  );

  let threadId = "";
  checks.push(
    await check("API /forum/threads public read", async () => {
      const res = await fetch(`${API}/forum/threads`);
      const body = (await res.json()) as { threads?: { id: string }[] };
      threadId = body.threads?.[0]?.id ?? "";
      const ok = res.status === 200 && Boolean(threadId);
      return { ok, detail: `status=${res.status} threadId=${threadId || "none"}` };
    }),
  );

  checks.push(
    await check("API write without auth is rejected", async () => {
      const res = await fetch(`${API}/forum/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categorySlug: "general",
          title: "Smoke unauthorized",
          body: "This should be rejected by RBAC write guard.",
        }),
      });
      const ok = res.status === 401 || res.status === 403;
      return { ok, detail: `status=${res.status}` };
    }),
  );

  checks.push(
    await check("Web /forum SSR", async () => {
      const res = await fetch(`${WEB}/forum`);
      const html = await res.text();
      const ok =
        res.status === 200 &&
        (html.toLowerCase().includes("forum") || html.toLowerCase().includes("zeemble"));
      return { ok, detail: `status=${res.status}` };
    }),
  );

  checks.push(
    await check("Web thread page SSR", async () => {
      if (!threadId) return { ok: false, detail: "missing threadId" };
      const res = await fetch(`${WEB}/forum/threads/${threadId}`);
      const html = await res.text();
      const ok = res.status === 200 && html.toLowerCase().includes("zeemble");
      return { ok, detail: `status=${res.status}` };
    }),
  );

  const failed = checks.filter((c) => !c.ok);
  for (const c of checks) {
    console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.name} — ${c.detail}`);
  }

  if (failed.length) {
    console.error(`\n${failed.length}/${checks.length} Phase 4 smoke checks failed`);
    process.exit(1);
  }

  console.log(`\nAll ${checks.length} Phase 4 smoke checks passed`);
}

await main();
