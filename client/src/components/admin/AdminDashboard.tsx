"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  adminGetOverview,
  adminListAudit,
  adminListConsultations,
  adminListForumThreads,
  adminListLmsCourses,
  adminListMatrics,
  adminListOrders,
  adminListProducts,
  adminRevokeMatric,
  adminSetForumThreadLocked,
  adminUpdateConsultationStatus,
  fetchMe,
  type AppUser,
} from "@/lib/api-client";
import { MatricGeneratorModal } from "@/components/admin/MatricGeneratorModal";
import {
  AdminLmsCms,
  AdminStoreCms,
} from "@/components/admin/AdminContentCms";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "matrics", label: "Matrics" },
  { id: "consultations", label: "Consultations" },
  { id: "orders", label: "Orders" },
  { id: "store", label: "Store" },
  { id: "lms", label: "LMS" },
  { id: "forum", label: "Forum" },
  { id: "audit", label: "Audit" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const CONSULTATION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

const ORDER_STATUSES = ["PENDING", "PAID", "FULFILLED", "CANCELLED", "REFUNDED"] as const;

export function AdminDashboard() {
  const { getToken, isSignedIn } = useAuth();
  const [section, setSection] = useState<SectionId>("overview");
  const [me, setMe] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<
    Awaited<ReturnType<typeof adminGetOverview>>["overview"] | null
  >(null);
  const [matricFilter, setMatricFilter] = useState<"all" | "claimed" | "unclaimed">(
    "all",
  );
  const [matrics, setMatrics] = useState<
    Awaited<ReturnType<typeof adminListMatrics>>["matrics"]
  >([]);
  const [consultationFilter, setConsultationFilter] = useState<string>("");
  const [consultations, setConsultations] = useState<
    Awaited<ReturnType<typeof adminListConsultations>>["consultations"]
  >([]);
  const [expandedBrief, setExpandedBrief] = useState<string | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>("");
  const [orders, setOrders] = useState<
    Awaited<ReturnType<typeof adminListOrders>>["orders"]
  >([]);
  const [products, setProducts] = useState<
    Awaited<ReturnType<typeof adminListProducts>>["products"]
  >([]);
  const [courses, setCourses] = useState<
    Awaited<ReturnType<typeof adminListLmsCourses>>["courses"]
  >([]);
  const [threads, setThreads] = useState<
    Awaited<ReturnType<typeof adminListForumThreads>>["threads"]
  >([]);
  const [audit, setAudit] = useState<
    Awaited<ReturnType<typeof adminListAudit>>["events"]
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

      const [ov, m, c, o, p, lms, f, a] = await Promise.all([
        adminGetOverview(t),
        adminListMatrics(t, { filter: matricFilter, limit: 200 }),
        adminListConsultations(t, consultationFilter || undefined),
        adminListOrders(t, orderFilter || undefined),
        adminListProducts(t),
        adminListLmsCourses(t),
        adminListForumThreads(t),
        adminListAudit(t, 40),
      ]);
      setOverview(ov.overview);
      setMatrics(m.matrics);
      setConsultations(c.consultations);
      setOrders(o.orders);
      setProducts(p.products);
      setCourses(lms.courses);
      setThreads(f.threads);
      setAudit(a.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data");
    }
  }, [
    consultationFilter,
    getToken,
    isSignedIn,
    matricFilter,
    orderFilter,
  ]);

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
    <div className="space-y-8">
      {error ? <p className="text-brand-signal">{error}</p> : null}

      <nav
        className="flex flex-wrap gap-2 border-b border-brand-steel/15 pb-3"
        aria-label="Admin sections"
      >
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={
              section === s.id
                ? "bg-brand-ink px-3 py-1.5 text-sm text-white"
                : "border border-brand-steel/20 px-3 py-1.5 text-sm text-brand-steel hover:border-brand-ink/40 hover:text-brand-ink"
            }
          >
            {s.label}
          </button>
        ))}
      </nav>

      {section === "overview" && overview ? (
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-brand-ink">Overview</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["Users", overview.users],
                ["Open consultations", overview.openConsultations],
                ["Pending orders", overview.pendingOrders],
                ["Unclaimed matrics", overview.unclaimedMatrics],
                ["Claimed matrics", overview.claimedMatrics],
                ["Locked threads", overview.lockedThreads],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="border border-brand-steel/15 bg-white/50 px-4 py-5"
              >
                <p className="text-xs tracking-wide text-brand-steel uppercase">
                  {label}
                </p>
                <p className="mt-2 font-display text-3xl text-brand-ink">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-brand-steel">
            Signed in as {me.email} · role {me.role}
          </p>
        </section>
      ) : null}

      {section === "matrics" ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-brand-ink">Matric numbers</h2>
            <MatricGeneratorModal token={token} onGenerated={() => void load()} />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "unclaimed", "claimed"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setMatricFilter(f)}
                className={
                  matricFilter === f
                    ? "bg-brand-signal px-3 py-1 text-sm text-white"
                    : "border border-brand-steel/20 px-3 py-1 text-sm"
                }
              >
                {f}
              </button>
            ))}
          </div>
          <ul className="max-h-[28rem] space-y-2 overflow-y-auto text-sm">
            {matrics.length === 0 ? (
              <li className="text-brand-steel">No matrics in this filter.</li>
            ) : (
              matrics.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-steel/10 pt-2"
                >
                  <div>
                    <span className="font-mono text-brand-ink">{m.code}</span>
                    <span className="ml-2 text-brand-steel/70">
                      {m.claimed
                        ? `claimed · ${m.user?.email ?? "user"}`
                        : "unclaimed"}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-brand-signal underline-offset-2 hover:underline"
                    onClick={() => {
                      if (
                        !window.confirm(
                          m.claimed
                            ? `Release ${m.code} and demote student?`
                            : `Delete unused matric ${m.code}?`,
                        )
                      ) {
                        return;
                      }
                      void (async () => {
                        await adminRevokeMatric(m.id, token);
                        await load();
                      })();
                    }}
                  >
                    {m.claimed ? "Release" : "Delete"}
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>
      ) : null}

      {section === "consultations" ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-brand-ink">Consultations</h2>
            <select
              value={consultationFilter}
              className="border border-brand-steel/25 bg-white px-2 py-1 text-sm"
              onChange={(e) => setConsultationFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              {CONSULTATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
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
                  {c.attachmentKey ? (
                    <p className="mt-1 font-mono text-xs text-brand-steel">
                      attachment: {c.attachmentKey}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    className="mt-2 text-sm text-brand-signal underline-offset-2 hover:underline"
                    onClick={() =>
                      setExpandedBrief((id) => (id === c.id ? null : c.id))
                    }
                  >
                    {expandedBrief === c.id ? "Hide brief" : "View brief"}
                  </button>
                  {expandedBrief === c.id ? (
                    <p className="mt-2 whitespace-pre-wrap border border-brand-steel/15 bg-white/60 p-3 text-sm text-brand-ink">
                      {c.projectBrief}
                    </p>
                  ) : null}
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
      ) : null}

      {section === "orders" ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-brand-ink">Orders</h2>
            <select
              value={orderFilter}
              className="border border-brand-steel/25 bg-white px-2 py-1 text-sm"
              onChange={(e) => setOrderFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <ul className="space-y-3">
            {orders.length === 0 ? (
              <li className="text-sm text-brand-steel">No orders yet.</li>
            ) : (
              orders.map((o) => (
                <li key={o.id} className="border-t border-brand-steel/15 pt-3 text-sm">
                  <p className="text-brand-ink">
                    {o.email} · {o.status} · {o.currency}{" "}
                    {(o.totalAmount / 100).toFixed(2)}
                  </p>
                  <p className="text-brand-steel/70">
                    {o.items
                      .map((i) => `${i.quantity}× ${i.product.title}`)
                      .join(", ")}
                  </p>
                  {o.paymentRef ? (
                    <p className="font-mono text-xs text-brand-steel">
                      ref {o.paymentRef}
                      {o.paymentProvider ? ` · ${o.paymentProvider}` : ""}
                    </p>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </section>
      ) : null}

      {section === "store" ? (
        <AdminStoreCms token={token} products={products} onChanged={() => void load()} />
      ) : null}

      {section === "lms" ? (
        <AdminLmsCms token={token} courses={courses} onChanged={() => void load()} />
      ) : null}

      {section === "forum" ? (
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-brand-ink">Forum threads</h2>
          <ul className="space-y-3">
            {threads.length === 0 ? (
              <li className="text-sm text-brand-steel">No threads yet.</li>
            ) : (
              threads.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-steel/15 pt-3 text-sm"
                >
                  <div>
                    <p className="text-brand-ink">{t.title}</p>
                    <p className="text-brand-steel/70">
                      {t.category.title} · {t.replyCount} replies ·{" "}
                      {t.isLocked ? "locked" : "open"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="border border-brand-steel/25 px-3 py-1"
                    onClick={() => {
                      void (async () => {
                        await adminSetForumThreadLocked(t.id, !t.isLocked, token);
                        await load();
                      })();
                    }}
                  >
                    {t.isLocked ? "Unlock" : "Lock"}
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>
      ) : null}

      {section === "audit" ? (
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-brand-ink">Audit log</h2>
          <ul className="max-h-[32rem] space-y-2 overflow-y-auto text-sm">
            {audit.length === 0 ? (
              <li className="text-brand-steel">No admin actions recorded yet.</li>
            ) : (
              audit.map((e) => (
                <li key={e.id} className="border-t border-brand-steel/10 pt-2">
                  <p className="text-brand-ink">
                    <span className="font-mono text-xs">{e.action}</span>
                    {" · "}
                    {e.targetType}
                    {e.targetId ? `/${e.targetId.slice(0, 8)}…` : ""}
                  </p>
                  <p className="text-brand-steel/70">
                    {e.actor.email} · {new Date(e.createdAt).toLocaleString()}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
