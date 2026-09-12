"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { fetchMe } from "@/lib/api-client";

/** Shows Admin only when the signed-in user has role ADMIN (O6.1). */
export function AdminNavLink({ className }: { className?: string }) {
  const { isSignedIn, getToken } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const me = await fetchMe(token);
        if (!cancelled) setIsAdmin(me.role === "ADMIN");
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, getToken]);

  if (!isAdmin) return null;
  return (
    <Link href="/admin" className={className}>
      Admin
    </Link>
  );
}
