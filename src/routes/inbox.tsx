import { createFileRoute } from "@tanstack/react-router";
import { MarriagePortal } from "@/components/MarriagePortal";

function InboxRouteComponent() {
  return <MarriagePortal initialPortal="inbox" />;
}

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "Email Notifications · Online Marriage Registration" },
      {
        name: "description",
        content:
          "View marriage registration eSign invitations, approval notices, and issued certificates.",
      },
    ],
  }),
  component: InboxRouteComponent,
});
