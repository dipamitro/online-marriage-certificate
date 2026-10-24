import { createFileRoute } from "@tanstack/react-router";
import { MarriagePortal } from "@/components/MarriagePortal";

function SuperAdminConsoleRouteComponent() {
  return <MarriagePortal initialPortal="enl" initialEnlRole="super" />;
}

export const Route = createFileRoute("/superadmin")({
  head: () => ({
    meta: [
      { title: "Super Admin Console · Law and Justice Division" },
      {
        name: "description",
        content:
          "Approve marriage registrars with eSign, suspend or reinstate licences, and manage system administrators.",
      },
    ],
  }),
  component: SuperAdminConsoleRouteComponent,
});
