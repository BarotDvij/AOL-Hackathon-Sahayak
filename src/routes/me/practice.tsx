import { createFileRoute } from "@tanstack/react-router";
import { WeeklyPracticePlan } from "@/components/participant/WeeklyPracticePlan";
export const Route = createFileRoute("/me/practice")({
  head: () => ({ meta: [
    { title: "Practice · Journey Companion" },
    { name: "description", content: "Your weekly activities and gentle guided reminders, with completion tracking." },
    { property: "og:title", content: "Practice · Journey Companion" },
    { property: "og:description", content: "Follow your weekly plan and record completed activities." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: PracticePage,
});
function PracticePage() {
  return <div className="space-y-6"><header><h1 className="font-display text-[32px] font-normal text-primary">Practice</h1><p className="mt-1 text-sm text-muted-foreground">A little time for your practice, one day at a time.</p></header><div className="max-w-3xl"><WeeklyPracticePlan /></div></div>;
}