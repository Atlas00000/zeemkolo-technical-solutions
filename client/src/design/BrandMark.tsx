import Image from "next/image";
import { cn } from "@/lib/utils";
import { MARKETING_ASSETS } from "@/design/marketing-assets";

type BrandMarkProps = {
  className?: string;
  /** Show wordmark beside the mark */
  withWordmark?: boolean;
};

/**
 * C2 brand mark — logo icon + optional Zeemkolo wordmark.
 */
export function BrandMark({ className, withWordmark = true }: BrandMarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-[var(--ln-ink)]",
        className,
      )}
    >
      <Image
        src={MARKETING_ASSETS.logo}
        alt=""
        width={28}
        height={28}
        className="h-7 w-7 object-contain"
        priority
      />
      {withWordmark ? (
        <span className="font-display text-sm font-semibold tracking-[0.22em] uppercase">
          Zeemkolo
          <span
            className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--ln-signal)] align-middle shadow-[0_0_12px_var(--ln-signal)] dark:shadow-none"
            aria-hidden
          />
        </span>
      ) : null}
    </span>
  );
}
