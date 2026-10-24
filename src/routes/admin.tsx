import { createFileRoute } from "@tanstack/react-router";
import { MarriagePortal } from "@/components/MarriagePortal";

function AdminConsoleRouteComponent() {
  return <MarriagePortal initialPortal="enl" initialEnlRole="admin" />;
}

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console · Marriage Registrar Enlistment" },
      {
        name: "description",
        content:
          "Review and approve marriage registrar enlistment applications, manage jurisdictions, and maintain the registrar directory.",
      },
    ],
  }),
  component: AdminConsoleRouteComponent,
});
