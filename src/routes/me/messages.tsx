import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useDemoParticipant } from "@/components/participant/DemoParticipantContext";
import { ParticipantCard, EmptyParticipantNote } from "@/components/participant/ParticipantShell";
import { Button } from "@/components/ui/button";

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
  const { data, respond } = useDemoParticipant();

  return (
    <div className="space-y-5"><header><h1 className="font-display text-[32px] font-normal text-primary">Messages</h1><p className="mt-1 text-sm text-muted-foreground">Only messages approved by your coordinator appear here.</p></header>
      {data.messages.length === 0 ? <EmptyParticipantNote>No messages yet. There is nothing you need to do.</EmptyParticipantNote> : data.messages.map((message) => <ParticipantCard key={message.id}><div className="flex items-center gap-2 text-sm font-medium text-primary"><MessageCircle className="size-4 text-purple" aria-hidden />{message.coordinatorName}<span className="ml-auto text-xs font-normal text-muted-foreground">{new Date(message.sentAt).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{message.text}</p>{message.reply ? <p className="mt-4 inline-flex rounded-full bg-stage-active px-3 py-1 text-xs font-medium text-stage-active-foreground">You replied: {message.reply === "join" ? "I'd like to join" : "Not right now"}</p> : <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" onClick={() => { respond(message.id, "join"); toast.success("Your reply is saved for this demo."); }}>I'd like to join</Button><Button size="sm" variant="outline" onClick={() => { respond(message.id, "not now"); toast.success("Your reply is saved for this demo."); }}>Not right now</Button></div>}</ParticipantCard>)}
    </div>
  );
}
