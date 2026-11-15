import type { ReactNode } from "react";
import { Flag } from "lucide-react";
import { useDemoParticipant } from "./DemoParticipantContext";
import { ParticipantCard } from "./ParticipantShell";
import { answerLabel } from "@/lib/sahayak/core";

export function GoalsOverview({ action }: { action?: ReactNode }) {
  const { data } = useDemoParticipant();
  const groups = [
    { period: "week", label: "Weekly", intake: undefined },
    { period: "month", label: "Monthly", intake: answerLabel("goal_month", data.answers.goal_month) },
    { period: "year", label: "Annual", intake: answerLabel("goal_year", data.answers.goal_year) },
  ];
  return <ParticipantCard>
    <div className="flex items-center gap-2"><h2 className="flex items-center gap-2 font-heading text-base font-semibold text-primary"><Flag className="size-4 text-purple" aria-hidden />Goals by timeframe</h2>{action && <div className="ml-auto">{action}</div>}</div>
    <div className="mt-4 divide-y divide-border">{groups.map((group) => {
      const goals = [...(group.intake ? [group.intake] : []), ...data.goals.filter((goal) => goal.period === group.period).map((goal) => goal.text)];
      return <section key={group.period} className="py-4 first:pt-0" aria-label={`${group.label} goals`}>
        <h3 className="font-heading text-sm font-semibold text-purple">{group.label}</h3>
        {goals.length ? <ul className="mt-2 space-y-2">{goals.map((goal, index) => <li key={index} className="break-words text-sm text-primary">{goal}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No {group.label.toLowerCase()} goals yet.</p>}
      </section>;
    })}</div>
  </ParticipantCard>;
}