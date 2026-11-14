import { Link } from "@tanstack/react-router";
import { CheckCircle2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoParticipant } from "./DemoParticipantContext";

export function WeeklyPracticePlan() {
  const { data, isActivityDone } = useDemoParticipant();
  const total = data.plan.reduce((count, day) => count + day.items.length, 0);
  const done = data.plan.reduce((count, day) => count + day.items.filter((item) => isActivityDone(day.day, item)).length, 0);
  return <div className="pr-12 lg:pr-0">
    <div className="flex items-center justify-between gap-3"><h2 className="font-heading text-base font-semibold text-primary">Your weekly plan</h2><span className="shrink-0 text-xs text-muted-foreground">{done} / {total} done</span></div>
    <ul className="mt-4 divide-y divide-border" aria-label="Weekly plan">
      {data.plan.map((day) => <li key={day.day} className="py-4">
        <h3 className="mb-2 font-heading text-sm font-semibold text-primary">{day.day}</h3>
        <ul className="space-y-2">{day.items.map((item, index) => {
          const complete = isActivityDone(day.day, item);
          return <li key={item.text} className="flex items-center gap-3" aria-label={`${day.day}: ${item.text}${complete ? " — Done" : ""}`}>
            <span className="min-w-0 flex-1 text-sm text-foreground">{item.text}</span>
            {complete && <span className="flex shrink-0 items-center gap-1 text-xs text-stage-active-foreground"><CheckCircle2 className="size-4" aria-hidden />Done</span>}
            <Button variant="outline" size="icon" asChild><Link to="/me/practice/$activity" params={{ activity: `${day.day.toLowerCase()}-${index}` }} aria-label={`${complete ? "Review" : "Play"} ${day.day}: ${item.text}`} title={complete ? "Review activity" : "Start activity"}><Play className="size-4" aria-hidden /></Link></Button>
          </li>;
        })}</ul>
      </li>)}
    </ul>
  </div>;
}