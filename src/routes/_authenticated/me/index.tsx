import { createFileRoute, getRouteApi, useRouter } from "@tanstack/react-router";
import { CalendarPlus, Check, Clock3, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ParticipantCard, EmptyParticipantNote } from "@/components/participant/ParticipantShell";
import { Button } from "@/components/ui/button";
import { logMyPractice } from "@/lib/participant.functions";
import { cn } from "@/lib/utils";

const parent = getRouteApi("/_authenticated/me");

export const Route = createFileRoute("/_authenticated/me/")({
  head: () => ({ meta: [
    { title: "My home · Sahayak" },
    { name: "description", content: "A gentle view of your practice, friendly journey stage and upcoming sessions." },
    { property: "og:title", content: "My home · Sahayak" },
    { property: "og:description", content: "A gentle view of your practice, friendly journey stage and upcoming sessions." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: ParticipantHome,
});

function ParticipantHome() {
  const data = parent.useLoaderData();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [interested, setInterested] = useState<string[]>([]);
  if (!data.linked) return null;
  const today = new Date().toISOString().slice(0, 10);
  const practisedToday = data.practice.entries.some((e) => e.date === today);

  async function logToday() {
    setBusy(true);
    try { await logMyPractice({ data: {} }); await router.invalidate(); toast.success("Today's practice is logged. Well done."); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Please try again."); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-5">
      <header><p className="font-heading text-xs font-semibold uppercase tracking-widest text-purple">Your journey</p><h1 className="mt-1 font-display text-[32px] font-normal text-primary">Hello, {data.participant.firstName}</h1><p className="mt-1 text-sm text-muted-foreground">A little awareness today is enough.</p></header>
      <ParticipantCard className="bg-secondary"><p className="font-heading text-lg font-semibold text-primary">{data.stage.name}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{data.stage.line}</p></ParticipantCard>
      <div className="grid gap-4 md:grid-cols-2">
        <ParticipantCard>
          <h2 className="font-heading text-base font-semibold text-primary">Today's practice</h2>
          <div className="mt-4 flex justify-between gap-2" aria-label="Your last seven days">
            {data.practice.week.map((day) => <div key={day.date} className="text-center"><span className={cn("mx-auto block size-3 rounded-full", day.done ? "bg-sun-yellow" : "bg-muted")} /><span className="mt-1 block text-[10px] text-muted-foreground">{new Date(`${day.date}T12:00:00`).toLocaleDateString("en-CA", { weekday: "narrow" })}</span></div>)}
          </div>
          <Button className="mt-5 w-full" disabled={busy || practisedToday} onClick={logToday}>{practisedToday ? <Check className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}{practisedToday ? "Logged today" : "Log today's practice"}</Button>
        </ParticipantCard>
        <ParticipantCard>
          <h2 className="font-heading text-base font-semibold text-primary">Your suggested rhythm</h2>
          <p className="mt-3 flex items-center gap-2 text-sm text-primary"><Clock3 className="size-4 text-purple" aria-hidden />{data.schedule.time} · {data.schedule.minutes} minutes</p>
          <p className="mt-2 text-sm text-muted-foreground">{data.schedule.days.join(", ")}</p><p className="mt-3 text-xs text-muted-foreground">{data.schedule.note}</p>
        </ParticipantCard>
      </div>
      <ParticipantCard>
        <h2 className="font-heading text-base font-semibold text-primary">Coming up for you</h2>
        {data.upcoming.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Nothing scheduled just now. Your practice is still here for you.</p> : <div className="mt-4 grid gap-3 md:grid-cols-3">{data.upcoming.slice(0, 3).map((event) => <article key={event.id} className="rounded-lg border border-border p-4"><h3 className="font-heading text-sm font-semibold text-primary">{event.title}</h3><p className="mt-1 text-xs text-muted-foreground">{event.startDate} · {event.city}</p><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant={interested.includes(event.id) ? "secondary" : "outline"} onClick={() => { setInterested((all) => [...all, event.id]); toast.success("Interest noted for this visit."); }}>{interested.includes(event.id) ? "Interested" : "I'm interested"}</Button>{event.calendarUrl && <Button asChild size="sm" variant="accent"><a href={event.calendarUrl}><CalendarPlus className="size-4" aria-hidden />Calendar</a></Button>}</div></article>)}</div>}
      </ParticipantCard>
      {data.messages.length === 0 && <EmptyParticipantNote>No coordinator messages yet. When one is approved, it will appear in Messages.</EmptyParticipantNote>}
    </div>
  );
}
