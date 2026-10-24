import { createFileRoute } from "@tanstack/react-router";
import { MarriagePortal } from "@/components/MarriagePortal";

function MarriageRegistrarSignInRouteComponent() {
  return <MarriagePortal initialPortal="home" initialSignInRole="registrar" />;
}

export const Route = createFileRoute("/marriage_resistar/sign-in")({
  head: () => ({
    meta: [
      { title: "Marriage Registrar Sign In · Law and Justice Division" },
      {
        name: "description",
        content:
          "Sign in to the Marriage Registrar portal or sign up with OneID eKYC to apply for enlistment.",
      },
    ],
  }),
  component: MarriageRegistrarSignInRouteComponent,
});
