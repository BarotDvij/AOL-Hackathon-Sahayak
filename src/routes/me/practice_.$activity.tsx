import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useDemoParticipant } from "@/components/participant/DemoParticipantContext";
import { Button } from "@/components/ui/button";
import { activityGuide, planActivities } from "@/lib/sahayak/practice-plan";

export const Route = createFileRoute("/me/practice_/$activity")({
  head: () => ({ meta: [
    { title: "Guided activity · Journey Companion" },
    { name: "description", content: "Prepare for your activity, follow safe reminders and mark it done." },
    { property: "og:title", content: "Guided activity · Journey Companion" },
    { property: "og:description", content: "A gentle step-by-step companion for your weekly activity." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: ActivityPage,
});
function ActivityPage() {
  const { activity } = Route.useParams();
  return <ActivityGuide key={activity} id={activity} />;
}
function ActivityGuide({ id }: { id: string }) {
  const { data, isActivityDone, completeActivity } = useDemoParticipant();
  const activity = planActivities(data.plan).find((entry) => entry.id === id);
  const [step, setStep] = useState(0);
  if (!activity) return <div className="space-y-4"><h1 className="font-display text-[32px] text-primary">Activity unavailable</h1><Button asChild><Link to="/me/practice">Back to Practice</Link></Button></div>;
  const instructions = activityGuide(activity.item);
  const complete = isActivityDone(activity.day, activity.item);
  return <div className="max-w-3xl space-y-6">
    <Button variant="ghost" asChild><Link to="/me/practice"><ArrowLeft className="size-4" aria-hidden />Practice</Link></Button>
    <header><p className="font-heading text-sm font-semibold text-purple">{activity.day}</p><h1 className="mt-2 font-display text-[32px] font-normal text-primary">{activity.item.text}</h1></header>
    <div className="space-y-5 border-y border-border py-6" aria-live="polite">
      <p className="text-xs text-muted-foreground">Step {step + 1} of {instructions.length}</p>
      <p className="min-h-28 text-base leading-relaxed text-foreground">{instructions[step]}</p>
      <div className="flex flex-wrap justify-between gap-3">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep((current) => current - 1)}><ArrowLeft className="size-4" aria-hidden />Back</Button>
        {step < instructions.length - 1 ? <Button onClick={() => setStep((current) => current + 1)}>Next<ArrowRight className="size-4" aria-hidden /></Button> : <Button disabled={complete} onClick={() => completeActivity(id)}><CheckCircle2 className="size-4" aria-hidden />{complete ? "Done" : "Mark as done"}</Button>}
      </div>
    </div>
    {complete && <div className="space-y-3"><p className="flex items-center gap-2 text-sm text-stage-active-foreground"><CheckCircle2 className="size-5" aria-hidden />Completed — your weekly plan is updated.</p><Button variant="outline" asChild><Link to="/me/journey">My journey</Link></Button></div>}
  </div>;
}