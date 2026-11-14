import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDemoParticipant } from "./DemoParticipantContext";
import { ParticipantMessages } from "./ParticipantMessages";

export function ParticipantMessageBox() {
  const [open, setOpen] = useState(false);
  const { data } = useDemoParticipant();
  const waiting = data.messages.filter((message) => !message.reply).length;
  return <div className="fixed bottom-20 left-4 z-40 lg:bottom-5 lg:left-5">
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild><Button aria-label="Open messages" className="shadow-soft"><MessageCircle className="size-4" aria-hidden />Messages{waiting > 0 && <span className="rounded-full bg-primary-foreground px-1.5 text-xs text-primary">{waiting}</span>}</Button></PopoverTrigger>
      <PopoverContent side="top" align="start" sideOffset={12} collisionPadding={16} aria-label="Your messages" className="flex max-h-[min(560px,65dvh)] w-[min(400px,calc(100vw-32px))] flex-col overflow-hidden rounded-lg border-border bg-card p-0 text-foreground shadow-soft">
        <header className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-4"><h2 className="font-heading text-base font-semibold text-primary">Messages</h2><Button variant="ghost" size="icon" aria-label="Close messages" className="ml-auto" onClick={() => setOpen(false)}><X className="size-4" aria-hidden /></Button></header>
        <div className="overflow-y-auto overscroll-contain p-5"><ParticipantMessages /></div>
      </PopoverContent>
    </Popover>
  </div>;
}