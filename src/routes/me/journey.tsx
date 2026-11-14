import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, CalendarHeart, Check, Circle, Flag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDemoParticipant } from "@/components/participant/DemoParticipantContext";
import { ParticipantCard } from "@/components/participant/ParticipantShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatFull } from "@/lib/journey/dates";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/me/journey")({
  head: () => ({ meta: [
    { title: "My journey · Sahayak" },
    { name: "description", content: "Your course milestones, journey timeline and personal quarter or year goals." },
    { property: "og:title", content: "My journey · Sahayak" },
    { property: "og:description", content: "Your course milestones, journey timeline and personal quarter or year goals." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: JourneyPage,
});

function JourneyPage() {
  const { data, saveGoal } = useDemoParticipant();
  const [period, setPeriod] = useState<"quarter" | "year">("quarter");
  const [text, setText] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    saveGoal(period, text);
    setText("");
    toast.success("Your goal is saved for this demo.");
  }

  return (
    <div className="space-y-5">
      <header><h1 className="font-display text-[32px] font-normal text-primary">My journey</h1><p className="mt-1 text-sm text-muted-foreground">Every step counts, including the quiet ones.</p></header>
      <ParticipantCard><h2 className="font-heading text-base font-semibold text-primary">Your path</h2><ol className="mt-5 space-y-0">{data.milestones.map((milestone, index) => <li key={milestone.id} className="relative flex gap-3 pb-6 last:pb-0">{index < data.milestones.length - 1 && <span className="absolute bottom-0 left-[11px] top-6 w-px bg-border" />}{milestone.state === "done" ? <Check className="relative z-10 size-6 rounded-full bg-stage-active p-1 text-stage-active-foreground" aria-hidden /> : <Circle className={cn("relative z-10 size-6 bg-card p-0.5", milestone.state === "next" ? "text-purple" : "text-border")} aria-hidden />}<div><p className="text-sm font-medium text-primary">{milestone.label}</p><p className="text-xs text-muted-foreground">{milestone.doneOn ? formatFull(milestone.doneOn) : milestone.state === "next" ? "Your next milestone, whenever it feels right" : "A later step"}</p></div></li>)}</ol></ParticipantCard>
      <ParticipantCard><h2 className="flex items-center gap-2 font-heading text-base font-semibold text-primary"><Flag className="size-4 text-purple" aria-hidden />Your goals</h2><form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row"><Select value={period} onValueChange={(value) => setPeriod(value as "quarter" | "year")}><SelectTrigger className="sm:w-36" aria-label="Goal period"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="quarter">This quarter</SelectItem><SelectItem value="year">This year</SelectItem></SelectContent></Select><Input required maxLength={500} value={text} onChange={(event) => setText(event.target.value)} placeholder="What would you like to nurture?" aria-label="Goal text" /><Button type="submit">Save goal</Button></form><ul className="mt-4 space-y-2">{data.goals.map((goal) => <li key={goal.id} className="rounded-lg bg-secondary p-3"><span className="text-xs font-medium text-purple">{goal.period === "quarter" ? "This quarter" : "This year"}</span><p className="mt-0.5 text-sm text-primary">{goal.text}</p></li>)}</ul></ParticipantCard>
      <ParticipantCard><h2 className="font-heading text-base font-semibold text-primary">Journey so far</h2><ol className="mt-4 space-y-4 border-l border-border pl-5">{data.timeline.map((item, index) => <li key={`${item.date}-${index}`} className="relative"><span className="absolute -left-[27px] top-0.5 size-3 rounded-full bg-secondary ring-2 ring-card" /><p className="flex items-center gap-2 text-sm text-primary">{item.kind === "course" ? <BookOpen className="size-4 text-purple" aria-hidden /> : <CalendarHeart className="size-4 text-purple" aria-hidden />}{item.text}</p><p className="ml-6 text-xs text-muted-foreground">{formatFull(item.date)}</p></li>)}</ol></ParticipantCard>
    </div>
  );
}
