import { createFileRoute } from "@tanstack/react-router";
import { MarriagePortal } from "@/components/MarriagePortal";

function SuperAdminSignInRouteComponent() {
  return <MarriagePortal initialPortal="home" initialSignInRole="super" />;
}

export const Route = createFileRoute("/superadmin/sign-in")({
  head: () => ({
    meta: [
      { title: "Super Admin Sign In · Law and Justice Division" },
      {
        name: "description",
        content:
          "Official sign-in for the Super Admin of the Marriage Registrar Enlistment Portal.",
      },
    ],
  }),
  component: SuperAdminSignInRouteComponent,
});
