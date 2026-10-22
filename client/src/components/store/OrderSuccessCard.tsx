"use client";

import { useEffect, useState } from "react";
import type { StoreOrder } from "@/lib/api-client";
import {
  confirmPaystackCheckout,
  fetchStoreOrder,
  requestStoreDownload,
} from "@/lib/api-client";
import { Badge } from "@/design/primitives/Badge";
import { Button } from "@/design/primitives/Button";
import { Text } from "@/design/primitives/Text";
import {
  orderTone,
  type OrderLifecycle,
} from "@/design/map/backend-status";

type OrderSuccessCardProps = {
  order: StoreOrder;
};

const PENDING_POLL_MS = 2500;
const PENDING_POLL_MAX = 48; // ~2 minutes

export function OrderSuccessCard({ order: initial }: OrderSuccessCardProps) {
  const [order, setOrder] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const tone = orderTone(order.status as OrderLifecycle);
  const isPending = order.status === "PENDING";
  const isPaystack = order.paymentProvider === "paystack";

  useEffect(() => {
    if (!isPending) return;

    let attempts = 0;
    let cancelled = false;

    async function refresh() {
      attempts += 1;
      try {
        if (isPaystack) {
          try {
            const confirmed = await confirmPaystackCheckout(order.id);
            if (cancelled) return;
            setOrder(confirmed);
            if (confirmed.status !== "PENDING") return true;
          } catch {
            // Not paid yet / verify pending — fall through to poll GET.
          }
        }
        const next = await fetchStoreOrder(order.id);
        if (cancelled) return;
        setOrder(next);
        return next.status !== "PENDING";
      } catch {
        return false;
      }
    }

    void refresh();

    const timer = window.setInterval(() => {
      void (async () => {
        const done = await refresh();
        if (done || attempts >= PENDING_POLL_MAX) {
          window.clearInterval(timer);
        }
      })();
    }, PENDING_POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [isPending, isPaystack, order.id]);

  async function download(productId: string) {
    setMessage(null);
    try {
      const grant = await requestStoreDownload(order.id, productId, order.email);
      window.open(grant.url, "_blank", "noopener,noreferrer");
      setMessage(`Download ready (${grant.expiresInSeconds / 60} min link).`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Download failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Text variant="eyebrow">
          {isPending ? "Awaiting payment" : "Order confirmed"}
        </Text>
        <Badge tone={tone}>{order.status}</Badge>
      </div>
      <Text variant="title" className="text-3xl">
        {isPending ? "Payment in progress" : "Thank you"}
      </Text>
      <Text variant="muted">
        {isPending
          ? "If you just paid with Paystack, we are confirming your payment…"
          : "Total "}
        {!isPending ? (
          <span className="ln-tabular text-[var(--ln-ink)]">
            {order.total.formatted}
          </span>
        ) : (
          <span className="ln-tabular text-[var(--ln-ink)]">
            {" "}
            {order.total.formatted}
          </span>
        )}
      </Text>
      <Text variant="meta">
        Ref {order.paymentRef} · {order.email}
      </Text>

      <ul className="space-y-2 border-t border-[var(--ln-hairline)] pt-4 text-sm text-[var(--ln-ink)]">
        {order.items.map((item) => (
          <li key={item.id}>
            <span className="ln-tabular">{item.quantity}</span>× {item.product.title}
          </li>
        ))}
      </ul>

      {order.downloadsAvailable.length > 0 ? (
        <div className="space-y-2 border-t border-[var(--ln-hairline)] pt-4">
          <Text variant="meta" className="uppercase tracking-[var(--ln-tracking-mark)]">
            Digital downloads
          </Text>
          <div className="flex flex-wrap gap-2">
            {order.downloadsAvailable.map((d) => (
              <Button
                key={d.productId}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => void download(d.productId)}
              >
                Download {d.title}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      {message ? <Text variant="muted">{message}</Text> : null}
    </div>
  );
}
