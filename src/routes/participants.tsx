import { useLanguage } from "@/lib/journey/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/journey/AppShell";
import { ParticipantsTable } from "@/components/journey/ParticipantsTable";
import { ProfilePanel } from "@/components/journey/ProfilePanel";
import { STAGES } from "@/lib/journey/config";
import { useJourney } from "@/lib/journey/store";
import type { StageId } from "@/lib/journey/types";

export const Route = createFileRoute("/participants")({
  validateSearch: (search: Record<string, unknown>): { stage?: string } =>
    typeof search.stage === "string" ? { stage: search.stage } : {},
  head: () => ({
    meta: [
      { title: "Participants · Journey" },
      { name: "description", content: "Everyone in your centre with their stage, last contact and suggested next step." },
      { property: "og:title", content: "Participants · Journey" },
      { property: "og:description", content: "Everyone in your centre with their stage, last contact and suggested next step." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ParticipantsPage,
});

function ParticipantsPage() {
  const {t} = useLanguage();
  const { views } = useJourney();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const stage: StageId | "all" = STAGES.find((s) => s.id === search.stage)?.id ?? "all";
  const setStage = (next: StageId | "all") => { void navigate({ search: (prev) => ({ ...prev, stage: next }), replace: true }); };
  const [openId, setOpenId] = useState<string | null>(null);
  const openView = views.find((v) => v.participant.id === openId) ?? null;

  return (
    <AppShell>
      <div className="space-y-4">
        <header className="mb-2">
          <h1 className="font-display text-[32px] font-normal text-primary">{t('Participants')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Everyone in your centre, with their stage and next step.</p>
        </header>

        <ParticipantsTable stage={stage} onStage={setStage} onOpen={setOpenId} title="All participants" stageChips />
      </div>

      <ProfilePanel view={openView} onOpenChange={(o) => !o && setOpenId(null)} />
    </AppShell>
  );
}
