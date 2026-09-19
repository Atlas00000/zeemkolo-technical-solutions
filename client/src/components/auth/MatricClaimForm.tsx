"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { claimMatric } from "@/lib/api-client";
import { Button } from "@/design/primitives/Button";
import { Input } from "@/design/primitives/Input";
import { Text } from "@/design/primitives/Text";

type MatricClaimFormProps = {
  onSuccess?: (code: string) => void;
  initialCode?: string;
};

export function MatricClaimForm({
  onSuccess,
  initialCode = "",
}: MatricClaimFormProps) {
  const { getToken } = useAuth();
  const [code, setCode] = useState(initialCode);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  const normalized = code.trim().toUpperCase();
  const looksValid = /^ZMB-\d{4}-\d{3}$/i.test(normalized);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Not signed in");
      }
      const result = await claimMatric(token, normalized);
      setStatus("success");
      setMessage(`Claimed ${result.matric.code}. Role: ${result.role}`);
      onSuccess?.(result.matric.code);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Claim failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md space-y-4">
      <label className="block">
        <Text variant="meta" as="span" className="font-medium text-[var(--ln-muted)]">
          Zeemble matric number
        </Text>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ZMB-2026-001"
          className="mt-2 ln-tabular"
          autoComplete="off"
          required
        />
      </label>

      <Text variant="meta">
        Format check:{" "}
        <span
          className={
            looksValid ? "text-[var(--ln-signal)]" : "text-[var(--ln-warn)]"
          }
        >
          {looksValid ? "Valid pattern" : "Expected ZMB-YYYY-NNN"}
        </span>
      </Text>

      <Button
        type="submit"
        disabled={status === "loading" || !looksValid}
        className="w-full"
      >
        {status === "loading" ? "Claiming…" : "Claim matric & unlock Zeemble"}
      </Button>

      {message ? (
        <p
          className={`text-sm ${
            status === "error"
              ? "text-[var(--ln-halt)]"
              : "text-[var(--ln-signal)]"
          }`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
