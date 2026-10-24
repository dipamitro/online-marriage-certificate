import { createFileRoute } from "@tanstack/react-router";
import { MarriagePortal } from "@/components/MarriagePortal";

function AdminSignInRouteComponent() {
  return <MarriagePortal initialPortal="home" initialSignInRole="admin" />;
}

export const Route = createFileRoute("/admin/sign-in")({
  head: () => ({
    meta: [
      { title: "Admin Sign In · Online Marriage Registration" },
      {
        name: "description",
        content:
          "Official sign-in for System Administrators of the Marriage Registrar Enlistment Portal.",
      },
    ],
  }),
  component: AdminSignInRouteComponent,
});
