"use client";

import { useState } from "react";
import type { StoreOrder } from "@/lib/api-client";
import { requestStoreDownload } from "@/lib/api-client";

type OrderSuccessCardProps = {
  order: StoreOrder;
};

export function OrderSuccessCard({ order }: OrderSuccessCardProps) {
  const [message, setMessage] = useState<string | null>(null);

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
    <div className="border border-brand-steel/15 bg-white p-6">
      <p className="text-sm tracking-[0.14em] text-brand-signal uppercase">Order confirmed</p>
      <h1 className="mt-2 font-display text-3xl text-brand-ink">Thank you</h1>
      <p className="mt-2 text-brand-steel">
        Status <span className="text-brand-ink">{order.status}</span> ·{" "}
        {order.total.formatted}
      </p>
      <p className="mt-1 text-sm text-brand-steel/70">
        Ref {order.paymentRef} · {order.email}
      </p>

      <ul className="mt-6 space-y-2 text-sm text-brand-ink">
        {order.items.map((item) => (
          <li key={item.id}>
            {item.quantity}× {item.product.title}
          </li>
        ))}
      </ul>

      {order.downloadsAvailable.length > 0 ? (
        <div className="mt-6 space-y-2">
          <p className="text-sm font-medium text-brand-ink">Digital downloads</p>
          {order.downloadsAvailable.map((d) => (
            <button
              key={d.productId}
              type="button"
              onClick={() => void download(d.productId)}
              className="mr-2 border border-brand-steel/25 px-3 py-1.5 text-sm"
            >
              Download {d.title}
            </button>
          ))}
        </div>
      ) : null}

      {message ? <p className="mt-4 text-sm text-brand-steel">{message}</p> : null}
    </div>
  );
}
