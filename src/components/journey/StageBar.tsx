import { useLanguage } from "@/lib/journey/i18n";
import { STAGE_CLASSES, StageDot } from "@/components/journey/bits";
import { useJourney } from "@/lib/journey/store";
import type { StageId } from "@/lib/journey/types";
import { cn } from "@/lib/utils";

/** One horizontal bar showing how many people sit in each stage; click a piece to filter the table. */
export function StageBar({ active, onChange }: { active: StageId | "all"; onChange: (s: StageId | "all") => void }) {
  const {t} = useLanguage();
  const { stageCounts } = useJourney();
  const total = stageCounts.reduce((n, s) => n + s.count, 0) || 1;
  const pick = (id: StageId) => onChange(active === id ? "all" : id);

  return (
    <section aria-label="Journey stages" className="rounded-lg border border-border bg-card p-5 shadow-soft">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-heading text-base font-semibold text-primary">{t('Journey stages')}</h2>
        {active !== "all" && (
          <button onClick={() => onChange("all")} className="text-xs font-medium text-purple hover:underline">{t('Show all')}</button>
        )}
      </div>

      <div className="stage-segments flex h-3 w-full overflow-hidden rounded-full bg-muted" role="group" aria-label="People in each stage">
        {stageCounts.map((s) => s.count === 0 ? null : (
          <button
            key={s.id}
            onClick={() => pick(s.id)}
            style={{ width: `${(s.count / total) * 100}%` }}
            aria-label={`${s.label}: ${s.count} people`}
            title={`${s.label}: ${s.count}`}
            className={cn("h-full border-r border-card transition-opacity last:border-r-0", STAGE_CLASSES[s.id], active !== "all" && active !== s.id && "opacity-35")}
          />
        ))}
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
        {stageCounts.map((s) => (
          <li key={s.id}>
            <button onClick={() => pick(s.id)} aria-pressed={active === s.id} className="flex w-full items-center gap-2 text-left">
              <StageDot stage={s.id} />
              <span className={cn("min-w-0 flex-1 truncate text-xs", active === s.id ? "font-semibold text-purple" : "text-muted-foreground")}>{t(s.label)}</span>
              <span className="text-xs font-semibold tabular-nums text-foreground">{s.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
