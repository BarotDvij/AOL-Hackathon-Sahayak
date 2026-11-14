import { createFileRoute } from "@tanstack/react-router";
import { ParticipantMessages } from "@/components/participant/ParticipantMessages";

export const Route = createFileRoute("/me/messages")({
  head: () => ({ meta: [
    { title: "My messages · Sahayak" },
    { name: "description", content: "Only the messages your coordinator has approved for you, with simple reply choices." },
    { property: "og:title", content: "My messages · Sahayak" },
    { property: "og:description", content: "Only the messages your coordinator has approved for you, with simple reply choices." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: MessagesPage,
});

function MessagesPage() {
  return (
    <div className="space-y-5"><header><h1 className="font-display text-[32px] font-normal text-primary">Messages</h1><p className="mt-1 text-sm text-muted-foreground">Only messages approved by your coordinator appear here.</p></header>
      <ParticipantMessages />
    </div>
  );
}
