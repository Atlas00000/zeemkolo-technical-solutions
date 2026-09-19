"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { VisualTone } from "@/design/map/backend-status";

export type StateCrossfadeProps = {
  stateKey: string;
  tone?: VisualTone;
  className?: string;
  children: React.ReactNode;
};

/**
 * Crossfades content when backend state keys change; optional signal flash.
 */
export function StateCrossfade({
  stateKey,
  tone = "signal",
  className,
  children,
}: StateCrossfadeProps) {
  const [flash, setFlash] = React.useState(false);
  const prev = React.useRef(stateKey);

  React.useEffect(() => {
    if (prev.current === stateKey) return;
    prev.current = stateKey;
    setFlash(true);
    const id = window.setTimeout(() => setFlash(false), 280);
    return () => window.clearTimeout(id);
  }, [stateKey]);

  return (
    <div
      data-slot="ln-state-crossfade"
      data-tone={tone}
      data-state={stateKey}
      className={cn(
        "transition-opacity duration-[var(--ln-duration-fast)] ease-[var(--ln-ease-out)]",
        flash && "ln-state-flash",
        className
      )}
    >
      {children}
    </div>
  );
}
