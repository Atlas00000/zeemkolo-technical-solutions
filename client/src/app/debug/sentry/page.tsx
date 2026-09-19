"use client";

import { useEffect } from "react";

/**
 * Dev-only client Sentry probe. Visit when NEXT_PUBLIC_SENTRY_DSN is set.
 */
export default function DebugSentryPage() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()) return;
    void import("@sentry/nextjs").then((Sentry) => {
      Sentry.captureException(
        new Error("Zeemkolo client Sentry test error (O5.1)"),
      );
    });
  }, []);

  if (process.env.NODE_ENV === "production") {
    return <p>Not available.</p>;
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <h1 className="font-display text-2xl">Sentry client test</h1>
      <p className="mt-3 text-sm text-[var(--ln-muted)]">
        Fired a test exception if <code>NEXT_PUBLIC_SENTRY_DSN</code> is set.
        Check your Sentry project Issues feed.
      </p>
    </main>
  );
}
