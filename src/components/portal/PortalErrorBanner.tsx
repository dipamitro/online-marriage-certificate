import { Button } from "@/components/ui/button";

export interface PortalErrorBannerProps {
  message: string;
  onRetry: () => void;
}

export function PortalErrorBanner({ message, onRetry }: PortalErrorBannerProps) {
  if (!message) return null;

  return (
    <div
      className="pubwrap mx-auto my-6 max-w-2xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 shadow-sm"
      role="alert"
    >
      <h2 className="text-lg font-semibold text-foreground">Registration could not load</h2>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <div className="mt-4">
        <Button onClick={onRetry}>Try again</Button>
      </div>
    </div>
  );
}
