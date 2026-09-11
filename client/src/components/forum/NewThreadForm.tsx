"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createForumThread } from "@/lib/api-client";
import { EnrollBanner } from "@/components/forum/EnrollBanner";

type NewThreadFormProps = {
  categories: { slug: string; title: string }[];
  canWrite: boolean;
};

export function NewThreadForm({ categories, canWrite }: NewThreadFormProps) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? "general");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canWrite) {
    return (
      <EnrollBanner message="Enroll in Zeemble to start a discussion thread" />
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Sign in required");
      const created = await createForumThread({ categorySlug, title, body }, token);
      router.push(`/forum/threads/${created.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create thread");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4 border border-brand-steel/15 p-4">
      <h2 className="font-display text-xl text-brand-ink">New thread</h2>
      <label className="block text-sm text-brand-steel">
        Category
        <select
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
          className="mt-1 w-full border border-brand-steel/25 bg-white px-3 py-2 text-brand-ink"
        >
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.title}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm text-brand-steel">
        Title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
          className="mt-1 w-full border border-brand-steel/25 bg-white px-3 py-2 text-brand-ink"
        />
      </label>
      <label className="block text-sm text-brand-steel">
        Body
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          minLength={10}
          rows={5}
          className="mt-1 w-full border border-brand-steel/25 bg-white px-3 py-2 text-brand-ink"
        />
      </label>
      {error ? <p className="text-sm text-brand-signal">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="bg-brand-ink px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {busy ? "Publishing…" : "Publish thread"}
      </button>
    </form>
  );
}
