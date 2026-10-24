import { createFileRoute } from "@tanstack/react-router";
import { MarriagePortal } from "@/components/MarriagePortal";

function EsignRouteComponent() {
  return <MarriagePortal initialPortal="esign" />;
}

export const Route = createFileRoute("/esign")({
  head: () => ({
    meta: [
      { title: "Groom & Bride eSign · Online Marriage Registration" },
      {
        name: "description",
        content:
          "Review your marriage registration application, complete OneID eKYC, and accept with eSign.",
      },
    ],
  }),
  component: EsignRouteComponent,
});
