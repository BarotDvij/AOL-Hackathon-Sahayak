import { createFileRoute } from "@tanstack/react-router";
import { useDemoParticipant } from "@/components/participant/DemoParticipantContext";
import { Switch } from "@/components/ui/switch";
import { ConnectMuseCard } from "@/components/participant/ConnectMuseCard";
import { SAHAYAK_ACCESS } from "@/components/participant/SahayakConsentDialog";
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
  const { data, saveAnswers, sahayakOn, sahayakAccess, requestSahayak, openSahayakConsent } = useDemoParticipant();
  return (
    <div className="space-y-5"><header><h1 className="font-display text-[32px] font-normal text-primary">Settings</h1><p className="mt-1 text-sm text-muted-foreground">Shape the sample practice journey in your own words.</p></header>
      <ParticipantCard><h2 className="font-heading text-base font-semibold text-primary">No-login demo</h2><p className="mt-1 text-sm text-muted-foreground">You are using Priya's fictional profile. Changes stay in this tab and reset when you reload. </p></ParticipantCard>
      <ParticipantCard>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-base font-semibold text-primary">Use Sahayak with Muse</h2>
            <p className="mt-1 text-sm text-muted-foreground">Your Sahayak lives in your Muse and can help with your practice, but only with what you tick. Optional and off by default — everything here works without it.</p>
          </div>
          <Switch aria-label="Use Sahayak with Muse" checked={sahayakOn} onCheckedChange={requestSahayak} />
        </div>
        {sahayakOn && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="font-heading text-xs font-semibold text-purple">What Muse may use right now</p>
            <ul className="mt-2 space-y-1">
              {sahayakAccess.map((id) => (
                <li key={id} className="text-sm text-primary">{SAHAYAK_ACCESS.find((item) => item.id === id)?.label}</li>
              ))}
            </ul>
            <button type="button" onClick={openSahayakConsent} className="mt-2 text-xs font-medium text-purple hover:underline">Change what Muse may use</button>
          </div>
        )}
      </ParticipantCard>
      {sahayakOn && <ConnectMuseCard />}
      <ParticipantCard><h2 className="font-heading text-base font-semibold text-primary">A little about you</h2><p className="mb-5 mt-1 text-sm text-muted-foreground">Where you are, your practice and your goals. Skip any of them, review your answers, then confirm before saving.</p><OnboardingForm initialAnswers={data.answers} onSave={saveAnswers} /></ParticipantCard>
      <ParticipantCard><h2 className="font-heading text-base font-semibold text-primary">Your current rhythm</h2><p className="mt-2 text-sm text-primary">{data.schedule.days.join(", ")} · {data.schedule.time} · {data.schedule.minutes} minutes</p>{data.schedule.reminders.length > 0 && <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{data.schedule.reminders.map((reminder) => <li key={reminder}>{reminder}</li>)}</ul>}<p className="mt-2 text-sm text-muted-foreground">{data.schedule.note} {data.schedule.safetyNote}</p></ParticipantCard>
    </div>
  );
}
