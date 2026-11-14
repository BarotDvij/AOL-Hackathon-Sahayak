import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useDemoParticipant } from "./DemoParticipantContext";
import { Button } from "@/components/ui/button";

export function ParticipantMessages() {
  const { data, respond } = useDemoParticipant();
  if (data.messages.length === 0) return <div className="py-10 text-center text-sm text-muted-foreground"><MessageCircle className="mx-auto mb-3 size-6 text-purple" aria-hidden /><p>No messages yet.</p><p className="mt-1">There is nothing you need to do.</p></div>;
  return <div className="divide-y divide-border">{data.messages.map((message) => <article key={message.id} className="py-5 first:pt-0 last:pb-0">
    <div className="flex flex-wrap items-center gap-2 font-heading text-sm font-semibold text-primary"><MessageCircle className="size-4 text-purple" aria-hidden />{message.coordinatorName}<span className="ml-auto font-sans text-xs font-normal text-muted-foreground">{new Date(message.sentAt).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}</span></div>
    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">{message.text}</p>
    {message.reply ? <p className="mt-4 text-xs font-medium text-stage-active-foreground">You replied: {message.reply === "join" ? "I'd like to join" : "Not right now"}</p> : <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" onClick={() => { respond(message.id, "join"); toast.success("Your reply is saved for this demo."); }}>I'd like to join</Button><Button size="sm" variant="outline" onClick={() => { respond(message.id, "not now"); toast.success("Your reply is saved for this demo."); }}>Not right now</Button></div>}
  </article>)}</div>;
}