import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { fetchForumThread } from "@/lib/api-client";
import { ThreadDesk } from "@/components/forum/thread";

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
      <main>
        <ThreadDesk thread={thread} />
      </main>
    </AppShell>
  );
}
