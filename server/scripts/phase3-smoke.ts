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
    await check("API /lms/courses", async () => {
      const res = await fetch(`${API}/lms/courses`);
      const body = (await res.json()) as { courses?: unknown[] };
      const ok = res.status === 200 && (body.courses?.length ?? 0) > 0;
      return { ok, detail: `status=${res.status} count=${body.courses?.length ?? 0}` };
    }),
  );

  checks.push(
    await check("API preview lesson ungated", async () => {
      const res = await fetch(
        `${API}/lms/courses/embedded-systems-foundations/lessons/welcome-to-zeemble`,
      );
      const body = (await res.json()) as { gated?: boolean; markdownBody?: string };
      const ok =
        res.status === 200 && body.gated === false && (body.markdownBody?.length ?? 0) > 100;
      return { ok, detail: `status=${res.status} gated=${body.gated}` };
    }),
  );

  checks.push(
    await check("API gated lesson truncated for guest", async () => {
      const res = await fetch(
        `${API}/lms/courses/embedded-systems-foundations/lessons/lab-safety-and-tools`,
      );
      const body = (await res.json()) as { gated?: boolean; markdownBody?: string };
      const ok =
        res.status === 200 &&
        body.gated === true &&
        (body.markdownBody?.includes("…") ?? false);
      return { ok, detail: `status=${res.status} gated=${body.gated}` };
    }),
  );

  checks.push(
    await check("Web /zeemble", async () => {
      const res = await fetch(`${WEB}/zeemble`);
      const html = await res.text();
      const ok =
        res.status === 200 &&
        (html.toLowerCase().includes("zeemble") || html.toLowerCase().includes("course"));
      return { ok, detail: `status=${res.status}` };
    }),
  );

  checks.push(
    await check("Web lesson player", async () => {
      const res = await fetch(
        `${WEB}/zeemble/courses/embedded-systems-foundations/welcome-to-zeemble`,
      );
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
    console.error(`\n${failed.length}/${checks.length} Phase 3 smoke checks failed`);
    process.exit(1);
  }

  console.log(`\nAll ${checks.length} Phase 3 smoke checks passed`);
}

await main();
