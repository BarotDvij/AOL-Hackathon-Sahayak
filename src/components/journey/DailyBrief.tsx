import { useLanguage } from "@/lib/journey/i18n";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {messageOutcome} from "@/lib/journey/operations";
import { useJourney } from "@/lib/journey/store";
import { SahayakLink, SahayakTag, useGreeting } from "./bits";

/**
 * The morning note at the top of the dashboard. Only ever shown while Sahayak is on,
 * and it goes away for the day the moment the coordinator dismisses it.
 */
export function DailyBrief() {
  const {t} = useLanguage();
  const { sahayak, brief, dismissBrief, sentMessages, views, secondFollowUp } = useJourney();
  const greeting = useGreeting();

  if (!sahayak.on || brief.length === 0) return null;

  return (
    <section aria-label="Sahayak daily brief" className="brand-gradient rounded-lg border border-border p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-[22px] font-normal leading-tight text-primary">
            {greeting}, here is what Sahayak found today
          </h2>
          <SahayakTag className="mt-1" />
        </div>
        <Button size="sm" variant="ghost" onClick={dismissBrief} className="shrink-0">
          <X className="size-3.5" aria-hidden />Dismiss for today
        </Button>
      </div>

      <ul className="mt-3 space-y-2">
        {brief.map((b) => (
          <li key={b.id} className="rounded-lg bg-card/75 px-3 py-2.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="min-w-0 flex-1 text-sm text-foreground">{b.text}</p>
              <SahayakLink to={b.to} className="shrink-0 text-xs font-semibold text-purple hover:underline">
                {b.actionLabel}
              </SahayakLink>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{b.why}</p>
          </li>
        ))}
      </ul>
      {sentMessages.filter(m=>messageOutcome(m)==="No response after 14 days" && !views.find(v=>v.participant.id===m.participantId)?.participant.doNotContact).slice(0,2).map(m=><div key={m.id} className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-sm"><p>{views.find(v=>v.participant.id===m.participantId)?.participant.firstName}: {t("No reply after 14 days")}</p><Button size="sm" variant="accent" onClick={()=>secondFollowUp(m.id)}>{t("Draft gentle second follow-up")}</Button></div>)}
    </section>
  );
}
