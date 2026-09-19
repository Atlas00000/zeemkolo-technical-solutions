"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createForumThread } from "@/lib/api-client";
import { EnrollBanner } from "@/components/forum/EnrollBanner";
import { Button } from "@/design/primitives/Button";
import { Input } from "@/design/primitives/Input";

type NewThreadFormProps = {
  categories: { slug: string; title: string }[];
  canWrite: boolean;
};

const fieldClass =
  "mt-2 w-full border-0 border-b border-[var(--ln-hairline-strong)] bg-transparent px-0 py-2 text-sm text-[var(--ln-ink)] outline-none transition-colors focus:border-[var(--ln-signal)]";

/**
 * New thread composer — open plane, hairline fields. No Surface box.
 */
export function NewThreadForm({ categories, canWrite }: NewThreadFormProps) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [categorySlug, setCategorySlug] = useState(
    categories[0]?.slug ?? "general",
  );
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
      const created = await createForumThread(
        { categorySlug, title, body },
        token,
      );
      router.push(`/forum/threads/${created.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create thread");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="space-y-6 border-t border-[var(--ln-signal)] pt-6"
      data-forum-new-thread
    >
      <h3 className="font-display text-xl tracking-tight text-[var(--ln-ink)] md:text-2xl">
        New thread
      </h3>

      <label className="block font-mono text-[10px] tracking-[0.16em] text-[var(--ln-faint)] uppercase">
        Category
        <select
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
          className={`${fieldClass} font-display text-base tracking-normal text-[var(--ln-ink)] normal-case`}
        >
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.title}
            </option>
          ))}
        </select>
      </label>

      <label className="block font-mono text-[10px] tracking-[0.16em] text-[var(--ln-faint)] uppercase">
        Title
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
          className="mt-2 border-0 border-b border-[var(--ln-hairline-strong)] bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </label>

      <label className="block font-mono text-[10px] tracking-[0.16em] text-[var(--ln-faint)] uppercase">
        Body
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          minLength={10}
          rows={5}
          className={fieldClass}
        />
      </label>

      {error ? (
        <p className="text-sm text-[var(--ln-halt)]" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={busy}>
        {busy ? "Publishing…" : "Publish thread"}
      </Button>
    </form>
  );
}
