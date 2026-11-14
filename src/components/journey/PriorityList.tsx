import { useLanguage } from "@/lib/journey/i18n";
import { Button } from "@/components/ui/button";
import { Initials, StageBadge } from "@/components/journey/bits";
import { contactText, useJourney } from "@/lib/journey/store";

/** The first five people to reach out to, drifting people first. */
export function PriorityList({ onOpen }: { onOpen: (id: string) => void }) {
  const {t} = useLanguage();
  const { priority } = useJourney();

  return (
    <section aria-label="Priority follow-ups" className="flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-soft">
      <h2 className="font-heading text-base font-semibold text-primary">{t('Priority follow-ups')}</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{t('The first five people to reach out to.')}</p>
      {priority.length === 0 ? (
        <p className="mt-4 rounded-lg bg-muted p-4 text-sm text-muted-foreground">{t('No one needs a follow-up right now.')}</p>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {priority.map((v) => (
            <li key={v.participant.id} className="flex h-14 items-center gap-3">
              <Initials name={`${v.participant.firstName} ${v.participant.lastName}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">{v.participant.firstName} {v.participant.lastName}</span>
                <span className="block truncate text-xs text-muted-foreground">{contactText(v.history)}</span>
              </span>
              <StageBadge stage={v.stage} />
              <Button size="sm" variant="accent" onClick={() => onOpen(v.participant.id)}>{t('Review')}</Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
