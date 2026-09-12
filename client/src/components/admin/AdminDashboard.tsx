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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

      <Tabs
        value={section}
        onValueChange={(value) => setSection(value as SectionId)}
        className="gap-4"
      >
        <TabsList
          variant="line"
          className="h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0"
          aria-label="Admin sections"
        >
          {SECTIONS.map((s) => (
            <TabsTrigger
              key={s.id}
              value={s.id}
              className="rounded-none border border-transparent px-3 py-1.5 data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background"
            >
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {section === "overview" && overview ? (
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-foreground">Overview</h2>
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
              <Card key={label} className="rounded-md shadow-none">
                <CardContent className="px-4 py-5">
                  <p className="text-xs tracking-wide text-muted-foreground uppercase">
                    {label}
                  </p>
                  <p className="mt-2 font-display text-3xl text-foreground">
                    {value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Signed in as {me.email} · role {me.role}
          </p>
        </section>
      ) : null}

      {section === "matrics" ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-foreground">Matric numbers</h2>
            <MatricGeneratorModal token={token} onGenerated={() => void load()} />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "unclaimed", "claimed"] as const).map((f) => (
              <Button
                key={f}
                type="button"
                size="sm"
                variant={matricFilter === f ? "default" : "outline"}
                onClick={() => setMatricFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>
          <div className="max-h-[28rem] overflow-auto rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matrics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">
                      No matrics in this filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  matrics.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono">{m.code}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {m.claimed
                          ? `claimed · ${m.user?.email ?? "user"}`
                          : "unclaimed"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="text-primary"
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
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      ) : null}

      {section === "consultations" ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-foreground">Consultations</h2>
            <select
              value={consultationFilter}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
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
          <div className="max-h-[32rem] overflow-auto rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No consultations yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  consultations.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <p className="font-medium">
                          {c.guestName} · {c.serviceType}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {c.guestEmail}
                        </p>
                        {expandedBrief === c.id ? (
                          <p className="mt-2 max-w-md whitespace-pre-wrap rounded-md border border-border bg-muted/40 p-2 text-xs">
                            {c.projectBrief}
                          </p>
                        ) : null}
                        {c.attachmentKey ? (
                          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                            {c.attachmentKey}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(c.slotStartsAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <select
                          value={c.status}
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                          aria-label={`Status for ${c.guestName}`}
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
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="text-primary"
                          onClick={() =>
                            setExpandedBrief((id) => (id === c.id ? null : c.id))
                          }
                        >
                          {expandedBrief === c.id ? "Hide brief" : "View brief"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      ) : null}

      {section === "orders" ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-foreground">Orders</h2>
            <select
              value={orderFilter}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
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
          <div className="max-h-[32rem] overflow-auto rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No orders yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell>
                        <p>{o.email}</p>
                        {o.paymentRef ? (
                          <p className="font-mono text-[10px] text-muted-foreground">
                            ref {o.paymentRef}
                            {o.paymentProvider ? ` · ${o.paymentProvider}` : ""}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="max-w-xs text-muted-foreground">
                        {o.items
                          .map((i) => `${i.quantity}× ${i.product.title}`)
                          .join(", ")}
                      </TableCell>
                      <TableCell>
                        {o.currency} {(o.totalAmount / 100).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{o.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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
          <h2 className="font-display text-2xl text-foreground">Forum threads</h2>
          <div className="max-h-[32rem] overflow-auto rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thread</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {threads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No threads yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  threads.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <p className="font-medium">{t.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.replyCount} replies
                        </p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.category.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.isLocked ? "destructive" : "secondary"}>
                          {t.isLocked ? "locked" : "open"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            void (async () => {
                              await adminSetForumThreadLocked(
                                t.id,
                                !t.isLocked,
                                token,
                              );
                              await load();
                            })();
                          }}
                        >
                          {t.isLocked ? "Unlock" : "Lock"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      ) : null}

      {section === "audit" ? (
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-foreground">Audit log</h2>
          <div className="max-h-[32rem] overflow-auto rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audit.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No admin actions recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  audit.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-mono text-xs">{e.action}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {e.targetType}
                        {e.targetId ? `/${e.targetId.slice(0, 8)}…` : ""}
                      </TableCell>
                      <TableCell>{e.actor.email}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(e.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
