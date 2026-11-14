import { CheckCircle2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoParticipant } from "./DemoParticipantContext";

export function WeeklyPracticePlan() {
  const { data, isDayDone, completeDay } = useDemoParticipant();
  const total = data.plan.length;
  const done = data.plan.filter((day) => isDayDone(day.day)).length;
  return <div className="pr-12 lg:pr-0">
    <div className="flex items-center justify-between gap-3"><h2 className="font-heading text-base font-semibold text-primary">Your weekly plan</h2><span className="shrink-0 text-xs text-muted-foreground">{done} / {total} done</span></div>
    <ul className="mt-4 divide-y divide-border" aria-label="Weekly plan">
      {data.plan.map((day) => <li key={day.day} className="py-4">
        <h3 className="mb-2 font-heading text-sm font-semibold text-primary">{day.day}</h3>
        <ul className="space-y-2">{day.items.map((item) => <li key={item.text} className="text-sm text-foreground">{item.text}</li>)}</ul>
        <div className="mt-3">{isDayDone(day.day) ? <span className="inline-flex items-center gap-1.5 text-sm text-stage-active-foreground" aria-label={`${day.day} done`}><CheckCircle2 className="size-4" aria-hidden />Done</span> : <Button variant="outline" size="sm" aria-label={`Mark ${day.day} as done`} onClick={() => completeDay(day.day)}><Check className="size-4" aria-hidden />Mark as done</Button>}</div>
      </li>)}
    </ul>
  </div>;
}