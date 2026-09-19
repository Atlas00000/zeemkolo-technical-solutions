"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { fetchMe, type AppUser } from "@/lib/api-client";
import { AppShell } from "@/components/shell/AppShell";
import { AuthEntryField } from "@/components/auth/AuthEntryField";
import { MatricClaimForm } from "@/components/auth/MatricClaimForm";
import { Button } from "@/design/primitives/Button";
import { Badge } from "@/design/primitives/Badge";
import { Text } from "@/design/primitives/Text";
import { gateTone, matricGate, zoneTone } from "@/design/map/backend-status";

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
      setLoadError(
        error instanceof Error ? error.message : "Failed to load profile",
      );
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
    <AppShell>
      <main
        className="relative isolate overflow-hidden text-[var(--ln-ink)]"
        data-auth-field
      >
        <AuthEntryField word="MATRIC" />
        <div className="relative z-10 mx-auto max-w-shell px-[var(--ln-page-x)] py-14 md:py-20">
          <p className="font-sans text-sm font-medium tracking-[0.28em] text-[var(--ln-signal)] uppercase">
            Zeemble enrollment
          </p>
          <h1 className="mt-4 font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.08] tracking-[-0.04em] text-[var(--ln-ink)]">
            Your matric number
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-[var(--ln-muted)]">
            A unique Zeemble matric is assigned automatically when you sign up.
            Use it on kits, certificates, and forum identity.
          </p>
          <div
            className="mt-8 h-px w-20 bg-[var(--ln-signal)] md:w-28"
            aria-hidden
          />

          <div
            className="mt-10 max-w-xl space-y-6 border-t border-[var(--ln-signal)] pt-8"
            data-auth-stage
          >
            <SignedOut>
              <div className="space-y-4">
                <Text variant="muted">
                  Sign in to view your assigned matric.
                </Text>
                <SignInButton mode="modal">
                  <Button type="button">Sign in</Button>
                </SignInButton>
              </div>
            </SignedOut>

            <SignedIn>
              {loading && !user ? (
                <Text variant="muted">Assigning your matric…</Text>
              ) : null}
              {loadError ? (
                <p className="text-sm text-[var(--ln-halt)]" role="alert">
                  {loadError}
                </p>
              ) : null}

              {user ? (
                <div className="space-y-4">
                  <Text variant="muted">
                    Signed in as{" "}
                    <strong className="text-[var(--ln-ink)]">
                      {user.email}
                    </strong>
                  </Text>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={zoneTone(user.role)}>{user.role}</Badge>
                    <Badge tone={gateTone(matricGate(Boolean(user.matric)))}>
                      {user.matric ? "matric claimed" : "no matric"}
                    </Badge>
                  </div>
                  {user.matric ? (
                    <>
                      <Text variant="eyebrow">Matric</Text>
                      <p className="ln-tabular font-display text-3xl text-[var(--ln-mark)]">
                        {user.matric.code}
                      </p>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <Text variant="muted">
                        No matric on this account yet — claim one below or
                        contact support.
                      </Text>
                      <MatricClaimForm
                        onSuccess={() => {
                          void loadProfile();
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : null}
            </SignedIn>

            <Link
              href="/"
              className="inline-block text-sm text-[var(--ln-signal)] underline-offset-2 hover:underline"
            >
              ← Back home
            </Link>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
