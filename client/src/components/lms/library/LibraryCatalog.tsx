"use client";

import type { PointerEvent } from "react";
import type { LmsCourse } from "@/lib/api-client";
import { LibraryField } from "./LibraryField";
import { LibraryMasthead } from "./LibraryMasthead";
import { LibraryRail } from "./LibraryRail";
import { LibraryStage } from "./LibraryStage";
import { LibraryProvider, useLibrary } from "./useLibrary";
import "./library-motion.css";

function LibraryCatalogInner() {
  const { setPointer, reducedMotion } = useLibrary();

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
    setPointer({ x: 0.72, y: 0.32, active: false });
  }

  return (
    <section
      className="relative isolate overflow-hidden text-[var(--ln-ink)]"
      data-library-catalog
      aria-label="Zeemble course library"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <LibraryField />

      <div className="relative z-10 mx-auto max-w-shell px-[var(--ln-page-x)] py-16 md:py-24">
        <LibraryMasthead />

        <div className="mt-14 flex flex-col gap-12 lg:mt-20 lg:flex-row lg:items-start lg:gap-16">
          <LibraryRail />
          <LibraryStage />
        </div>
      </div>
    </section>
  );
}

/**
 * Zeemble course library — Field / Masthead / Rail / Stage.
 * Modular desk. No cards, clip art, emoji, or zip sweeps.
 */
export function LibraryCatalog({ courses }: { courses: LmsCourse[] }) {
  if (courses.length === 0) return null;

  return (
    <LibraryProvider courses={courses}>
      <LibraryCatalogInner />
    </LibraryProvider>
  );
}
