"use client";

import { useEffect, useState } from "react";
import { MobileNavDrawer } from "@/components/shell/mobile/MobileNavDrawer";
import { MobileTopBar } from "@/components/shell/mobile/MobileTopBar";
import { useIsMobile } from "@/hooks/useIsMobile";

type MobileChromeProps = {
  variant?: "marketing" | "app";
};

/**
 * Mobile-only shell chrome — top bar + drawer.
 * Hidden from `md` up via CSS on children; closes the drawer if viewport grows.
 */
export function MobileChrome({ variant = "app" }: MobileChromeProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile && menuOpen) setMenuOpen(false);
  }, [isMobile, menuOpen]);

  return (
    <>
      <MobileTopBar
        variant={variant}
        menuOpen={menuOpen}
        onMenuOpen={() => setMenuOpen(true)}
      />
      <MobileNavDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        variant={variant}
      />
    </>
  );
}
