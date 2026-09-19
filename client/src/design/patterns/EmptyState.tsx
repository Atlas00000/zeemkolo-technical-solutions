import type { ReactNode } from "react";
import { Text } from "@/design/primitives/Text";
import { cn } from "@/lib/utils";

export type EmptyStateProps = {
  title: string;
  description?: string;
  className?: string;
  action?: ReactNode;
};

/** Copy-only empty state — no illustration, emoji, or clip art. */
export function EmptyState({
  title,
  description,
  className,
  action,
}: EmptyStateProps) {
  return (
    <div
      data-slot="ln-empty-state"
      role="status"
      className={cn(
        "border border-dashed border-[var(--ln-hairline-strong)] bg-[var(--ln-canvas-elevated)] px-6 py-10",
        className
      )}
    >
      <Text variant="title">{title}</Text>
      {description ? (
        <Text variant="muted" className="mt-2 max-w-md">
          {description}
        </Text>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
