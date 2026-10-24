import { createFileRoute } from "@tanstack/react-router";
import { MarriagePortal } from "@/components/MarriagePortal";

function VerifyRouteComponent() {
  return <MarriagePortal initialPortal="verify" />;
}

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify Nikahnama or Marriage Certificate · Law and Justice Division" },
      {
        name: "description",
        content:
          "Verify the Visible Digital Seal (VDS) QR code of any issued Nikahnama or Marriage Certificate.",
      },
    ],
  }),
  component: VerifyRouteComponent,
});
