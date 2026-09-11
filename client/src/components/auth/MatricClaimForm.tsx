"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { claimMatric } from "@/lib/api-client";

type MatricClaimFormProps = {
  onSuccess?: (code: string) => void;
  initialCode?: string;
};

export function MatricClaimForm({ onSuccess, initialCode = "" }: MatricClaimFormProps) {
  const { getToken } = useAuth();
  const [code, setCode] = useState(initialCode);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
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
        <span className="text-sm font-medium text-brand-steel">Zeemble matric number</span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ZMB-2026-001"
          className="mt-2 w-full border border-brand-steel/20 bg-white px-3 py-2 text-brand-ink outline-none focus:border-brand-signal"
          autoComplete="off"
          required
        />
      </label>

      <p className="text-sm text-brand-steel/70">
        Format check:{" "}
        <span className={looksValid ? "text-green-700" : "text-brand-signal"}>
          {looksValid ? "Valid pattern" : "Expected ZMB-YYYY-NNN"}
        </span>
      </p>

      <button
        type="submit"
        disabled={status === "loading" || !looksValid}
        className="w-full bg-brand-ink px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {status === "loading" ? "Claiming…" : "Claim matric & unlock Zeemble"}
      </button>

      {message ? (
        <p
          className={`text-sm ${status === "error" ? "text-red-700" : "text-green-800"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
