import { createFileRoute } from "@tanstack/react-router";
import { MarriagePortal } from "@/components/MarriagePortal";

function ApplicantSignInRouteComponent() {
  return <MarriagePortal initialPortal="home" initialSignInRole="applicant" />;
}

export const Route = createFileRoute("/applicant/sign-in")({
  head: () => ({
    meta: [
      { title: "Applicant Sign In · Online Marriage Registration" },
      {
        name: "description",
        content:
          "Sign in with OneID or sign up with OneID eKYC as a marriage certificate applicant.",
      },
    ],
  }),
  component: ApplicantSignInRouteComponent,
});
