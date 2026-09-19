import * as React from "react";
import { cn } from "@/lib/utils";

export type IconProps = React.ComponentProps<"span"> & {
  size?: "sm" | "md" | "lg";
  label?: string;
};

const sizeClass = {
  sm: "size-3.5 [&_svg]:size-3.5",
  md: "size-4 [&_svg]:size-4",
  lg: "size-5 [&_svg]:size-5",
} as const;

/**
 * Thin wrapper so icons inherit tone color and a11y labels.
 * Pass a lucide (or other) SVG as children — no emoji.
 */
export function Icon({
  className,
  size = "md",
  label,
  children,
  ...props
}: IconProps) {
  return (
    <span
      data-slot="ln-icon"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        "inline-flex shrink-0 items-center justify-center text-current",
        sizeClass[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
