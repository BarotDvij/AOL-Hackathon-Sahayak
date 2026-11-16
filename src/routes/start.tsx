import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/start")({
  head: () => ({ meta: [
    { title: "Choose your view · Sahayak" },
    { name: "description", content: "Open your personal Sahayak journey or the Journey coordinator dashboard." },
    { property: "og:title", content: "Choose your view · Sahayak" },
    { property: "og:description", content: "Open your personal Sahayak journey or the Journey coordinator dashboard." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: StartPage,
});

function StartPage() {
  return null;
}
