import { createFileRoute } from "@tanstack/react-router";
import { WeeklyPracticePlan } from "@/components/participant/WeeklyPracticePlan";
import { ParticipantCard } from "@/components/participant/ParticipantShell";
import { ProgressCalendar } from "@/components/participant/ProgressCalendar";

export const Route = createFileRoute("/me/weekly-progress")({
  head: () => ({ meta: [
    { title: "My Progress · Journey" },
    { name: "description", content: "Your monthly calendar, personal weekly plan and completed days." },
    { property: "og:title", content: "My Progress · Journey" },
    { property: "og:description", content: "See your month, review your weekly plan and mark each day done." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: WeeklyProgressPage,
});

function WeeklyProgressPage() {
  return <div className="space-y-5"><header><h1 className="font-display text-[32px] font-normal text-primary">My Progress</h1></header><div className="grid items-start gap-5 lg:grid-cols-2"><ParticipantCard><ProgressCalendar /></ParticipantCard><ParticipantCard><WeeklyPracticePlan /></ParticipantCard></div></div>;
}