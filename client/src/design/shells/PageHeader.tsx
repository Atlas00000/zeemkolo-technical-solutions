import * as React from "react";
import { cn } from "@/lib/utils";
import { Text } from "@/design/primitives/Text";

export type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

/**
 * Asymmetric page masthead — title cluster left, actions right (ActionRail sibling).
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      data-slot="ln-page-header"
      className={cn(
        "flex flex-col gap-6 border-b border-[var(--ln-hairline)] pb-8 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? <Text variant="eyebrow">{eyebrow}</Text> : null}
        <Text variant="display" className={eyebrow ? "mt-3" : undefined}>
          {title}
        </Text>
        {description ? (
          <Text variant="muted" className="mt-3 max-w-xl">
            {description}
          </Text>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
