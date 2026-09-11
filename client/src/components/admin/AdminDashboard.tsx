"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  adminListConsultations,
  adminListOrders,
  adminListProducts,
  adminUpdateConsultationStatus,
  adminUpdateProduct,
  fetchMe,
  type AppUser,
} from "@/lib/api-client";
import { MatricGeneratorModal } from "@/components/admin/MatricGeneratorModal";

const CONSULTATION_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

export function AdminDashboard() {
  const { getToken, isSignedIn } = useAuth();
  const [me, setMe] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consultations, setConsultations] = useState<
    Awaited<ReturnType<typeof adminListConsultations>>["consultations"]
  >([]);
  const [orders, setOrders] = useState<
    Awaited<ReturnType<typeof adminListOrders>>["orders"]
  >([]);
  const [products, setProducts] = useState<
    Awaited<ReturnType<typeof adminListProducts>>["products"]
  >([]);

  const load = useCallback(async () => {
    if (!isSignedIn) {
      setMe(null);
      return;
    }
    setError(null);
    try {
      const t = await getToken();
      if (!t) throw new Error("Missing session token");
      setToken(t);
      const user = await fetchMe(t);
      setMe(user);
      if (user.role !== "ADMIN") return;

      const [c, o, p] = await Promise.all([
        adminListConsultations(t),
        adminListOrders(t),
        adminListProducts(t),
      ]);
      setConsultations(c.consultations);
      setOrders(o.orders);
      setProducts(p.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data");
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!isSignedIn) {
    return (
      <p className="text-brand-steel">
        Sign in required.{" "}
        <Link href="/sign-in" className="text-brand-signal underline">
          Sign in
        </Link>
      </p>
    );
  }

  if (me && me.role !== "ADMIN") {
    return (
      <p className="text-brand-signal">
        Forbidden — admin role required (current: {me.role}).
      </p>
    );
  }

  if (!token || !me) {
    return <p className="text-brand-steel">Loading admin panel…</p>;
  }

  return (
    <div className="space-y-12">
      {error ? <p className="text-brand-signal">{error}</p> : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-brand-ink">Matric numbers</h2>
          <MatricGeneratorModal token={token} onGenerated={() => void load()} />
        </div>
        <p className="text-sm text-brand-steel">
          Generate enrollment packs and export CSV for offline distribution.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl text-brand-ink">Consultations</h2>
        <ul className="space-y-4">
          {consultations.length === 0 ? (
            <li className="text-sm text-brand-steel">No consultations yet.</li>
          ) : (
            consultations.map((c) => (
              <li key={c.id} className="border-t border-brand-steel/15 pt-4">
                <p className="font-medium text-brand-ink">
                  {c.guestName} · {c.serviceType}
                </p>
                <p className="text-sm text-brand-steel/70">
                  {c.guestEmail} · {new Date(c.slotStartsAt).toLocaleString()} ·{" "}
                  {c.status}
                </p>
                <label className="mt-2 inline-flex items-center gap-2 text-sm text-brand-steel">
                  Status
                  <select
                    value={c.status}
                    className="border border-brand-steel/25 bg-white px-2 py-1"
                    onChange={(e) => {
                      void (async () => {
                        await adminUpdateConsultationStatus(
                          c.id,
                          e.target.value,
                          token,
                        );
                        await load();
                      })();
                    }}
                  >
                    {CONSULTATION_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl text-brand-ink">Orders</h2>
        <ul className="space-y-3">
          {orders.length === 0 ? (
            <li className="text-sm text-brand-steel">No orders yet.</li>
          ) : (
            orders.map((o) => (
              <li key={o.id} className="border-t border-brand-steel/15 pt-3 text-sm">
                <p className="text-brand-ink">
                  {o.email} · {o.status} · {o.currency} {(o.totalAmount / 100).toFixed(2)}
                </p>
                <p className="text-brand-steel/70">
                  {o.items.map((i) => `${i.quantity}× ${i.product.title}`).join(", ")}
                </p>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl text-brand-ink">Store inventory</h2>
        <ul className="space-y-4">
          {products.map((p) => (
            <li key={p.id} className="border-t border-brand-steel/15 pt-4">
              <p className="font-medium text-brand-ink">
                {p.title}{" "}
                <span className="text-sm text-brand-steel/70">({p.type})</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                <label className="text-brand-steel">
                  Stock
                  <input
                    type="number"
                    min={0}
                    defaultValue={p.stock}
                    className="ml-2 w-20 border border-brand-steel/25 bg-white px-2 py-1"
                    onBlur={(e) => {
                      const stock = Number(e.target.value);
                      if (!Number.isFinite(stock) || stock === p.stock) return;
                      void (async () => {
                        await adminUpdateProduct(p.id, { stock }, token);
                        await load();
                      })();
                    }}
                  />
                </label>
                <label className="flex items-center gap-2 text-brand-steel">
                  <input
                    type="checkbox"
                    checked={p.isPublished}
                    onChange={(e) => {
                      void (async () => {
                        await adminUpdateProduct(
                          p.id,
                          { isPublished: e.target.checked },
                          token,
                        );
                        await load();
                      })();
                    }}
                  />
                  Published
                </label>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
