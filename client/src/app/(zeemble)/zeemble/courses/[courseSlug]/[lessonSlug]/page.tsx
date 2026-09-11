import Link from "next/link";
import { LessonPlayer } from "@/components/lms/LessonPlayer";

type LessonPageProps = {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseSlug, lessonSlug } = await params;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <p className="font-display text-sm tracking-[0.2em] text-brand-signal uppercase">
        Zeemble Program
      </p>
      <div className="mt-8">
        <LessonPlayer courseSlug={courseSlug} lessonSlug={lessonSlug} />
      </div>
      <Link
        href={`/zeemble/courses/${courseSlug}`}
        className="mt-12 inline-block text-sm text-brand-signal underline-offset-2 hover:underline"
      >
        ← Course overview
      </Link>
    </main>
  );
}
