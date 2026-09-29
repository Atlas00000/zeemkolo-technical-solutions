"use client";

/**
 * Lesson media — direct R2/mp4/mov/audio via media element;
 * YouTube/Vimeo (and other embeds) via iframe.
 */
export function LessonVideo({
  src,
  title = "Lesson video",
}: {
  src: string;
  title?: string;
}) {
  const lower = src.toLowerCase();
  const isAudio = /\.m4a(\?|$)/i.test(lower) || /\.mp3(\?|$)/i.test(lower);
  const isDirectVideo =
    /\.(mov|mp4|webm)(\?|$)/i.test(lower) ||
    lower.includes("r2.cloudflarestorage.com") ||
    lower.includes("x-id=getobject");

  return (
    <section className="mt-12" data-lesson-video aria-label={title}>
      <p className="mb-3 font-mono text-[10px] tracking-[0.22em] text-[var(--ln-faint)] uppercase">
        {title}
      </p>
      {isAudio ? (
        <audio controls className="w-full" src={src} preload="metadata">
          <track kind="captions" />
        </audio>
      ) : isDirectVideo ? (
        <div className="aspect-video overflow-hidden bg-[var(--ln-ink)]">
          <video
            controls
            className="h-full w-full"
            src={src}
            preload="metadata"
          >
            <track kind="captions" />
          </video>
        </div>
      ) : (
        <div className="aspect-video overflow-hidden bg-[var(--ln-ink)]">
          <iframe
            title={title}
            src={src}
            className="h-full w-full"
            allowFullScreen
          />
        </div>
      )}
    </section>
  );
}
