import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState as LnEmptyState } from "@/design/patterns/EmptyState";
import { SkeletonLine } from "@/design/patterns/Skeleton";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="mt-8 space-y-3" role="status" aria-live="polite">
      <SkeletonLine className="w-40" />
      <SkeletonLine className="w-64" />
      <p className="text-sm text-[var(--ln-muted)]">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <LnEmptyState
      className="mt-8"
      title={title}
      description={description}
    />
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="mt-8" role="alert">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
