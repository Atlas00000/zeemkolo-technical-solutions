"use client";

import { useHeroPointer } from "./useHeroPointer";

/**
 * Soft vermilion bloom that tracks the pointer across the hero field.
 * Decorative only — aria-hidden.
 */
export function HeroPointerGlow() {
  const { x, y, active, reducedMotion } = useHeroPointer();

  if (reducedMotion) {
    return (
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 50% 45% at 78% 38%, color-mix(in srgb, var(--ln-signal) 22%, transparent), transparent 70%)",
        }}
      />
    );
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 transition-opacity duration-500"
      aria-hidden
      style={{
        opacity: active ? 1 : 0.55,
        background: `radial-gradient(ellipse 42% 38% at ${x * 100}% ${y * 100}%, color-mix(in srgb, var(--ln-signal) 28%, transparent), transparent 68%)`,
      }}
    />
  );
}
