import { Link } from "@tanstack/react-router";
import { BookOpen, CalendarHeart, MessageCircleReply } from "lucide-react";
import { PanelClose } from "@/components/journey/AppShell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { formatFull, formatShort } from "@/lib/journey/dates";
import { useJourney, type ParticipantView } from "@/lib/journey/store";
import { eligibleSteps } from "@/lib/sahayak/core";
import type { NextStep } from "@/lib/journey/types";
import { ChannelIcon, StageBadge } from "./bits";
import { CoordinatorSummaries } from "./CoordinatorSummaries";

/** A person's detail opens as a panel from the right, so the coordinator never leaves the list. */
export function ProfilePanel({ view, onOpenChange }: { view: ParticipantView | null; onOpenChange: (o: boolean) => void }) {
  return (
    <Sheet open={!!view} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:w-[480px] sm:max-w-[480px]">
        {view && <Body view={view} />}
      </SheetContent>
    </Sheet>
  );
}

function Body({ view }: { view: ParticipantView }) {
  const { catalog, catalogList, chooseStep } = useJourney();
  const { participant: p, history: h, suggestion: s } = view;
  const items = [
    ...h.courses.map((c) => ({ date: c.completedOn, Icon: BookOpen, text: `Completed ${c.courseName}` })),
    ...h.events.map((e) => ({ date: e.date, Icon: CalendarHeart, text: `Attended a ${e.eventType}${e.online ? " (online)" : ""}` })),
    ...h.contacts.map((c) => ({ date: c.date, Icon: MessageCircleReply, text: `${c.direction === "out" ? "Reached out" : "Heard back"} by ${c.channel} · ${c.outcome}` })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  const paused = view.stage === "paused";
  const step = !paused && s && s.status === "pending" ? catalog.get(s.nextStepId) ?? null : null;
  const channel = s?.channel ?? p.preferredChannel;
  const options: NextStep[] = (() => {
    if (!step || !s) return [];
    const list = eligibleSteps(p, h, view.stage, catalogList);
    return list.some((o) => o.id === step.id) ? list : [step, ...list];
  })();

  return (
    <>
      <div className="border-b border-border px-6 py-5">
        <SheetTitle className="font-display text-[22px] font-normal text-primary">{p.firstName} {p.lastName}</SheetTitle>
        <SheetDescription className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <StageBadge stage={view.stage} />
          <span>{p.city}</span>
          {channel && <ChannelIcon channel={channel} withLabel />}
        </SheetDescription>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        <section>
          <h3 className="mb-3 font-heading text-sm font-semibold text-primary">Journey so far</h3>
          <ol className="space-y-3 border-l border-border pl-4">
            {items.map((it, i) => (
              <li key={i} className="relative text-sm">
                <span className="absolute -left-[1.4rem] top-1 grid size-3 place-items-center rounded-full bg-secondary ring-2 ring-card" />
                <span className="flex items-start gap-2"><it.Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />{it.text}</span>
                <span className="ml-6 block text-xs text-muted-foreground">{formatFull(it.date)}</span>
              </li>
            ))}
          </ol>
        </section>

        <CoordinatorSummaries participantId={p.id} />

        {step && s ? (
          <section className="rounded-lg border border-border bg-secondary p-4">
            <p className="font-heading text-sm font-semibold text-primary">Suggested next step: {step.shortTitle}{step.startDate ? ` · ${formatShort(step.startDate)}` : ""}</p>
            {s.lowData && <p className="mt-1 text-xs font-medium text-sun-orange-deep">Not enough info yet — we suggest a gentle check-in.</p>}
            <p className="mt-1.5 text-sm text-muted-foreground">{s.why}</p>
            {step.program?.suggested_timing && <p className="mt-2 text-xs text-muted-foreground">Suggested timing: {step.program.suggested_timing}</p>}
            {step.program?.needs_local_check && <p className="mt-2 inline-flex rounded-full bg-sun-orange px-2.5 py-1 text-xs font-semibold text-primary">Confirm with your centre</p>}
            {options.length > 1 && (
              <div className="mt-3">
                <label className="mb-1 block text-xs font-medium text-muted-foreground" htmlFor={`step-${p.id}`}>Choose a different step</label>
                <Select value={step.id} onValueChange={(id) => chooseStep(p.id, id)}>
                  <SelectTrigger id={`step-${p.id}`} className="w-full bg-card"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {options.map((o) => <SelectItem key={o.id} value={o.id}>{o.shortTitle}{o.startDate ? ` · ${formatShort(o.startDate)}` : ""}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </section>
        ) : (
          <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">{view.why}</p>
        )}
      </div>

      <div className="border-t border-border px-6 py-4">
        {step && s ? (
          <PanelClose>
            <Button asChild className="w-full"><Link to="/review">Review message</Link></Button>
          </PanelClose>
        ) : (
          <p className="text-center text-xs text-muted-foreground">No message is waiting for this person.</p>
        )}
      </div>
    </>
  );
}
