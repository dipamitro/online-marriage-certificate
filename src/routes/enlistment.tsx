import { createFileRoute } from "@tanstack/react-router";
import { MarriagePortal } from "@/components/MarriagePortal";

function EnlistmentRouteComponent() {
  return <MarriagePortal initialPortal="enl" initialEnlRole="applicant" />;
}

export const Route = createFileRoute("/enlistment")({
  head: () => ({
    meta: [
      { title: "Marriage Registrar Enlistment · Law and Justice Division" },
      {
        name: "description",
        content:
          "Apply for a Nikah Registrar licence, track your application, and view your issued registrar licence.",
      },
    ],
  }),
  component: EnlistmentRouteComponent,
});
