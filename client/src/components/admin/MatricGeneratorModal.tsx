"use client";

import { useState } from "react";
import { adminBatchMatrics } from "@/lib/api-client";

type MatricGeneratorModalProps = {
  token: string;
  onGenerated?: () => void;
};

export function MatricGeneratorModal({
  token,
  onGenerated,
}: MatricGeneratorModalProps) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(10);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csv, setCsv] = useState<string | null>(null);
  const [codes, setCodes] = useState<string[]>([]);

  async function generate() {
    setBusy(true);
    setError(null);
    setCsv(null);
    try {
      const result = await adminBatchMatrics({ count }, token);
      setCodes(result.codes);
      setCsv(result.csv);
      onGenerated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  function downloadCsv() {
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zeemble-matrics-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-brand-ink px-4 py-2 text-sm text-white"
      >
        Generate matrics
      </button>

      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md border border-brand-steel/20 bg-brand-mist p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-brand-ink">
                Batch matric generator
              </h2>
              <button
                type="button"
                className="text-sm text-brand-steel"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <label className="mt-4 block text-sm text-brand-steel">
              How many codes?
              <input
                type="number"
                min={1}
                max={200}
                value={count}
                onChange={(e) => setCount(Number(e.target.value) || 1)}
                className="mt-1 w-full border border-brand-steel/25 bg-white px-3 py-2"
              />
            </label>
            {error ? <p className="mt-3 text-sm text-brand-signal">{error}</p> : null}
            {codes.length ? (
              <p className="mt-3 text-sm text-brand-steel">
                Created {codes.length} codes ({codes[0]} … {codes[codes.length - 1]})
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void generate()}
                className="bg-brand-signal px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {busy ? "Generating…" : "Generate"}
              </button>
              {csv ? (
                <button
                  type="button"
                  onClick={downloadCsv}
                  className="border border-brand-steel/25 px-4 py-2 text-sm"
                >
                  Export CSV
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
