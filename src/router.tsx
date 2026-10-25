import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

/**
 * Creates and configures the application's TanStack Router instance.
 *
 * Route definitions live in `src/routes/`:
 * - `/applicant/sign-in`         → Applicant Sign-In
 * - `/marriage_resistar/sign-in` → Marriage Registrar Sign-In
 * - `/admin/sign-in`             → Admin Sign-In
 * - `/superadmin/sign-in`        → Super Admin Sign-In
 * - `/applicant`                 → Marriage Registration Applicant Portal
 * - `/registrar`                 → Marriage Registrar Desk
 * - `/enlistment`                → Registrar Enlistment Applicant Portal
 * - `/admin`                     → Law & Justice Division Admin Console
 * - `/superadmin`                → Law & Justice Division Super Admin Console
 * - `/esign`                     → Bride & Groom eSign Portal
 * - `/wallet`                    → OneID Wallet & Documents Vault
 * - `/verify`                    → Universal Nikahnama & Certificate Verifier
 * - `/inbox`                     → Simulated Email Inbox
 */
export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
