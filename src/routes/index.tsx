import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/journey/AppShell";
import { PriorityList } from "@/components/journey/PriorityList";
import { ProfilePanel } from "@/components/journey/ProfilePanel";
import { StageBar } from "@/components/journey/StageBar";
import { SummaryCards } from "@/components/journey/SummaryCards";
import { UpcomingList } from "@/components/journey/UpcomingList";
import { ParticipantsTable } from "@/components/journey/ParticipantsTable";
import { Button } from "@/components/ui/button";
import { useJourney } from "@/lib/journey/store";
import type { StageId } from "@/lib/journey/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Journey Companion" },
      { name: "description", content: "Who needs a caring next step today, how the stages break down, and what is waiting for your review." },
      { property: "og:title", content: "Dashboard · Journey Companion" },
      { property: "og:description", content: "Who needs a caring next step today, how the stages break down, and what is waiting for your review." },
    ],
  }),
  component: DashboardPage,
});

/** Set after mount so the server and the first client render say the same thing. */
function useGreeting() {
  const [g, setG] = useState<string | null>(null);
  useEffect(() => {
    const h = new Date().getHours();
    setG(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);
  return g ?? "Hello";
}

function DashboardPage() {
  const { views, pending } = useJourney();
  const greeting = useGreeting();
  const [stage, setStage] = useState<StageId | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const openView = views.find((v) => v.participant.id === openId) ?? null;

  return (
    <AppShell>
      <div className="space-y-4">
        <header className="brand-gradient mb-2 flex flex-wrap items-end justify-between gap-4 rounded-lg border border-border px-5 py-5">
          <div>
            <h1 className="font-display text-[32px] font-normal leading-tight text-primary">{greeting}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Here is who needs a caring next step today.</p>
          </div>
          <Button asChild size="lg"><Link to="/review">Review follow-ups ({pending.length})</Link></Button>
        </header>

        <SummaryCards />
        <StageBar active={stage} onChange={setStage} />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2"><PriorityList onOpen={setOpenId} /></div>
          <UpcomingList />
        </div>

        <ParticipantsTable stage={stage} onStage={setStage} onOpen={setOpenId} />
      </div>

      <ProfilePanel view={openView} onOpenChange={(o) => !o && setOpenId(null)} />
    </AppShell>
  );
}
