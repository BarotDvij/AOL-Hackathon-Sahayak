import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useDemoParticipant } from "./DemoParticipantContext";
import { completionKey } from "@/lib/sahayak/practice-plan";

export function ProgressCalendar() {
  const { data, isDayDone } = useDemoParticipant();
  const [today, setToday] = useState<Date>();
  const [selected, setSelected] = useState<Date>();
  useEffect(() => { const now = new Date(); setToday(now); setSelected(now); }, []);
  if (!today) return <div className="min-h-96" />;
  const weekday = (date: Date) => date.toLocaleDateString("en-US", { weekday: "long" });
  const thisWeek = (date: Date) => completionKey("week", date) === completionKey("week", today);
  const completed = (date: Date) => thisWeek(date) && isDayDone(weekday(date));
  const selectedPlan = selected && thisWeek(selected) ? data.plan.find((day) => day.day === weekday(selected)) : undefined;
  return <div className="space-y-4">
    <h2 className="font-heading text-base font-semibold text-primary">Your month</h2>
    <Calendar mode="single" selected={selected} onSelect={setSelected} defaultMonth={today} weekStartsOn={1}
      className="w-full bg-card p-0 [--cell-size:2rem]" classNames={{ root: "w-full", months: "relative w-full" }}
      modifiers={{ completed }} modifiersClassNames={{ completed: "rounded-md bg-stage-active text-stage-active-foreground" }} />
    <p className="flex items-center gap-2 text-xs text-stage-active-foreground"><CheckCircle2 className="size-4" aria-hidden />Completed days</p>
    {selected && <section className="border-t border-border pt-4" aria-label="Selected day">
      <h3 className="font-heading text-sm font-semibold text-primary">{selected.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</h3>
      {selectedPlan ? <><ul className="mt-2 space-y-2">{selectedPlan.items.map((item) => <li key={item.text} className="text-sm text-foreground">{item.text}</li>)}</ul><p className="mt-3 text-xs text-muted-foreground">{completed(selected) ? "Done" : "Not marked done"}</p></> : <p className="mt-2 text-sm text-muted-foreground">No saved plan for this date.</p>}
    </section>}
  </div>;
}