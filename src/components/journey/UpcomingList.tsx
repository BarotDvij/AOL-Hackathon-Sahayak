import { formatShort } from "@/lib/journey/dates";
import { useJourney } from "@/lib/journey/store";

/** The next events and courses in date order, with how many people each one is suggested for. */
export function UpcomingList() {
  const { upcoming } = useJourney();

  return (
    <section aria-label="Upcoming opportunities" className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-soft">
      <h2 className="text-base font-semibold text-foreground">Upcoming opportunities</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">What is coming up, and who it fits.</p>
      {upcoming.length === 0 ? (
        <p className="mt-4 rounded-lg bg-muted p-4 text-sm text-muted-foreground">Nothing is on the calendar yet.</p>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {upcoming.map(({ step, suggestedFor }) => (
            <li key={step.id} className="flex h-14 items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-[11px] font-semibold text-primary-strong">
                {step.startDate ? formatShort(step.startDate) : "—"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">{step.shortTitle}</span>
                <span className="block truncate text-xs text-muted-foreground">{step.city} · {suggestedFor === 0 ? "no one suggested yet" : `${suggestedFor} suggested`}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
