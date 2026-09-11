"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { fetchMe, type AppUser } from "@/lib/api-client";

export default function EnrollmentPage() {
  const { getToken, isSignedIn } = useAuth();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadProfile() {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const me = await fetchMe(token);
      setUser(me);
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isSignedIn) {
      void loadProfile();
    }
  }, [isSignedIn]);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      <p className="font-display text-sm tracking-[0.2em] text-brand-signal uppercase">
        Zeemble enrollment
      </p>
      <h1 className="mt-3 font-display text-3xl text-brand-ink">Your matric number</h1>
      <p className="mt-3 text-brand-steel/80">
        A unique Zeemble matric is assigned automatically when you sign up. Use it on kits,
        certificates, and forum identity.
      </p>

      <SignedOut>
        <div className="mt-8 space-y-4">
          <p className="text-sm text-brand-steel">Sign in to view your assigned matric.</p>
          <SignInButton mode="modal">
            <button className="bg-brand-ink px-4 py-2.5 text-sm text-white">Sign in</button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        {loading && !user ? (
          <p className="mt-8 text-sm text-brand-steel">Assigning your matric…</p>
        ) : null}
        {loadError ? <p className="mt-4 text-sm text-red-700">{loadError}</p> : null}

        {user ? (
          <div className="mt-8 space-y-4 rounded border border-brand-steel/15 bg-white px-5 py-5">
            <p className="text-sm text-brand-steel">
              Signed in as <strong>{user.email}</strong>
            </p>
            <p className="text-sm text-brand-steel">
              Role: <strong>{user.role}</strong>
            </p>
            {user.matric ? (
              <>
                <p className="font-display text-sm tracking-[0.15em] text-brand-signal uppercase">
                  Matric
                </p>
                <p className="font-mono text-3xl text-brand-ink">{user.matric.code}</p>
              </>
            ) : (
              <p className="text-sm text-brand-signal">
                No matric on this account yet — refresh or contact support.
              </p>
            )}
          </div>
        ) : null}
      </SignedIn>

      <Link href="/" className="mt-10 text-sm text-brand-signal underline-offset-2 hover:underline">
        ← Back home
      </Link>
    </main>
  );
}
