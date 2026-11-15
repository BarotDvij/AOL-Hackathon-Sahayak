import { TriangleAlert } from 'lucide-react';
import { messageLimitNote } from '@/lib/journey/messages';
import { pressurePhrases } from '@/lib/journey/message-pressure';
import type { Channel } from '@/lib/journey/types';
import { useLanguage } from '@/lib/journey/i18n';
import { cn } from '@/lib/utils';
export function MessageNotes({ text, channel }: { text: string; channel: Channel }) {
  const { t } = useLanguage();
  const length = messageLimitNote(text, channel);
  const phrases = pressurePhrases(text);
  return <div className="mt-1 flex flex-wrap items-start gap-x-4 gap-y-1 text-xs" aria-live="polite" aria-atomic="true">
    <span className={cn(length.ok ? 'text-muted-foreground' : 'text-destructive')}>{length.label}</span>
    {phrases.length > 0 && <span className="inline-flex min-w-0 items-start gap-1.5 text-sun-orange-deep"><TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden /><span>{t('Pressure phrases')}: {phrases.map(phrase => `“${phrase}”`).join(', ')}. {t('Consider gentler wording.')}</span></span>}
  </div>;
}