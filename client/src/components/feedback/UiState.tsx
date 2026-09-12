import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <p className="mt-8 text-sm text-muted-foreground" role="status" aria-live="polite">
      {label}
    </p>
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
    <div className="mt-8 border-t border-border pt-6" role="status">
      <p className="font-display text-xl text-foreground">{title}</p>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
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
