import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const surfaceVariants = cva("text-[var(--ln-ink)]", {
  variants: {
    variant: {
      void: "bg-[var(--ln-canvas)]",
      plane: "ln-plane rounded-[var(--ln-radius-sm)]",
      flat: "ln-plane-flat rounded-[var(--ln-radius-sm)]",
      inset: "rounded-[var(--ln-radius-sm)] bg-[var(--ln-canvas-elevated)] border border-[var(--ln-hairline)]",
      signal: "rounded-[var(--ln-radius-sm)] bg-[var(--ln-signal-dim)] border border-[color-mix(in_srgb,var(--ln-signal)_35%,transparent)]",
    },
    padding: {
      none: "p-0",
      sm: "p-[var(--ln-space-3)]",
      md: "p-[var(--ln-space-5)]",
      lg: "p-[var(--ln-space-6)]",
    },
  },
  defaultVariants: {
    variant: "plane",
    padding: "md",
  },
});

export type SurfaceProps = React.ComponentProps<"div"> &
  VariantProps<typeof surfaceVariants>;

export function Surface({
  className,
  variant,
  padding,
  ...props
}: SurfaceProps) {
  return (
    <div
      data-slot="ln-surface"
      className={cn(surfaceVariants({ variant, padding }), className)}
      {...props}
    />
  );
}
