import { createFileRoute } from "@tanstack/react-router";
import { MarriagePortal } from "@/components/MarriagePortal";

function HomeRouteComponent() {
  return <MarriagePortal initialPortal="home" />;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Online Marriage Registration and Registrar Enlistment · Law and Justice Division" },
      {
        name: "description",
        content:
          "Apply for marriage registration, e-sign, verify certificates and manage registrar enlistment online.",
      },
      { property: "og:title", content: "Online Marriage Registration · Law and Justice Division" },
      {
        property: "og:description",
        content: "Apply, e-sign and verify marriage registrations and registrar enlistment online.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeRouteComponent,
});
