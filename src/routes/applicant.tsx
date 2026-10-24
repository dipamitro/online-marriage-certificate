import { createFileRoute } from "@tanstack/react-router";
import { MarriagePortal } from "@/components/MarriagePortal";

function ApplicantRouteComponent() {
  return <MarriagePortal initialPortal="applicant" />;
}

export const Route = createFileRoute("/applicant")({
  head: () => ({
    meta: [
      { title: "Applicant Portal · Online Marriage Registration" },
      {
        name: "description",
        content:
          "Submit a new marriage registration application, track status, and download your sealed Nikahnama and Marriage Certificate.",
      },
    ],
  }),
  component: ApplicantRouteComponent,
});
