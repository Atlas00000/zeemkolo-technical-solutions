"use client";

import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { AdminNavLink } from "@/components/shell/AdminNavLink";
import { Button } from "@/design/primitives/Button";
import { ThemeToggle } from "@/design/ThemeToggle";

const links = [
  { href: "/consultation", label: "Consultation" },
  { href: "/zeemble", label: "Zeemble" },
  { href: "/store", label: "Store" },
  { href: "/forum", label: "Forum" },
];

type SiteNavProps = {
  variant?: "marketing" | "app";
};

export function SiteNav({ variant = "app" }: SiteNavProps) {
  const marketing = variant === "marketing";

  return (
    <header
      className={
        marketing
          ? "absolute inset-x-0 top-0 z-20 border-b border-transparent dark:border-transparent"
          : "sticky top-0 z-20 border-b border-[var(--ln-hairline)] bg-[color-mix(in_srgb,var(--ln-canvas)_88%,transparent)] backdrop-blur-md"
      }
    >
      <div className="relative flex w-full items-center justify-between gap-4 px-[var(--ln-page-x)] py-4">
        <Link
          href="/"
          className={
            marketing
              ? "relative z-10 shrink-0 font-display text-sm font-semibold tracking-[0.22em] text-[var(--ln-ink)] uppercase dark:text-white"
              : "relative z-10 shrink-0 font-display text-sm font-semibold tracking-[0.22em] text-[var(--ln-ink)] uppercase"
          }
        >
          Zeemkolo
          <span
            className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--ln-signal)] align-middle shadow-[0_0_12px_var(--ln-signal)] dark:shadow-none"
            aria-hidden
          />
        </Link>

        <nav
          className={
            marketing
              ? "absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-6 text-sm text-[var(--ln-muted)] md:flex dark:text-white/70"
              : "absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-6 text-sm text-[var(--ln-muted)] md:flex"
          }
          aria-label="Primary"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                marketing
                  ? "border-b border-transparent pb-0.5 transition-colors hover:border-[var(--ln-signal)] hover:text-[var(--ln-ink)] dark:hover:border-transparent dark:hover:text-white"
                  : "border-b border-transparent pb-0.5 transition-colors hover:border-[var(--ln-signal)] hover:text-[var(--ln-ink)]"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="relative z-10 ml-auto flex shrink-0 items-center gap-2 text-sm">
          <ThemeToggle
            className={
              marketing
                ? "dark:text-white/70 dark:hover:text-white"
                : undefined
            }
          />
          <SignedOut>
            <SignInButton mode="modal">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={
                  marketing
                    ? "dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
                    : undefined
                }
              >
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button
                type="button"
                variant={marketing ? "secondary" : "primary"}
                size="sm"
                className={
                  marketing
                    ? "dark:border-white/30 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
                    : undefined
                }
              >
                Sign up
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <AdminNavLink
              className={
                marketing
                  ? "px-2 text-sm text-[var(--ln-muted)] hover:text-[var(--ln-ink)] dark:text-white/80 dark:hover:text-white"
                  : "px-2 text-sm text-[var(--ln-muted)] hover:text-[var(--ln-ink)]"
              }
            />
            <Link
              href="/claim-matric"
              className={
                marketing
                  ? "px-2 text-sm text-[var(--ln-muted)] hover:text-[var(--ln-ink)] dark:text-white/80 dark:hover:text-white"
                  : "px-2 text-sm text-[var(--ln-muted)] hover:text-[var(--ln-ink)]"
              }
            >
              My matric
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
