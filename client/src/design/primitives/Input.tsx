import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.ComponentProps<"input">;

export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="ln-input"
      className={cn(
        "h-9 w-full min-w-0 border border-[var(--ln-hairline-strong)] bg-[var(--ln-canvas-elevated)] px-3 text-sm text-[var(--ln-ink)] outline-none transition-colors placeholder:text-[var(--ln-faint)] focus-visible:border-[var(--ln-signal)] focus-visible:ring-2 focus-visible:ring-[var(--ln-signal)]/30 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
