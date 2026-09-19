import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  toneBgClass,
  toneBorderClass,
  toneClass,
  type VisualTone,
} from "@/design/map/backend-status";

const badgeVariants = cva(
  "inline-flex h-5 items-center gap-1 border px-2 text-[length:var(--ln-text-xs)] font-medium uppercase tracking-[0.08em]",
  {
    variants: {
      tone: {
        ink: cn(toneClass.ink, toneBgClass.ink, toneBorderClass.ink),
        muted: cn(toneClass.muted, toneBgClass.muted, toneBorderClass.muted),
        signal: cn(toneClass.signal, toneBgClass.signal, toneBorderClass.signal),
        warn: cn(toneClass.warn, toneBgClass.warn, toneBorderClass.warn),
        halt: cn(toneClass.halt, toneBgClass.halt, toneBorderClass.halt),
        skip: cn(toneClass.skip, toneBgClass.skip, toneBorderClass.skip),
      },
    },
    defaultVariants: {
      tone: "muted",
    },
  }
);

export type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    tone?: VisualTone;
  };

export function Badge({ className, tone = "muted", ...props }: BadgeProps) {
  return (
    <span
      data-slot="ln-badge"
      data-tone={tone}
      className={cn(badgeVariants({ tone }), className)}
      {...props}
    />
  );
}
