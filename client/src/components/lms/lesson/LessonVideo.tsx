"use client";

/**
 * Lesson video — full-bleed plane, no bordered black card.
 */
export function LessonVideo({ src, title = "Lesson video" }: { src: string; title?: string }) {
  return (
    <section className="mt-12" data-lesson-video aria-label={title}>
      <p className="mb-3 font-mono text-[10px] tracking-[0.22em] text-[var(--ln-faint)] uppercase">
        {title}
      </p>
      <div className="aspect-video overflow-hidden bg-[var(--ln-ink)]">
        <iframe
          title={title}
          src={src}
          className="h-full w-full"
          allowFullScreen
        />
      </div>
    </section>
  );
}
