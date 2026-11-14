import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/journey/AppShell";
import { JOURNEY_CONFIG as C, STAGES, stageLabel } from "@/lib/journey/config";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Journey Companion" },
      { name: "description", content: "How Journey Companion decides who needs a follow-up, and what it never does on its own." },
      { property: "og:title", content: "Settings · Journey Companion" },
      { property: "og:description", content: "How Journey Companion decides who needs a follow-up, and what it never does on its own." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

const RULES: Record<string, string> = {
  new: `Finished ${C.skyCourseName} in the last ${C.newAfterSkyDays} days.`,
  building: `Finished it within ${C.buildingMaxDays} days and came to at least ${C.buildingMinFollowUps} follow-up since.`,
  active: `Came to ${C.activeMinEvents} things in the last ${C.activeWindowDays} days, or finished a course in the last ${C.activeRecentCourseDays} days.`,
  serving: `Has a seva role, or helped out in the last ${C.servingVolunteerDays} days.`,
  quiet: `No event for ${C.quietMinDays} to ${C.quietMaxDays} days.`,
  dormant: `No event or reply for ${C.dormantDays}+ days.`,
  paused: `We wrote to them in the last ${C.pausedRecentContactDays} days, or they asked not to be contacted.`,
};

function SettingsPage() {
  return (
    <AppShell>
      <div className="max-w-3xl space-y-4">
        <header className="mb-2">
          <h1 className="font-display text-[32px] font-normal text-primary">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">How the app decides who needs a follow-up. Read-only in this version.</p>
        </header>

        <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
          <h2 className="font-heading text-base font-semibold text-primary">Journey stages</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Everyone is placed in the first stage that fits, checked in this order.</p>
          <dl className="mt-4 divide-y divide-border">
            {STAGES.map((s) => (
              <div key={s.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-2.5">
                <dt className="w-40 shrink-0 text-sm font-medium text-foreground">{stageLabel(s.id)}</dt>
                <dd className="min-w-0 flex-1 text-sm text-muted-foreground">{RULES[s.id]}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
          <h2 className="font-heading text-base font-semibold text-primary">Sahayak</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Sahayak means helper. It keeps track of follow-ups so no one slips through the cracks.
          </p>
          <Link to="/sahayak" className="mt-2 inline-block text-sm font-medium text-purple hover:underline">
            Sahayak settings
          </Link>
        </section>

        <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
          <h2 className="font-heading text-base font-semibold text-primary">This centre</h2>
          <dl className="mt-3 divide-y divide-border">
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-sm font-medium text-foreground">Coordinator</dt>
              <dd className="text-sm text-muted-foreground">{C.coordinatorName}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-sm font-medium text-foreground">Data</dt>
              <dd className="text-sm text-muted-foreground">Sample participants and a sample calendar</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-sm font-medium text-foreground">Sending</dt>
              <dd className="text-sm text-muted-foreground">Nothing is sent automatically — every message needs your approval</dd>
            </div>
          </dl>
        </section>
      </div>
    </AppShell>
  );
}
