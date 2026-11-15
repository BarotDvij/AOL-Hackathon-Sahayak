import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, CalendarHeart, Check, Circle, MapPin, Plus, Target } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDemoParticipant } from "@/components/participant/DemoParticipantContext";
import { ParticipantCard } from "@/components/participant/ParticipantShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatFull } from "@/lib/journey/dates";
import { GoalsOverview } from "@/components/participant/GoalsOverview";
import { answerLabel, GOAL_QUESTION, type GoalPeriod } from "@/lib/sahayak/core";

export const Route = createFileRoute("/me/journey")({
  head: () => ({ meta: [
    { title: "My journey · Journey" },
    { name: "description", content: "Your course milestones, journey timeline and weekly, monthly, quarterly and annual goals." },
    { property: "og:title", content: "My journey · Journey" },
    { property: "og:description", content: "Your course milestones, journey timeline and weekly, monthly, quarterly and annual goals." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: JourneyPage,
});

function JourneyPage() {
  const { data, saveGoal } = useDemoParticipant();
  const [period, setPeriod] = useState<GoalPeriod | "week">("week");
  const [text, setText] = useState("");
  const [goalsOpen, setGoalsOpen] = useState(false);
  const intakeGoals = (["month", "quarter", "year"] as const).map((p) => ({ period: p, text: answerLabel(GOAL_QUESTION[p], data.answers[GOAL_QUESTION[p]]) })).filter((g) => g.text);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    saveGoal(period, text);
    setText("");
    toast.success("Your goal is saved for this demo.");
  }

  return (
    <div className="space-y-5">
      <header><h1 className="font-display text-[32px] font-normal text-primary">My journey</h1><p className="mt-1 text-sm text-muted-foreground">Where you are, where you'd like to go, and a gentle week to get there.</p></header>
      <div className="grid gap-5 pt-14 lg:grid-cols-2">
        <div><GoalsOverview /></div>
        <div className="relative mt-14 lg:mt-0">
          <Dialog open={goalsOpen} onOpenChange={setGoalsOpen}>
            <DialogTrigger asChild><Button variant="outline" size="icon" className="absolute -top-14 right-0" aria-label="Open your goals" title="Your goals"><Plus className="size-4" aria-hidden /></Button></DialogTrigger>
            <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg">
              <DialogHeader><DialogTitle>Your goals</DialogTitle><DialogDescription>What would you like to work towards?</DialogDescription></DialogHeader>
              {intakeGoals.length === 0 && data.goals.length === 0 && <p className="text-sm text-muted-foreground">No goals yet — add one below, or answer the questions in Settings.</p>}
              <ul className="divide-y divide-border">
                {[...intakeGoals, ...data.goals].map((goal, i) => <li key={`${goal.period}-${i}`} className="py-3"><span className="font-heading text-xs font-semibold text-purple">{PERIOD_LABEL[goal.period]}</span><p className="mt-0.5 break-words text-sm text-primary">{goal.text}</p></li>)}
              </ul>
              <form onSubmit={submit} className="flex flex-col gap-2"><Select value={period} onValueChange={(value) => setPeriod(value as GoalPeriod | "week")}><SelectTrigger aria-label="Goal period"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="week">This week</SelectItem><SelectItem value="month">This month</SelectItem><SelectItem value="quarter">This quarter</SelectItem><SelectItem value="year">This year</SelectItem></SelectContent></Select><Input required maxLength={500} value={text} onChange={(event) => setText(event.target.value)} placeholder="Add another goal" aria-label="Goal text" /><Button type="submit">Save</Button></form>
            </DialogContent>
          </Dialog>
          <ParticipantCard>
            <h2 className="font-heading text-base font-semibold text-primary">Your path</h2>
            <ol className="mt-5" aria-label="Course path">
              {data.position.steps.map((step, index) => (
                <li key={step.value} className="relative flex gap-3 pb-6 last:pb-0">
                  {index < data.position.steps.length - 1 && <span className="absolute bottom-0 left-[11px] top-6 w-px bg-border" />}
                  {step.state === "done" ? <Check className="relative z-10 size-6 rounded-full bg-stage-active p-1 text-stage-active-foreground" aria-hidden /> : step.state === "here" ? <MapPin className="relative z-10 size-6 rounded-full bg-primary p-1 text-primary-foreground" aria-hidden /> : step.state === "goal" ? <Target className="relative z-10 size-6 rounded-full bg-card p-0.5 text-sun-orange" aria-hidden /> : <Circle className="relative z-10 size-6 bg-card p-0.5 text-border" aria-hidden />}
                  <div>
                    <p className="text-sm font-medium text-primary">{step.milestone}</p>
                    <p className="text-xs text-muted-foreground">{step.state === "done" ? "Completed" : step.state === "here" ? "You are here" : step.state === "goal" ? "Where you want to go" : "A later step, whenever it feels right"}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-4 rounded-md bg-secondary px-3 py-2 text-xs text-muted-foreground"><span className="font-medium text-primary">Your home practice:</span> {data.guideline}</p>
          </ParticipantCard>
        </div>
      </div>
      <ParticipantCard><h2 className="font-heading text-base font-semibold text-primary">Journey so far</h2><ol className="mt-4 space-y-4 border-l border-border pl-5">{data.timeline.map((item, index) => <li key={`${item.date}-${index}`} className="relative"><span className="absolute -left-[27px] top-0.5 size-3 rounded-full bg-secondary ring-2 ring-card" /><p className="flex items-center gap-2 text-sm text-primary">{item.kind === "course" ? <BookOpen className="size-4 text-purple" aria-hidden /> : <CalendarHeart className="size-4 text-purple" aria-hidden />}{item.text}</p><p className="ml-6 text-xs text-muted-foreground">{formatFull(item.date)}</p></li>)}</ol></ParticipantCard>
    </div>
  );
}

const PERIOD_LABEL: Record<GoalPeriod | "week", string> = { week: "This week", month: "This month", quarter: "This quarter", year: "This year" };
