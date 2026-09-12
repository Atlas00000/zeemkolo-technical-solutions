"use client";

import { useState } from "react";
import { adminBatchMatrics } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">Generate matrics</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Batch matric generator
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="matric-count">How many codes?</Label>
            <Input
              id="matric-count"
              type="number"
              min={1}
              max={200}
              value={count}
              onChange={(e) => setCount(Number(e.target.value) || 1)}
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {codes.length ? (
            <p className="text-sm text-muted-foreground">
              Created {codes.length} codes ({codes[0]} …{" "}
              {codes[codes.length - 1]})
            </p>
          ) : null}
        </div>
        <DialogFooter className="gap-2 sm:justify-start">
          <Button
            type="button"
            disabled={busy}
            onClick={() => void generate()}
          >
            {busy ? "Generating…" : "Generate"}
          </Button>
          {csv ? (
            <Button type="button" variant="outline" onClick={downloadCsv}>
              Export CSV
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
