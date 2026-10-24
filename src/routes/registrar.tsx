import { createFileRoute } from "@tanstack/react-router";
import { MarriagePortal } from "@/components/MarriagePortal";

function RegistrarRouteComponent() {
  return <MarriagePortal initialPortal="registrar" />;
}

export const Route = createFileRoute("/registrar")({
  head: () => ({
    meta: [
      { title: "Marriage Registrar Desk · Law and Justice Division" },
      {
        name: "description",
        content:
          "Appraise marriage registration applications, verify eKYC checks, and approve with eSign.",
      },
    ],
  }),
  component: RegistrarRouteComponent,
});
