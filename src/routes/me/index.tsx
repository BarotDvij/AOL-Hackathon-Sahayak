import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Clock3, Plus } from "lucide-react";
import { toast } from "sonner";
import { formatShort } from "@/lib/journey/dates";
import { useDemoParticipant } from "@/components/participant/DemoParticipantContext";
import { ParticipantCard, EmptyParticipantNote } from "@/components/participant/ParticipantShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OnboardingForm } from "@/components/participant/OnboardingForm";
import { cn } from "@/lib/utils";
import { isMontreal, MONTREAL_CALENDAR } from "@/lib/sahayak/montreal-events";

export const Route = createFileRoute("/me/")({
  head: () => ({ meta: [
    { title: "My home · Sahayak" },
    { name: "description", content: "A gentle view of your practice, friendly journey stage and suggested rhythm." },
    { property: "og:title", content: "My home · Sahayak" },
    { property: "og:description", content: "A gentle view of your practice, friendly journey stage and suggested rhythm." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: ParticipantHome,
});

function ParticipantHome() {
  const { data, logToday, saveAnswers, welcomeOpen, openWelcome, closeWelcome } = useDemoParticipant();
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const practisedToday = data.practice.entries.some((entry) => entry.date === today);

  return (
    <div className="space-y-4">
      <Dialog open={welcomeOpen} onOpenChange={(open) => { if (!open) closeWelcome(); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-normal text-primary">Welcome, {data.participant.firstName}</DialogTitle>
            <DialogDescription>A few gentle questions about where you are, your practice and your goals. We'll then show your path and a weekly plan. Skip any of them — you can change your answers anytime in Settings.</DialogDescription>
          </DialogHeader>
          <OnboardingForm initialAnswers={data.answers} onSave={(answers) => { saveAnswers(answers); closeWelcome(); toast.success("Thank you — here is your journey and weekly plan."); navigate({ to: "/me/journey" }); }} />
          <Button variant="ghost" className="w-full" onClick={closeWelcome}>Maybe later</Button>
        </DialogContent>
      </Dialog>
      <header className="brand-gradient mb-2 rounded-lg border border-border px-5 py-5"><p className="font-heading text-xs font-semibold text-purple">Your journey · Demo</p><h1 className="mt-1 font-display text-[32px] font-normal leading-tight text-primary">Hello, {data.participant.firstName}</h1><p className="mt-1 text-sm text-muted-foreground">A little awareness today is enough.</p></header>
      <ParticipantCard><p className="font-heading text-xs font-semibold text-purple">Your journey today</p><p className="mt-2 font-heading text-lg font-semibold text-primary">{data.stage.name}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{data.stage.line}</p></ParticipantCard>
      <div className="grid gap-4 md:grid-cols-2">
        <ParticipantCard>
          <h2 className="font-heading text-base font-semibold text-primary">Today's practice</h2>
          <div className="mt-4 flex justify-between gap-2" aria-label="Your last seven days">
            {data.practice.week.map((day) => <div key={day.date} className="text-center"><span className={cn("mx-auto block size-3 rounded-full", day.done ? "bg-sun-yellow" : "bg-muted")} /><span className="mt-1 block text-[10px] text-muted-foreground">{new Date(`${day.date}T12:00:00`).toLocaleDateString("en-CA", { weekday: "narrow" })}</span></div>)}
          </div>
          <Button className="mt-5 w-full" disabled={practisedToday} onClick={() => { logToday(); toast.success("Today's practice is logged for this demo."); }}>{practisedToday ? <Check className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}{practisedToday ? "Logged today" : "Log today's practice"}</Button>
        </ParticipantCard>
        <ParticipantCard>
          <h2 className="font-heading text-base font-semibold text-primary">Your suggested rhythm</h2>
          <p className="mt-3 flex items-center gap-2 text-sm text-primary"><Clock3 className="size-4 text-purple" aria-hidden />{data.schedule.time} · {data.schedule.minutes} minutes</p>
          <p className="mt-2 text-sm text-muted-foreground">{data.schedule.days.join(", ")}</p>
          {data.schedule.reminders.length > 0 && <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted-foreground">{data.schedule.reminders.map((reminder) => <li key={reminder}>{reminder}</li>)}</ul>}
          <p className="mt-3 text-xs text-muted-foreground">{data.schedule.note} {data.schedule.safetyNote}</p>
        </ParticipantCard>
      </div>
      <UpcomingEventsCard events={data.upcoming} location={data.participant.city} />
      {data.messages.length === 0 && <EmptyParticipantNote>No coordinator messages yet. When one is approved, it will appear in Messages.</EmptyParticipantNote>}
    </div>
  );
}

const EVENT_PREVIEW_COUNT = 4;

type UpcomingEvent = ReturnType<typeof useDemoParticipant>["data"]["upcoming"][number];

function UpcomingEventsCard({ events, location }: { events: UpcomingEvent[]; location: string }) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? events : events.slice(0, EVENT_PREVIEW_COUNT);

  return (
    <ParticipantCard>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-heading text-base font-semibold text-primary">Upcoming events</h2>
        {events.length > 0 && <p className="text-xs text-muted-foreground">{events.length} coming up</p>}
      </div>
      {isMontreal(location) && <p className="mt-2 text-xs text-muted-foreground">Montréal · official listings checked November 14, 2026. Dates may change. <a className="font-semibold text-purple hover:underline" href={MONTREAL_CALENDAR} target="_blank" rel="noopener noreferrer">View the centre’s current calendar</a></p>}
      {events.length === 0 ? (
        <p className="mt-3 rounded-lg bg-muted p-4 text-sm text-muted-foreground">Nothing on the calendar right now. Check back soon.</p>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {shown.map((event) => (
            <li key={event.id} className="flex items-center gap-3 py-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-[11px] font-semibold text-primary">{event.startDate ? formatShort(event.startDate) : <Clock3 className="size-4 text-purple" aria-hidden />}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">{event.title}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{event.city}{event.suggestedTiming ? ` · ${event.suggestedTiming}` : ""}</span>
                {event.scheduleLabel && <span className="mt-1 block text-xs text-muted-foreground">{event.scheduleLabel}</span>}
                {event.sourceCheckedOn && event.link && <a className="mt-1 block text-xs font-semibold text-purple hover:underline" href={event.link} target="_blank" rel="noopener noreferrer">Official event details</a>}
                {event.needsLocalCheck && <span className="mt-1 block text-[11px] text-muted-foreground">Confirm with your centre</span>}
              </span>
              {event.calendarUrl && <a href={event.calendarUrl} download={event.calendarUrl.startsWith("data:") ? `${event.id}.ics` : undefined} className="shrink-0 font-heading text-xs font-semibold text-purple hover:underline">Add to calendar</a>}
            </li>
          ))}
        </ul>
      )}
      {events.length > EVENT_PREVIEW_COUNT && <Button variant="accent" size="sm" className="mt-2" onClick={() => setShowAll((current) => !current)}>{showAll ? "Show fewer" : `Show all ${events.length}`}</Button>}
    </ParticipantCard>
  );
}
