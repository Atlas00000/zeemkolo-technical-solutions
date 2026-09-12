import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { fetchForumThread } from "@/lib/api-client";
import { ThreadView } from "@/components/forum/ThreadView";

export const revalidate = 60;

type ThreadPageProps = {
  params: Promise<{ threadId: string }>;
};

export async function generateMetadata({
  params,
}: ThreadPageProps): Promise<Metadata> {
  const { threadId } = await params;
  try {
    const thread = await fetchForumThread(threadId);
    return {
      title: `${thread.title} | Zeemble forum`,
      description: thread.body.slice(0, 160),
    };
  } catch {
    return { title: "Thread | Zeemble forum" };
  }
}

export default async function ForumThreadPage({ params }: ThreadPageProps) {
  const { threadId } = await params;

  let thread: Awaited<ReturnType<typeof fetchForumThread>> | null = null;
  try {
    thread = await fetchForumThread(threadId);
  } catch {
    notFound();
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <ThreadView thread={thread} />
        <Link
          href="/forum"
          className="mt-12 inline-block text-sm text-brand-signal underline-offset-2 hover:underline"
        >
          ← All threads
        </Link>
      </main>
    </AppShell>
  );
}
