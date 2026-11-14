import { Inbox, Send, UserPlus, Users } from "lucide-react";
import { useJourney } from "@/lib/journey/store";

/** Four equal cards: a small icon, a large number, a label and the small line under it. */
export function SummaryCards() {
  const { summary } = useJourney();
  const items = [
    { label: "Total participants", value: summary.total, note: summary.totalNote, Icon: Users },
    { label: "Need follow-up this week", value: summary.needFollowUp, note: summary.needTrend, Icon: UserPlus },
    { label: "Waiting for review", value: summary.waiting, note: summary.waitingNote, Icon: Inbox },
    { label: "Messages sent this week", value: summary.sentThisWeek, note: summary.sentTrend, Icon: Send },
  ];
  return (
    <section aria-label="At a glance" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((it) => {
        const positive = it.note.trim().startsWith("+");
        return (
          <div key={it.label} className="flex h-full flex-col rounded-lg border border-border bg-card p-4 shadow-soft">
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <it.Icon className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{it.label}</span>
            </span>
            <span className="mt-2 font-heading text-[28px] font-semibold leading-none tabular-nums text-primary">{it.value}</span>
            {positive ? (
              <span className="mt-auto inline-flex w-fit items-center rounded-full bg-sun-yellow px-2 py-0.5 text-xs font-semibold text-primary">{it.note}</span>
            ) : (
              <span className="mt-auto pt-2 text-xs text-muted-foreground">{it.note}</span>
            )}
          </div>
        );
      })}
    </section>
  );
}
