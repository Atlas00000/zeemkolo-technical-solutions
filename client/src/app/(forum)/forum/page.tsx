import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { ErrorState } from "@/components/feedback/UiState";
import { fetchForumCategories, fetchForumThreads } from "@/lib/api-client";
import { ForumDesk } from "@/components/forum/desk";

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
      <main>
        {error ? (
          <div className="mx-auto max-w-shell px-[var(--ln-page-x)] py-14">
            <ErrorState message={error} />
          </div>
        ) : (
          <ForumDesk categories={categories} threads={threads} />
        )}
      </main>
    </AppShell>
  );
}
