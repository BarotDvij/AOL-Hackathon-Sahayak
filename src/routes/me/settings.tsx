import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { ConnectMuseCard } from "@/components/participant/ConnectMuseCard";
import { OnboardingForm } from "@/components/participant/OnboardingForm";
import { ParticipantCard } from "@/components/participant/ParticipantShell";

const parent = getRouteApi("/_authenticated/me");

export const Route = createFileRoute("/me/settings")({
  head: () => ({ meta: [
    { title: "My settings · Sahayak" },
    { name: "description", content: "Complete participant onboarding, review your practice rhythm and optionally connect Muse with OAuth." },
    { property: "og:title", content: "My settings · Sahayak" },
    { property: "og:description", content: "Complete participant onboarding, review your practice rhythm and optionally connect Muse with OAuth." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: ParticipantSettings,
});

function ParticipantSettings() {
  const data = parent.useLoaderData();
  if (!data.linked) return null;
  return (
    <div className="space-y-5"><header><h1 className="font-display text-[32px] font-normal text-primary">Settings</h1><p className="mt-1 text-sm text-muted-foreground">Shape your practice in your own words. Muse is entirely optional.</p></header>
      <ParticipantCard><h2 className="font-heading text-base font-semibold text-primary">A little about you</h2><p className="mb-5 mt-1 text-sm text-muted-foreground">Six gentle questions. Skip any of them, review your answers, then confirm before saving.</p><OnboardingForm initialAnswers={data.answers} /></ParticipantCard>
      <ParticipantCard><h2 className="font-heading text-base font-semibold text-primary">Your current rhythm</h2><p className="mt-2 text-sm text-primary">{data.schedule.days.join(", ")} · {data.schedule.time} · {data.schedule.minutes} minutes</p><p className="mt-1 text-sm text-muted-foreground">{data.schedule.note}</p></ParticipantCard>
      <ConnectMuseCard />
    </div>
  );
}
