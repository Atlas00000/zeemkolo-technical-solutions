"use client";

import Link from "next/link";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

type MobileTopBarProps = {
  variant?: "marketing" | "app";
  menuOpen: boolean;
  onMenuOpen: () => void;
};

/** Compact mobile header — brand + account chip + menu trigger. */
export function MobileTopBar({
  variant = "app",
  menuOpen,
  onMenuOpen,
}: MobileTopBarProps) {
  const marketing = variant === "marketing";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 md:hidden",
        marketing
          ? "absolute inset-x-0 top-0 z-20 border-b border-transparent"
          : "border-b border-[var(--ln-hairline)] bg-[color-mix(in_srgb,var(--ln-canvas)_88%,transparent)] backdrop-blur-md",
      )}
    >
      <div className="flex items-center justify-between gap-3 px-[var(--ln-page-x)] py-3.5">
        <Link
          href="/"
          className={cn(
            "shrink-0 font-display text-sm font-semibold tracking-[0.22em] text-[var(--ln-ink)] uppercase",
            marketing && "dark:text-white",
          )}
        >
          Zeemkolo
          <span
            className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--ln-signal)] align-middle shadow-[0_0_12px_var(--ln-signal)] dark:shadow-none"
            aria-hidden
          />
        </Link>

        <div className="flex shrink-0 items-center gap-1.5">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <button
            type="button"
            onClick={onMenuOpen}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className={cn(
              "flex h-11 w-11 items-center justify-center text-[var(--ln-ink)] transition-colors hover:text-[var(--ln-signal)]",
              marketing && "dark:text-white dark:hover:text-white/80",
            )}
          >
            <IconMenu />
          </button>
        </div>
      </div>
    </header>
  );
}

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3.5 5.5h13M3.5 10h13M3.5 14.5h13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
