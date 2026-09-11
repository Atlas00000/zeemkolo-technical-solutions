"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { fetchMe } from "@/lib/api-client";
import { NewThreadForm } from "@/components/forum/NewThreadForm";

type ForumComposerProps = {
  categories: { slug: string; title: string }[];
};

export function ForumComposer({ categories }: ForumComposerProps) {
  const { getToken, isSignedIn } = useAuth();
  const [canWrite, setCanWrite] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadRole() {
      if (!isSignedIn) {
        setCanWrite(false);
        return;
      }
      try {
        const token = await getToken();
        if (!token) return;
        const me = await fetchMe(token);
        if (!cancelled) {
          setCanWrite(me.role === "ZEEMBLE_STUDENT" || me.role === "ADMIN");
        }
      } catch {
        if (!cancelled) setCanWrite(false);
      }
    }
    void loadRole();
    return () => {
      cancelled = true;
    };
  }, [getToken, isSignedIn]);

  return <NewThreadForm categories={categories} canWrite={canWrite} />;
}
