"use client";

import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

const links = [
  { href: "/consultation", label: "Consultation" },
  { href: "/zeemble", label: "Zeemble" },
  { href: "/store", label: "Store" },
  { href: "/forum", label: "Forum" },
];

export function SiteNav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
        <nav className="hidden items-center gap-5 text-sm text-white/75 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <SignedOut>
            <SignInButton mode="modal">
              <button type="button" className="text-white/80 hover:text-white">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button type="button" className="border border-white/30 px-3 py-1.5 text-white">
                Sign up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/admin" className="text-white/80 hover:text-white">
              Admin
            </Link>
            <Link href="/claim-matric" className="text-white/80 hover:text-white">
              My matric
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
