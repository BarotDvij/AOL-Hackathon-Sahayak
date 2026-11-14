import { useEffect, useRef, useState } from "react";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { useDemoParticipant } from "./DemoParticipantContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("");
const timeLabel = (date: string) => new Date(date).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });

export function ParticipantMessages() {
  const { data, chatReplies, sendChatReply } = useDemoParticipant();
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const names = [...new Set(data.messages.map((message) => message.coordinatorName))];
  const messages = data.messages.filter((message) => message.coordinatorName === selected).sort((a, b) => a.sentAt.localeCompare(b.sentAt));
  const messageIds = new Set(messages.map((message) => message.id));
  const replies = chatReplies.filter((reply) => messageIds.has(reply.messageId));
  const entries = [
    ...messages.map((message) => ({ id: message.id, text: message.text, date: message.sentAt, outgoing: false })),
    ...messages.filter((message) => message.reply).map((message) => ({ id: `${message.id}-reply`, text: message.reply === "join" ? "I'd like to join" : "Not right now", date: message.sentAt, outgoing: true })),
    ...replies.map((reply) => ({ id: reply.id, text: reply.text, date: reply.sentAt, outgoing: true })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  useEffect(() => { bottom.current?.scrollIntoView({ block: "nearest" }); }, [selected, chatReplies.length]);

  if (data.messages.length === 0) return <div className="py-10 text-center text-sm text-muted-foreground"><MessageCircle className="mx-auto mb-3 size-6 text-purple" aria-hidden /><p>No messages yet.</p><p className="mt-1">There is nothing you need to do.</p></div>;
  if (!selected) return <div className="min-h-52 divide-y divide-border overflow-y-auto" aria-label="Conversations">{names.sort((a, b) => {
    const latest = (name: string) => Math.max(...data.messages.filter((m) => m.coordinatorName === name).map((m) => new Date(m.sentAt).getTime()), ...chatReplies.filter((r) => data.messages.some((m) => m.id === r.messageId && m.coordinatorName === name)).map((r) => new Date(r.sentAt).getTime()));
    return latest(b) - latest(a);
  }).map((name) => {
    const incoming = data.messages.filter((m) => m.coordinatorName === name).sort((a, b) => b.sentAt.localeCompare(a.sentAt));
    const latest = incoming[0];
    if (!latest) return null;
    const lastReply = chatReplies.filter((r) => incoming.some((m) => m.id === r.messageId)).sort((a, b) => b.sentAt.localeCompare(a.sentAt))[0];
    const outgoing = lastReply && lastReply.sentAt >= latest.sentAt;
    const date = outgoing ? lastReply.sentAt : latest.sentAt;
    return <Button key={name} variant="ghost" aria-label={`Open conversation with ${name}`} onClick={() => { setSelected(name); setDraft(""); }} className="h-auto w-full justify-start gap-3 rounded-none px-4 py-4 text-left">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary font-heading text-sm font-semibold text-purple" aria-hidden>{initials(name)}</span>
      <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate font-heading text-sm font-semibold text-primary">{name}</span><span className="shrink-0 font-sans text-[11px] font-normal text-muted-foreground">{new Date(date).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}</span></span><span className="mt-1 block truncate font-sans text-xs font-normal text-muted-foreground">{outgoing ? `You: ${lastReply.text}` : latest.text}</span></span>
    </Button>;
  })}</div>;

  return <div className="flex min-h-0 flex-1 flex-col">
    <div className="flex shrink-0 items-center gap-3 border-b border-border px-3 py-3"><Button variant="ghost" size="icon" aria-label="Back to conversations" onClick={() => setSelected(null)}><ArrowLeft className="size-4" aria-hidden /></Button><span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-purple" aria-hidden>{initials(selected)}</span><div className="min-w-0"><h3 className="truncate font-heading text-sm font-semibold text-primary">{selected}</h3><p className="text-xs text-muted-foreground">Coordinator</p></div></div>
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-background px-4 py-4" role="log" aria-label={`Chat with ${selected}`} aria-live="polite">{entries.map((entry) => <div key={entry.id} className={cn("flex", entry.outgoing ? "justify-end" : "justify-start")}><div className={cn("max-w-[85%] rounded-lg px-3 py-2", entry.outgoing ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground")}><p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{entry.text}</p><p className={cn("mt-1 text-right text-[10px]", entry.outgoing ? "text-primary-foreground/80" : "text-muted-foreground")}>{timeLabel(entry.date)}</p></div></div>)}<div ref={bottom} /></div>
    <form className="shrink-0 border-t border-border bg-card p-3" onSubmit={(event) => { event.preventDefault(); const latest = messages[messages.length - 1]; if (latest && sendChatReply(latest.id, draft)) setDraft(""); }}>
      <div className="flex items-end gap-2"><Textarea aria-label="Message reply" placeholder="Write a message…" rows={2} maxLength={2000} value={draft} onChange={(event) => setDraft(event.target.value)} className="max-h-24 min-h-11 resize-none" onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} /><Button type="submit" size="icon" aria-label="Send reply" title="Send reply" disabled={!draft.trim()} className="shrink-0"><Send className="size-4" aria-hidden /></Button></div>
      <p className="mt-2 text-[10px] text-muted-foreground">Demo chat · replies stay in this tab.</p>
    </form>
  </div>;
}