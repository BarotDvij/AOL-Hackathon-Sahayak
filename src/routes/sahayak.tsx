import { useLanguage } from "@/lib/journey/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/journey/AppShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  FEATURE_HELP,
  FEATURE_LABEL,
  NUDGE_HELP,
  NUDGE_LABEL,
  type Nudge,
  type SahayakFeature,
} from "@/lib/journey/sahayak";
import { useJourney } from "@/lib/journey/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sahayak")({
  head: () => ({
    meta: [
      { title: "Sahayak settings · Journey" },
      { name: "description", content: "Turn Sahayak on or off, choose what it keeps an eye on, and decide how often it nudges you." },
      { property: "og:title", content: "Sahayak settings · Journey" },
      { property: "og:description", content: "Turn Sahayak on or off, choose what it keeps an eye on, and decide how often it nudges you." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SahayakSettingsPage,
});

const FEATURES: SahayakFeature[] = ["dailyBrief", "replyReminders", "followUpReminders", "autoDraft"];
const NUDGES: Nudge[] = ["gentle", "normal", "frequent"];

function SahayakSettingsPage() {
  const {t} = useLanguage();
  const { sahayak, setSahayakOn, setSahayakFeature, setNudge, resetSahayakDemo } = useJourney();

  return (
    <AppShell>
      <div className="max-w-3xl space-y-4">
        <header className="mb-2">
          <h1 className="font-display text-[32px] font-normal text-primary">{t('Sahayak settings')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sahayak means helper. It keeps track of follow-ups so no one slips through the cracks.
          </p>
        </header>

        <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <Sparkles className={cn("size-5 shrink-0", sahayak.on ? "text-purple" : "text-muted-foreground")} aria-hidden />
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-base font-semibold text-primary">{t('Sahayak')}</h2>
              <p className="text-xs text-muted-foreground">
                {sahayak.on ? "On — it suggests, reminds and drafts. You approve everything." : "Off — the dashboard works in manual mode, exactly as before."}
              </p>
            </div>
            <Switch checked={sahayak.on} onCheckedChange={setSahayakOn} aria-label="Turn Sahayak on or off" />
          </div>
        </section>

        <section className={cn("rounded-lg border border-border bg-card p-5 shadow-soft", !sahayak.on && "opacity-60")}>
          <h2 className="font-heading text-base font-semibold text-primary">{t('What Sahayak keeps an eye on')}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {sahayak.on ? "Turn any of these off and that part simply disappears." : "Turn Sahayak on above to change these."}
          </p>
          <ul className="mt-3 divide-y divide-border">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{FEATURE_LABEL[f]}</p>
                  <p className="text-xs text-muted-foreground">{FEATURE_HELP[f]}</p>
                </div>
                <Switch
                  checked={sahayak.features[f]}
                  disabled={!sahayak.on}
                  onCheckedChange={(on) => setSahayakFeature(f, on)}
                  aria-label={`${FEATURE_LABEL[f]} on or off`}
                />
              </li>
            ))}
          </ul>
        </section>

        <section className={cn("rounded-lg border border-border bg-card p-5 shadow-soft", !sahayak.on && "opacity-60")}>
          <h2 className="font-heading text-base font-semibold text-primary">{t('Nudge frequency')}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{t('How much Sahayak brings to you at once.')}</p>
          <div role="group" aria-label="Nudge frequency" className="mt-3 inline-flex rounded-lg border border-border bg-secondary/50 p-1">
            {NUDGES.map((n) => (
              <button
                key={n}
                type="button"
                disabled={!sahayak.on}
                onClick={() => setNudge(n)}
                aria-pressed={sahayak.nudge === n}
                className={cn(
                  "rounded-md px-4 py-1.5 text-sm transition-colors disabled:cursor-not-allowed",
                  sahayak.nudge === n ? "bg-card font-semibold text-purple shadow-soft" : "font-medium text-muted-foreground hover:text-foreground",
                )}
              >
                {NUDGE_LABEL[n]}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{NUDGE_HELP[sahayak.nudge]}</p>
        </section>

        <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
          <h2 className="font-heading text-base font-semibold text-primary">{t('Demo')}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Shows the first-time question again, so you can see both ways of working.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={resetSahayakDemo}>{t('Reset demo')}</Button>
        </section>
      </div>
    </AppShell>
  );
}
