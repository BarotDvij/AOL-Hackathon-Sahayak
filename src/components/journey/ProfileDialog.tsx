import { Link } from "@tanstack/react-router";
import { BookOpen, CalendarHeart, MessageCircleReply } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatFull, formatShort } from "@/lib/journey/dates";
import { useJourney, type ParticipantView } from "@/lib/journey/store";
import { ChannelIcon, StageBadge } from "./bits";

export function ProfileDialog({ view, onOpenChange }: { view: ParticipantView | null; onOpenChange: (o: boolean) => void }) {
  const { catalog } = useJourney();
  if (!view) return null;
  const { participant: p, history: h, suggestion: s } = view;
  const items = [
    ...h.courses.map((c) => ({ date: c.completedOn, Icon: BookOpen, text: `Completed ${c.courseName}` })),
    ...h.events.map((e) => ({ date: e.date, Icon: CalendarHeart, text: `Attended a ${e.eventType}${e.online ? " (online)" : ""}` })),
    ...h.contacts.map((c) => ({ date: c.date, Icon: MessageCircleReply, text: `${c.direction === "out" ? "Reached out" : "Heard back"} by ${c.channel} · ${c.outcome}` })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  const step = s && s.status === "pending" ? catalog.get(s.nextStepId) : null;
  const channel = s?.channel ?? p.preferredChannel;

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{p.firstName} {p.lastName}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <StageBadge stage={view.stage} />
              <span>{p.city}</span>
              {channel && <ChannelIcon channel={channel} withLabel />}
            </div>
          </DialogDescription>
        </DialogHeader>

        <section>
          <h3 className="mb-2 text-sm font-semibold">Journey so far</h3>
          <ol className="space-y-2.5 border-l border-border pl-4">
            {items.map((it, i) => (
              <li key={i} className="relative text-sm">
                <span className="absolute -left-[1.4rem] top-1 grid size-3 place-items-center rounded-full bg-secondary ring-2 ring-card" />
                <span className="flex items-start gap-2"><it.Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />{it.text}</span>
                <span className="ml-6 text-xs text-muted-foreground">{formatFull(it.date)}</span>
              </li>
            ))}
          </ol>
        </section>

        {step && s ? (
          <section className="rounded-lg bg-secondary p-4">
            <p className="text-sm font-semibold text-primary-strong">Next step: {step.shortTitle}{step.startDate ? ` · ${formatShort(step.startDate)}` : ""}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.why}</p>
            <Button asChild size="sm" className="mt-3">
              <Link to="/review" hash={s.id} onClick={() => onOpenChange(false)}>Open in review queue</Link>
            </Button>
          </section>
        ) : (
          <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">{view.why}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
