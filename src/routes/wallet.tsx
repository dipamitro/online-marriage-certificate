import { createFileRoute } from "@tanstack/react-router";
import { MarriagePortal } from "@/components/MarriagePortal";

function WalletRouteComponent() {
  return <MarriagePortal initialPortal="wallet" />;
}

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "OneID Wallet · Online Marriage Registration" },
      {
        name: "description",
        content:
          "Access your verified identity credentials, sealed Nikahnama, Marriage Certificate, and Registrar Licence in OneID Wallet.",
      },
    ],
  }),
  component: WalletRouteComponent,
});
