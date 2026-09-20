import { SiteNav } from "@/components/shell/SiteNav";
import { SiteFooter } from "@/components/shell/SiteFooter";
import { MobileChrome } from "@/components/shell/mobile/MobileChrome";
import { MobileFooter } from "@/components/shell/mobile/MobileFooter";
import { PageEnter } from "@/design/motion/PageEnter";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  variant?: "marketing" | "app";
  showFooter?: boolean;
  /** Optional asymmetric main+rail frame for app pages */
  rail?: React.ReactNode;
  className?: string;
};

/**
 * Shared product chrome — Ledger Noir canvas, hairline nav, staged enter.
 * variant="marketing" for full-bleed heroes; "app" for product surfaces.
 * Mobile (< md) uses dedicated MobileChrome / MobileFooter.
 */
export function AppShell({
  children,
  variant = "app",
  showFooter = true,
  rail,
  className,
}: AppShellProps) {
  const marketing = variant === "marketing";

  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col",
        !marketing && "ln-shell",
        className
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-[var(--ln-signal)] focus:px-3 focus:py-2 focus:text-[var(--ln-signal-foreground)]"
      >
        Skip to content
      </a>
      <MobileChrome variant={variant} />
      <div className="hidden md:block">
        <SiteNav variant={variant} />
      </div>
      <div id="main-content" className="relative flex flex-1 flex-col">
        {rail ? (
          <PageEnter className="mx-auto flex w-full max-w-shell flex-1 flex-col gap-8 px-[var(--ln-page-x)] py-10 md:flex-row md:gap-10">
            <div className="min-w-0 flex-1">{children}</div>
            {rail}
          </PageEnter>
        ) : (
          <PageEnter className="flex-1" stagger={!marketing}>
            <div className="flex-1">{children}</div>
          </PageEnter>
        )}
      </div>
      {showFooter ? (
        <>
          <MobileFooter />
          <div className="hidden md:block">
            <SiteFooter />
          </div>
        </>
      ) : null}
    </div>
  );
}
