"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { AdminNavLink } from "@/components/shell/AdminNavLink";
import { LEGAL_NAV_LINKS, PRIMARY_NAV_LINKS } from "@/components/shell/nav-links";
import { Button } from "@/design/primitives/Button";
import { ThemeToggle } from "@/design/ThemeToggle";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cn } from "@/lib/utils";

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  variant?: "marketing" | "app";
};

/** Full-height mobile navigation sheet — focus-trapped, Esc + backdrop close. */
export function MobileNavDrawer({
  open,
  onClose,
  variant = "app",
}: MobileNavDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const marketing = variant === "marketing";

  useFocusTrap(open, panelRef, onClose);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 md:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label="Close menu"
        className={cn(
          "absolute inset-0 bg-[color-mix(in_srgb,var(--ln-ink)_40%,transparent)] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />

      <div
        ref={panelRef}
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={cn(
          "absolute inset-y-0 right-0 flex w-[min(20rem,88vw)] flex-col border-l border-[var(--ln-hairline)] bg-[var(--ln-canvas-elevated)] shadow-[-12px_0_40px_color-mix(in_srgb,var(--ln-ink)_12%,transparent)] transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
          marketing && "dark:border-white/10 dark:bg-[var(--ln-canvas)]",
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--ln-hairline)] px-5 py-4">
          <p className="font-display text-sm font-semibold tracking-[0.18em] text-[var(--ln-ink)] uppercase">
            Menu
          </p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center text-[var(--ln-muted)] transition-colors hover:text-[var(--ln-ink)]"
            aria-label="Close menu"
          >
            <IconClose />
          </button>
        </div>

        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4"
          aria-label="Primary"
        >
          {PRIMARY_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="rounded-sm px-3 py-3 font-display text-lg tracking-tight text-[var(--ln-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--ln-signal)_8%,transparent)] hover:text-[var(--ln-signal)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-4 border-t border-[var(--ln-hairline)] px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] tracking-[0.16em] text-[var(--ln-faint)] uppercase">
              Theme
            </span>
            <ThemeToggle />
          </div>

          <SignedOut>
            <div className="flex flex-col gap-2">
              <SignInButton mode="modal">
                <Button type="button" variant="ghost" className="w-full justify-center">
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  type="button"
                  variant={marketing ? "secondary" : "primary"}
                  className="w-full justify-center"
                >
                  Sign up
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="flex flex-col gap-1">
              <span onClick={onClose}>
                <AdminNavLink className="block rounded-sm px-3 py-2.5 text-sm text-[var(--ln-muted)] hover:text-[var(--ln-ink)]" />
              </span>
              <Link
                href="/claim-matric"
                onClick={onClose}
                className="rounded-sm px-3 py-2.5 text-sm text-[var(--ln-muted)] transition-colors hover:text-[var(--ln-ink)]"
              >
                My matric
              </Link>
              <div className="flex items-center gap-3 px-3 py-2">
                <UserButton afterSignOutUrl="/" />
                <span className="text-sm text-[var(--ln-muted)]">Account</span>
              </div>
            </div>
          </SignedIn>

          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
            {LEGAL_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="text-xs text-[var(--ln-faint)] transition-colors hover:text-[var(--ln-ink)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M4 4l10 10M14 4L4 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
