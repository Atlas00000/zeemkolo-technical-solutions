"use client";

import { useState } from "react";
import type { StoreOrder } from "@/lib/api-client";
import { requestStoreDownload } from "@/lib/api-client";
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

export function OrderSuccessCard({ order }: OrderSuccessCardProps) {
  const [message, setMessage] = useState<string | null>(null);
  const tone = orderTone(order.status as OrderLifecycle);

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
        <Text variant="eyebrow">Order confirmed</Text>
        <Badge tone={tone}>{order.status}</Badge>
      </div>
      <Text variant="title" className="text-3xl">
        Thank you
      </Text>
      <Text variant="muted">
        Total{" "}
        <span className="ln-tabular text-[var(--ln-ink)]">
          {order.total.formatted}
        </span>
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
