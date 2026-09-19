"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type PageEnterProps = React.ComponentProps<"div"> & {
  /** Stagger step for direct children with data-enter */
  stagger?: boolean;
};

/**
 * Staged page mount. Children with data-enter="1|2|3" stagger in.
 * Respects prefers-reduced-motion via CSS.
 */
export function PageEnter({
  className,
  stagger = true,
  children,
  ...props
}: PageEnterProps) {
  return (
    <div
      data-slot="ln-page-enter"
      className={cn(stagger ? undefined : "ln-page-enter", className)}
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (!stagger || !React.isValidElement(child)) return child;
        const step = Math.min(index, 3);
        const delayClass =
          step === 0
            ? "ln-page-enter"
            : step === 1
              ? "ln-page-enter-delay-1"
              : step === 2
                ? "ln-page-enter-delay-2"
                : "ln-page-enter-delay-3";
        const existing = (child.props as { className?: string }).className;
        return React.cloneElement(
          child as React.ReactElement<{ className?: string }>,
          { className: cn(existing, delayClass) }
        );
      })}
    </div>
  );
}
