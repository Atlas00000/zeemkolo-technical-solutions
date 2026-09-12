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
import { Button } from "@/components/ui/button";

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
          ? "absolute inset-x-0 top-0 z-20"
          : "sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={
              marketing
                ? "font-display text-sm tracking-[0.18em] text-white uppercase"
                : "font-display text-sm tracking-[0.18em] text-foreground uppercase"
            }
          >
            Zeemkolo
          </Link>
          <nav
            className={
              marketing
                ? "hidden items-center gap-5 text-sm text-white/75 md:flex"
                : "hidden items-center gap-5 text-sm text-muted-foreground md:flex"
            }
            aria-label="Primary"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  marketing ? "hover:text-white" : "hover:text-foreground"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <SignedOut>
            <SignInButton mode="modal">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={
                  marketing
                    ? "text-white/80 hover:bg-white/10 hover:text-white"
                    : undefined
                }
              >
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button
                type="button"
                variant={marketing ? "outline" : "default"}
                size="sm"
                className={
                  marketing
                    ? "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
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
                  ? "px-2 text-sm text-white/80 hover:text-white"
                  : "px-2 text-sm text-muted-foreground hover:text-foreground"
              }
            />
            <Link
              href="/claim-matric"
              className={
                marketing
                  ? "px-2 text-sm text-white/80 hover:text-white"
                  : "px-2 text-sm text-muted-foreground hover:text-foreground"
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
