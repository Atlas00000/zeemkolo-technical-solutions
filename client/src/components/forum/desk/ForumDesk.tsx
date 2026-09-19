"use client";

import type { PointerEvent } from "react";
import type { ForumCategory, ForumThreadSummary } from "@/lib/api-client";
import { EmptyState } from "@/components/feedback/UiState";
import { ForumCategories } from "./ForumCategories";
import { ForumComposerBand } from "./ForumComposerBand";
import { ForumField } from "./ForumField";
import { ForumMasthead } from "./ForumMasthead";
import { ForumRail } from "./ForumRail";
import { ForumStage } from "./ForumStage";
import { ForumDeskProvider, useForumDesk } from "./useForumDesk";
import "./forum-motion.css";

function ForumDeskInner() {
  const { threads, setPointer, reducedMotion } = useForumDesk();

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPointer({
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
      active: true,
    });
  }

  function onPointerLeave() {
    setPointer({ x: 0.7, y: 0.32, active: false });
  }

  return (
    <section
      className="relative isolate overflow-hidden text-[var(--ln-ink)]"
      data-forum-desk
      aria-label="Zeemble forum"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <ForumField />

      <div className="relative z-10 mx-auto max-w-shell px-[var(--ln-page-x)] py-16 md:py-24">
        <ForumMasthead />
        <ForumCategories />
        <ForumComposerBand />

        <div className="mt-16 md:mt-20">
          <p className="mb-2 font-mono text-[10px] tracking-[0.22em] text-[var(--ln-faint)] uppercase">
            Recent threads
          </p>
          <h2 className="font-display text-2xl tracking-tight text-[var(--ln-ink)] md:text-3xl">
            Latest discussions
          </h2>

          {threads.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title="No threads yet"
                description="Be the first to start a discussion."
              />
            </div>
          ) : (
            <div className="mt-10 flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
              <ForumRail />
              <ForumStage />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Zeemble forum desk — Field / Masthead / Categories / Composer / Rail / Stage.
 */
export function ForumDesk({
  categories,
  threads,
}: {
  categories: ForumCategory[];
  threads: ForumThreadSummary[];
}) {
  return (
    <ForumDeskProvider categories={categories} threads={threads}>
      <ForumDeskInner />
    </ForumDeskProvider>
  );
}
