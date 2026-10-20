import { createFileRoute } from "@tanstack/react-router";
import { Experience } from "@/components/hero/Experience";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "MhadysEvents — Events, Merchandise & Auto Care in One Place" },
      { name: "description", content: "Explore the MhadysEvents 3D campus: event venues, merchandise fulfillment and auto care — one company, three services." },
      { property: "og:title", content: "MhadysEvents — Everything you need, all in one place" },
      { property: "og:description", content: "One company. Three services. Events, Merchandise and Auto Care in an interactive 3D campus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <>
      <Experience />
      <Toaster theme="dark" position="top-center" />
    </>
  ),
});
