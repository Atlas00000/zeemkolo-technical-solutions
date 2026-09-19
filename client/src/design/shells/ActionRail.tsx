import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Text } from "@/design/primitives/Text";

export type ActionRailItem = {
  id: string;
  label: string;
  hint?: string;
  onClick?: () => void;
  href?: string;
  active?: boolean;
};

export type ActionRailProps = {
  title?: string;
  items: ActionRailItem[];
  className?: string;
  footer?: React.ReactNode;
};

/**
 * Narrow vertical rail for contextual actions — breaks equal-card layout grammar.
 */
export function ActionRail({
  title = "Actions",
  items,
  className,
  footer,
}: ActionRailProps) {
  return (
    <aside
      data-slot="ln-action-rail"
      className={cn(
        "w-full border border-[var(--ln-hairline)] bg-[var(--ln-canvas-elevated)] p-4 md:w-[var(--ln-rail-width)] md:shrink-0",
        className
      )}
    >
      <Text
        variant="meta"
        className="uppercase tracking-[var(--ln-tracking-mark)]"
      >
        {title}
      </Text>
      <ul className="mt-4 space-y-1">
        {items.map((item) => {
          const classNameItem = cn(
            "block w-full border-l-2 px-3 py-2 text-left text-sm transition-colors",
            item.active
              ? "border-[var(--ln-signal)] bg-[var(--ln-signal-dim)] text-[var(--ln-ink)]"
              : "border-transparent text-[var(--ln-muted)] hover:border-[var(--ln-hairline-strong)] hover:bg-[var(--ln-plane)] hover:text-[var(--ln-ink)]"
          );

          return (
            <li key={item.id}>
              {item.href ? (
                <Link href={item.href} className={classNameItem}>
                  <span className="font-medium">{item.label}</span>
                  {item.hint ? (
                    <span className="mt-0.5 block text-xs text-[var(--ln-faint)]">
                      {item.hint}
                    </span>
                  ) : null}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className={classNameItem}
                >
                  <span className="font-medium">{item.label}</span>
                  {item.hint ? (
                    <span className="mt-0.5 block text-xs text-[var(--ln-faint)]">
                      {item.hint}
                    </span>
                  ) : null}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {footer ? (
        <div className="mt-6 border-t border-[var(--ln-hairline)] pt-4">
          {footer}
        </div>
      ) : null}
    </aside>
  );
}
