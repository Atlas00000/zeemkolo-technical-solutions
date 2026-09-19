import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textVariants = cva("", {
  variants: {
    variant: {
      display:
        "font-display text-[length:var(--ln-text-3xl)] leading-[var(--ln-leading-display)] tracking-[var(--ln-tracking-tight)] text-[var(--ln-ink)] md:text-[length:var(--ln-text-4xl)]",
      title:
        "font-display text-[length:var(--ln-text-2xl)] leading-tight tracking-[var(--ln-tracking-tight)] text-[var(--ln-ink)]",
      eyebrow:
        "font-sans text-[length:var(--ln-text-xs)] font-medium uppercase tracking-[var(--ln-tracking-mark)] text-[var(--ln-signal)]",
      body: "font-sans text-[length:var(--ln-text-base)] leading-[var(--ln-leading-body)] text-[var(--ln-ink)]",
      muted:
        "font-sans text-[length:var(--ln-text-sm)] leading-[var(--ln-leading-body)] text-[var(--ln-muted)]",
      meta: "font-sans text-[length:var(--ln-text-xs)] text-[var(--ln-faint)]",
      metric:
        "ln-tabular text-[length:var(--ln-text-2xl)] font-medium text-[var(--ln-ink)]",
      code: "ln-tabular text-[length:var(--ln-text-sm)] text-[var(--ln-signal)]",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

type TextVariant = NonNullable<VariantProps<typeof textVariants>["variant"]>;

const defaultElement: Record<TextVariant, React.ElementType> = {
  display: "h1",
  title: "h2",
  eyebrow: "p",
  body: "p",
  muted: "p",
  meta: "span",
  metric: "span",
  code: "code",
};

export type TextProps = React.ComponentProps<"p"> &
  VariantProps<typeof textVariants> & {
    as?: React.ElementType;
  };

export function Text({
  className,
  variant = "body",
  as,
  ...props
}: TextProps) {
  const Comp = as ?? defaultElement[variant ?? "body"];
  return (
    <Comp
      data-slot="ln-text"
      className={cn(textVariants({ variant }), className)}
      {...props}
    />
  );
}
