import type { ReactNode } from "react";
import { PortalMountContainers } from "@/components/portal/PortalMountContainers";
import { PortalErrorBanner } from "@/components/portal/PortalErrorBanner";

export interface PortalLayoutProps {
  error?: string;
  onRetry?: () => void;
  children?: ReactNode;
}

/**
 * Standard portal layout wrapper providing background, error boundary,
 * and DOM mount containers for the marriage portal system.
 */
export function PortalLayout({ error = "", onRetry = () => {}, children }: PortalLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {error ? <PortalErrorBanner message={error} onRetry={onRetry} /> : null}
      <PortalMountContainers />
      {children}
    </div>
  );
}
