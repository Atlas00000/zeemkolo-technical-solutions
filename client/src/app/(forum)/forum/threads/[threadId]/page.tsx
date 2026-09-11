import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchForumThread } from "@/lib/api-client";
import { ThreadView } from "@/components/forum/ThreadView";

type ThreadPageProps = {
  params: Promise<{ threadId: string }>;
};

export default async function ForumThreadPage({ params }: ThreadPageProps) {
  const { threadId } = await params;

  let thread: Awaited<ReturnType<typeof fetchForumThread>> | null = null;
  try {
    thread = await fetchForumThread(threadId);
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <ThreadView thread={thread} />
      <Link
        href="/forum"
        className="mt-12 inline-block text-sm text-brand-signal underline-offset-2 hover:underline"
      >
        ← All threads
      </Link>
    </main>
  );
}
