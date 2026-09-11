import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <p className="font-display text-sm tracking-[0.2em] text-brand-signal uppercase">
          Zeemkolo Technical Solutions
        </p>
        <div className="flex items-center gap-3 text-sm">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-brand-steel hover:text-brand-ink">Sign in</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-brand-ink px-3 py-1.5 text-white">Sign up</button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/claim-matric" className="text-brand-steel hover:text-brand-ink">
              My matric
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>

      <h1 className="mt-8 font-display text-4xl leading-tight text-brand-ink md:text-5xl">
        Platform foundation is online.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-brand-steel/80">
        Phase 1 identity — Clerk sign-in with an auto-assigned Zeemble matric at signup.
      </p>

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link
          href="/sign-in"
          className="border border-brand-steel/20 px-4 py-2 text-brand-ink hover:border-brand-signal"
        >
          Sign in page
        </Link>
        <Link
          href="/sign-up"
          className="border border-brand-steel/20 px-4 py-2 text-brand-ink hover:border-brand-signal"
        >
          Sign up page
        </Link>
        <Link href="/claim-matric" className="bg-brand-signal px-4 py-2 text-white">
          My matric
        </Link>
      </div>
    </main>
  );
}
