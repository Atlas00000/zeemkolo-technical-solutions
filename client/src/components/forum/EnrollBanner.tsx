import Link from "next/link";
import { Button } from "@/design/primitives/Button";

type EnrollBannerProps = {
  message?: string;
};

/**
 * Gate UI — enroll required. Open plane, no Surface box.
 */
export function EnrollBanner({
  message = "Enroll in Zeemble to reply",
}: EnrollBannerProps) {
  return (
    <div
      className="border-t border-[var(--ln-mark)] pt-6"
      data-forum-enroll
    >
      <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--ln-mark)] uppercase">
        Student zone
      </p>
      <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-[var(--ln-muted)] md:text-base">
        {message}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild size="sm">
          <Link href="/sign-up">Sign up</Link>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href="/zeemble">Browse courses</Link>
        </Button>
      </div>
    </div>
  );
}
