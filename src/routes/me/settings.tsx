import { createFileRoute } from "@tanstack/react-router";
import { useDemoParticipant } from "@/components/participant/DemoParticipantContext";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { ConnectMuseCard } from "@/components/participant/ConnectMuseCard";
import { OnboardingForm } from "@/components/participant/OnboardingForm";
import { ParticipantCard } from "@/components/participant/ParticipantShell";

export const Route = createFileRoute("/me/settings")({
  head: () => ({ meta: [
    { title: "My settings · Sahayak" },
    { name: "description", content: "Complete the no-login demo onboarding and review your suggested practice rhythm." },
    { property: "og:title", content: "My settings · Sahayak" },
    { property: "og:description", content: "Complete the no-login demo onboarding and review your suggested practice rhythm." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: ParticipantSettings,
});

function ParticipantSettings() {
  const { data, saveAnswers } = useDemoParticipant();
  const [sahayakOn, setSahayakOn] = useState(false);
  return (
    <div className="space-y-5"><header><h1 className="font-display text-[32px] font-normal text-primary">Settings</h1><p className="mt-1 text-sm text-muted-foreground">Shape the sample practice journey in your own words.</p></header>
      <ParticipantCard><h2 className="font-heading text-base font-semibold text-primary">No-login demo</h2><p className="mt-1 text-sm text-muted-foreground">You are using Priya's fictional profile. Changes stay in this tab and reset when you reload. </p></ParticipantCard>
      <ParticipantCard><div className="flex items-start justify-between gap-4"><div><h2 className="font-heading text-base font-semibold text-primary">Use Sahayak with Muse</h2><p className="mt-1 text-sm text-muted-foreground">Optional and off by default. Turn it on only if you'd like your Muse assistant to help with your practice. Everything here works without it.</p></div><Switch aria-label="Use Sahayak with Muse" checked={sahayakOn} onCheckedChange={setSahayakOn} /></div></ParticipantCard>
      {sahayakOn && <ConnectMuseCard />}
      <ParticipantCard><h2 className="font-heading text-base font-semibold text-primary">A little about you</h2><p className="mb-5 mt-1 text-sm text-muted-foreground">Six gentle questions. Skip any of them, review your answers, then confirm before saving.</p><OnboardingForm initialAnswers={data.answers} onSave={saveAnswers} /></ParticipantCard>
      <ParticipantCard><h2 className="font-heading text-base font-semibold text-primary">Your current rhythm</h2><p className="mt-2 text-sm text-primary">{data.schedule.days.join(", ")} · {data.schedule.time} · {data.schedule.minutes} minutes</p>{data.schedule.reminders.length > 0 && <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{data.schedule.reminders.map((reminder) => <li key={reminder}>{reminder}</li>)}</ul>}<p className="mt-2 text-sm text-muted-foreground">{data.schedule.note} {data.schedule.safetyNote}</p></ParticipantCard>
    </div>
  );
}
