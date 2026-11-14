import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Clock3, Plus } from "lucide-react";
import { toast } from "sonner";
import { useDemoParticipant } from "@/components/participant/DemoParticipantContext";
import { ParticipantCard, EmptyParticipantNote } from "@/components/participant/ParticipantShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OnboardingForm } from "@/components/participant/OnboardingForm";
import { cn } from "@/lib/utils";

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
  const { data, logToday, saveAnswers, welcomeOpen, closeWelcome } = useDemoParticipant();
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
      {data.messages.length === 0 && <EmptyParticipantNote>No coordinator messages yet. When one is approved, it will appear in Messages.</EmptyParticipantNote>}
    </div>
  );
}
