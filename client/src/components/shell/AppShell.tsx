import { SiteNav } from "@/components/shell/SiteNav";
import { SiteFooter } from "@/components/shell/SiteFooter";

type AppShellProps = {
  children: React.ReactNode;
  variant?: "marketing" | "app";
  showFooter?: boolean;
};

/**
 * Shared marketing / product chrome (O6.1).
 * Use variant="marketing" on the home hero; "app" everywhere else.
 */
export function AppShell({
  children,
  variant = "app",
  showFooter = true,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav variant={variant} />
      <div className="flex-1">{children}</div>
      {showFooter ? <SiteFooter /> : null}
    </div>
  );
}
