import { PortalLayout } from "@/layouts/PortalLayout";
import {
  useMarriagePortal,
  type EnlistmentRole,
  type PortalKey,
  type SignInRole,
} from "@/hooks/use-marriage-portal";
import "@/legacy/portal.css";

export interface MarriagePortalProps {
  initialPortal?: PortalKey;
  initialSignInRole?: SignInRole;
  initialEnlRole?: EnlistmentRole;
}

/**
 * Mounts the portal containers and synchronously boots the Marriage Registration
 * and Registrar Enlistment engines via the `useMarriagePortal` hook without any
 * loading spinner or async waterfall.
 */
export function MarriagePortal({
  initialPortal,
  initialSignInRole,
  initialEnlRole,
}: MarriagePortalProps = {}) {
  const { error, retry } = useMarriagePortal({
    ...(initialPortal !== undefined ? { initialPortal } : {}),
    ...(initialSignInRole !== undefined ? { initialSignInRole } : {}),
    ...(initialEnlRole !== undefined ? { initialEnlRole } : {}),
  });

  return <PortalLayout error={error} onRetry={retry} />;
}
