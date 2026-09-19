import { cn } from "@/lib/utils";

export type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      data-slot="ln-skeleton"
      aria-hidden
      className={cn(
        "rounded-[var(--ln-radius-sm)] bg-[linear-gradient(90deg,var(--ln-plane)_0%,var(--ln-plane-hover)_45%,var(--ln-plane)_100%)] bg-[length:200%_100%]",
        "motion-safe:animate-[ln-skeleton-shimmer_1.4s_ease-in-out_infinite]",
        className
      )}
    />
  );
}

export function SkeletonLine({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-3 w-full", className)} />;
}

export function SkeletonBlock({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-24 w-full", className)} />;
}

export function SkeletonMetric({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-3 p-5", className)}>
      <SkeletonLine className="w-24" />
      <Skeleton className="h-8 w-32" />
      <SkeletonLine className="w-40" />
    </div>
  );
}
