import { useLanguage } from '@/lib/journey/i18n';
import { messageOutcome, type SentRecord, VOLUNTEERS } from '@/lib/journey/operations';
import { Initials } from './bits';
export function OutcomeBadge({message}: {message: SentRecord}) {
  const {t} = useLanguage(); const outcome = messageOutcome(message);
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${outcome === 'Attended' ? 'bg-stage-new text-stage-new-foreground' : outcome === 'No response after 14 days' ? 'bg-stage-quiet text-stage-quiet-foreground' : 'bg-secondary text-primary'}`}>{t(outcome)}</span>;
}
export function VolunteerAvatar({id}: {id?: string | undefined}) {
  const volunteer = VOLUNTEERS.find(v => v.id === id);
  return volunteer ? <span className="inline-flex items-center gap-1.5" title={`Assigned to ${volunteer.name}`}><Initials name={volunteer.name} className="size-6 bg-secondary text-purple" /><span className="sr-only">{volunteer.name}</span></span> : null;
}