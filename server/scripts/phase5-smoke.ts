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
    await check("API /store/products", async () => {
      const res = await fetch(`${API}/store/products`);
      const body = (await res.json()) as { products?: unknown[] };
      const ok = res.status === 200 && (body.products?.length ?? 0) > 0;
      return { ok, detail: `status=${res.status} count=${body.products?.length ?? 0}` };
    }),
  );

  checks.push(
    await check("API checkout + confirm + download grant", async () => {
      const catalog = await fetch(`${API}/store/products`);
      const products = (await catalog.json()) as {
        products: { id: string; slug: string }[];
      };
      const digital = products.products.find((p) => p.slug === "firmware-handbook");
      if (!digital) return { ok: false, detail: "missing firmware-handbook" };

      const created = await fetch(`${API}/store/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "phase5-smoke@example.com",
          currency: "USD",
          paymentProvider: "paystack",
          items: [{ productId: digital.id, quantity: 1 }],
        }),
      });
      const order = (await created.json()) as { id?: string; status?: string };
      if (created.status !== 201 || !order.id) {
        return { ok: false, detail: `create status=${created.status}` };
      }

      const confirmed = await fetch(`${API}/store/orders/${order.id}/confirm-test`, {
        method: "POST",
      });
      const paid = (await confirmed.json()) as { status?: string };
      if (confirmed.status !== 200) {
        return { ok: false, detail: `confirm status=${confirmed.status}` };
      }

      const dl = await fetch(
        `${API}/store/orders/${order.id}/downloads/${digital.id}?email=phase5-smoke@example.com`,
        { method: "POST" },
      );
      const grant = (await dl.json()) as { url?: string; expiresInSeconds?: number };
      const ok =
        dl.status === 200 &&
        Boolean(grant.url) &&
        grant.expiresInSeconds === 900 &&
        (paid.status === "PAID" || paid.status === "FULFILLED");
      return {
        ok,
        detail: `confirm=${paid.status} download=${dl.status}`,
      };
    }),
  );

  checks.push(
    await check("Web /store", async () => {
      const res = await fetch(`${WEB}/store`);
      const html = await res.text();
      const ok = res.status === 200 && html.toLowerCase().includes("store");
      return { ok, detail: `status=${res.status}` };
    }),
  );

  checks.push(
    await check("Web /store/checkout", async () => {
      const res = await fetch(`${WEB}/store/checkout`);
      const html = await res.text();
      const ok = res.status === 200 && html.toLowerCase().includes("checkout");
      return { ok, detail: `status=${res.status}` };
    }),
  );

  const failed = checks.filter((c) => !c.ok);
  for (const c of checks) {
    console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.name} — ${c.detail}`);
  }

  if (failed.length) {
    console.error(`\n${failed.length}/${checks.length} Phase 5 smoke checks failed`);
    process.exit(1);
  }

  console.log(`\nAll ${checks.length} Phase 5 smoke checks passed`);
}

await main();
