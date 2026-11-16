import { useLanguage } from "@/lib/journey/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/journey/AppShell";
import { ParticipantsTable } from "@/components/journey/ParticipantsTable";
import { ProfilePanel } from "@/components/journey/ProfilePanel";
import { StageBar } from "@/components/journey/StageBar";
import { useJourney } from "@/lib/journey/store";
import type { StageId } from "@/lib/journey/types";
import { useDemoSession } from '@/lib/journey/demo-session';

export const Route = createFileRoute("/participants")({
  head: () => ({
    meta: [
      { title: "Participants · Sahayak" },
      { name: "description", content: "Everyone in your centre with their stage, last contact and suggested next step." },
      { property: "og:title", content: "Participants · Sahayak" },
      { property: "og:description", content: "Everyone in your centre with their stage, last contact and suggested next step." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ParticipantsPage,
});

function ParticipantsPage() {
  const volunteer=useDemoSession()?.role==='volunteer';
  const {t} = useLanguage();
  const { views } = useJourney();
  const [stage, setStage] = useState<StageId | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const openView = views.find((v) => v.participant.id === openId) ?? null;

  return (
    <AppShell>
      <div className="space-y-4">
        <header className="mb-2">
          <h1 className="font-display text-[32px] font-normal text-primary">{t(volunteer?'My People':'Participants')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{volunteer?'The people you know, with their stage and next step.':'Everyone in your centre, with their stage and next step.'}</p>
        </header>

        <StageBar active={stage} onChange={setStage} />
        <ParticipantsTable stage={stage} onStage={setStage} onOpen={setOpenId} title={volunteer?'My people':'All participants'} />
      </div>

      <ProfilePanel view={openView} onOpenChange={(o) => !o && setOpenId(null)} />
    </AppShell>
  );
}
