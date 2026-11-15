import { useLanguage } from "@/lib/journey/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/journey/AppShell";
import { DailyBrief } from "@/components/journey/DailyBrief";
import { GroupAttentionList } from "@/components/journey/GroupAttentionList";
import { ProfilePanel } from "@/components/journey/ProfilePanel";
import { StageBar } from "@/components/journey/StageBar";
import { SummaryCards } from "@/components/journey/SummaryCards";
import { UpcomingList } from "@/components/journey/UpcomingList";
import { ParticipantsTable } from "@/components/journey/ParticipantsTable";
import { useGreeting } from "@/components/journey/bits";
import { Button } from "@/components/ui/button";
import { JOURNEY_CONFIG } from "@/lib/journey/config";
import { useJourney } from "@/lib/journey/store";
import type { StageId } from "@/lib/journey/types";
import { useDemoSession } from '@/lib/journey/demo-session';
import { VOLUNTEERS } from '@/lib/journey/operations';

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Journey" },
      { name: "description", content: "Who needs a caring next step today, how the stages break down, and what is waiting for your review." },
      { property: "og:title", content: "Dashboard · Journey" },
      { property: "og:description", content: "Who needs a caring next step today, how the stages break down, and what is waiting for your review." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

/** Set after mount so the server and the first client render say the same thing. */
function DashboardPage() {
  const {t} = useLanguage();
  const { views, pending } = useJourney();
  const session=useDemoSession();
  const displayName=session?.role==='volunteer'?VOLUNTEERS.find(v=>v.id===session.volunteerId)?.name ?? 'Volunteer':JOURNEY_CONFIG.coordinatorName;
  const greeting = useGreeting();
  const [stage, setStage] = useState<StageId | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const openView = views.find((v) => v.participant.id === openId) ?? null;

  return (
    <AppShell>
      <div className="space-y-4">
        <header className="brand-gradient mb-2 flex flex-wrap items-end justify-between gap-4 rounded-lg border border-border px-5 py-5">
          <div>
            <h1 className="font-display text-[32px] font-normal leading-tight text-primary">{t(greeting)}, {displayName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('Here is who needs a caring next step today.')}</p>
          </div>
          <Button asChild size="lg"><Link to="/review">Review follow-ups ({pending.length})</Link></Button>
        </header>

        <DailyBrief />

        <SummaryCards />
        <StageBar active={stage} onChange={setStage} />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2"><GroupAttentionList /></div>
          <UpcomingList />
        </div>

        <ParticipantsTable stage={stage} onStage={setStage} onOpen={setOpenId} />
      </div>

      <ProfilePanel view={openView} onOpenChange={(o) => !o && setOpenId(null)} />
    </AppShell>
  );
}
