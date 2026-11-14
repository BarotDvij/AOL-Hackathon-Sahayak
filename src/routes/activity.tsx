import { useLanguage } from "@/lib/journey/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, History, MessageCircleReply, Pencil, X } from "lucide-react";
import { AppShell } from "@/components/journey/AppShell";
import { Button } from "@/components/ui/button";
import { useJourney } from "@/lib/journey/store";
import type { ActivityEntry } from "@/lib/journey/types";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity log · Journey Companion" },
      { name: "description", content: "A simple history of the follow-ups you approved, edited or skipped, and when." },
      { property: "og:title", content: "Activity log · Journey Companion" },
      { property: "og:description", content: "A simple history of the follow-ups you approved, edited or skipped, and when." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ActivityPage,
});

const KIND: Record<ActivityEntry["kind"], { label: string; Icon: typeof Check; className: string }> = {
  attended: { label: "Attended", Icon: Check, className: "bg-stage-new text-stage-new-foreground" },
  approved: { label: "Approved", Icon: Check, className: "bg-sun-yellow text-primary" },
  edited: { label: "Edited", Icon: Pencil, className: "bg-secondary text-primary" },
  skipped: { label: "Skipped", Icon: X, className: "bg-muted text-muted-foreground" },
  replied: { label: "Replied", Icon: MessageCircleReply, className: "bg-stage-active text-stage-active-foreground" },
};

function when(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("en-CA", { weekday: "long", month: "short", day: "numeric" }),
    time: d.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" }),
  };
}

function ActivityPage() {
  const {t} = useLanguage();
  const { activity } = useJourney();

  if (activity.length === 0) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-soft">
          <History className="mx-auto size-6 text-muted-foreground" aria-hidden />
          <h1 className="mt-3 font-display text-[32px] font-normal text-primary">{t('Nothing reviewed yet')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">As soon as you approve, edit or skip a message, it shows up here with the time.</p>
          <Button asChild className="mt-5"><Link to="/review">{t('Go to review queue')}</Link></Button>
        </div>
      </AppShell>
    );
  }

  const days = activity.reduce<Record<string, ActivityEntry[]>>((acc, e) => {
    const key = when(e.at).day;
    (acc[key] ??= []).push(e);
    return acc;
  }, {});

  return (
    <AppShell>
      <header className="mb-5">
        <h1 className="font-display text-[32px] font-normal text-primary">{t('Activity')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">What you approved, edited or skipped, and when.</p>
      </header>
      <div className="space-y-6">
        {Object.entries(days).map(([day, entries]) => (
          <section key={day} aria-label={day}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{day}</h2>
            <ul className="space-y-2">
              {entries.map((e) => {
                const k = KIND[e.kind];
                return (
                  <li key={e.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3.5 shadow-soft">
                    <span className={`grid size-7 shrink-0 place-items-center rounded-full ${k.className}`}><k.Icon className="size-4" aria-hidden /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm">{e.detail}</span>
                      <span className="block text-xs text-muted-foreground">{when(e.at).time}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
