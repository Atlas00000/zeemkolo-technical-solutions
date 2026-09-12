import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { EmptyState, ErrorState } from "@/components/feedback/UiState";
import { fetchForumCategories, fetchForumThreads } from "@/lib/api-client";
import { ThreadCard } from "@/components/forum/ThreadCard";
import { ForumComposer } from "@/components/forum/ForumComposer";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Zeemble forum | Zeemkolo",
  description:
    "Public Zeemble community forum — threads, replies, and votes for students.",
};

export default async function ForumPage() {
  let categories: Awaited<ReturnType<typeof fetchForumCategories>>["categories"] =
    [];
  let threads: Awaited<ReturnType<typeof fetchForumThreads>>["threads"] = [];
  let error: string | null = null;

  try {
    const [catData, threadData] = await Promise.all([
      fetchForumCategories(),
      fetchForumThreads(),
    ]);
    categories = catData.categories;
    threads = threadData.threads;
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not load forum";
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-display text-sm tracking-[0.2em] text-brand-signal uppercase">
          Community
        </p>
        <h1 className="mt-3 font-display text-4xl text-brand-ink">
          Zeemble forum
        </h1>
        <p className="mt-3 max-w-2xl text-brand-steel/80">
          Public read access for SEO. Students start threads, reply, and vote.
        </p>

        {error ? <ErrorState message={error} /> : null}
        {!error ? (
          <>
            <ul className="mt-8 flex flex-wrap gap-3 text-sm text-brand-steel">
              {categories.map((c) => (
                <li key={c.id} className="border border-brand-steel/20 px-3 py-1">
                  {c.title} ({c.threadCount})
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <ForumComposer
                categories={categories.map((c) => ({
                  slug: c.slug,
                  title: c.title,
                }))}
              />
            </div>

            <section className="mt-12">
              <h2 className="font-display text-2xl text-brand-ink">
                Recent threads
              </h2>
              <div className="mt-2">
                {threads.length === 0 ? (
                  <EmptyState
                    title="No threads yet"
                    description="Be the first to start a discussion."
                  />
                ) : (
                  threads.map((thread) => (
                    <ThreadCard key={thread.id} thread={thread} />
                  ))
                )}
              </div>
            </section>
          </>
        ) : null}
      </main>
    </AppShell>
  );
}
