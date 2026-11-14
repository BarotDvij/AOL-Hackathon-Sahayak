import { createFileRoute } from "@tanstack/react-router";
import { WeeklyPracticePlan } from "@/components/participant/WeeklyPracticePlan";
import { ParticipantCard } from "@/components/participant/ParticipantShell";

export const Route = createFileRoute("/me/weekly-progress")({
  head: () => ({ meta: [
    { title: "Weekly progress · Journey Companion" },
    { name: "description", content: "Your personal weekly plan and completed days." },
    { property: "og:title", content: "Weekly progress · Journey Companion" },
    { property: "og:description", content: "Review your weekly plan and mark each day done." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: WeeklyProgressPage,
});

function WeeklyProgressPage() {
  return <div className="space-y-5"><header><h1 className="font-display text-[32px] font-normal text-primary">Weekly progress</h1></header><ParticipantCard className="max-w-3xl"><WeeklyPracticePlan /></ParticipantCard></div>;
}