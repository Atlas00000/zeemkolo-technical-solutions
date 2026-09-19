import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { EmptyState, ErrorState } from "@/components/feedback/UiState";
import { LibraryCatalog } from "@/components/lms/library/LibraryCatalog";
import { fetchLmsCourses } from "@/lib/api-client";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Zeemble course library | Zeemkolo",
  description:
    "Browse Zeemble Program courses. Preview Module 1 as a guest; full lessons unlock for students.",
};

export default async function ZeembleCatalogPage() {
  let courses: Awaited<ReturnType<typeof fetchLmsCourses>>["courses"] = [];
  let error: string | null = null;

  try {
    const data = await fetchLmsCourses();
    courses = data.courses;
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not load courses";
  }

  return (
    <AppShell>
      <main>
        {error ? (
          <div className="mx-auto max-w-shell px-[var(--ln-page-x)] py-14">
            <ErrorState message={error} />
          </div>
        ) : null}
        {!error && courses.length === 0 ? (
          <div className="mx-auto max-w-shell px-[var(--ln-page-x)] py-14">
            <EmptyState
              title="No published courses"
              description="Check back soon for Zeemble modules."
            />
          </div>
        ) : null}
        {!error && courses.length > 0 ? (
          <LibraryCatalog courses={courses} />
        ) : null}
      </main>
    </AppShell>
  );
}
