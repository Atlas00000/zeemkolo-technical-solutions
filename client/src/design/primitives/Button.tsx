import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 border text-sm font-medium transition-[background-color,border-color,color,transform] duration-[var(--ln-duration-fast)] ease-[var(--ln-ease-out)] outline-none select-none focus-visible:ring-2 focus-visible:ring-[var(--ln-signal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ln-canvas)] disabled:pointer-events-none disabled:opacity-40 active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "border-[var(--ln-hairline-strong)] bg-transparent text-[var(--ln-ink)] hover:border-[color-mix(in_srgb,var(--ln-signal)_45%,var(--ln-hairline-strong))] hover:bg-[var(--ln-signal-dim)] hover:text-[var(--ln-ink)]",
        secondary:
          "border-[var(--ln-hairline-strong)] bg-transparent text-[var(--ln-ink)] hover:border-[var(--ln-ink)] hover:bg-[var(--ln-plane-hover)]",
        ghost:
          "border-transparent bg-transparent text-[var(--ln-muted)] hover:bg-[var(--ln-signal-dim)] hover:text-[var(--ln-ink)]",
        danger:
          "border-[color-mix(in_srgb,var(--ln-halt)_40%,transparent)] bg-transparent text-[var(--ln-halt)] hover:bg-[var(--ln-halt-dim)]",
        link: "border-transparent bg-transparent text-[var(--ln-ink)] underline-offset-4 hover:text-[var(--ln-signal)] hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-11 px-5 text-base",
        icon: "size-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="ln-button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
