import { FlaskConical } from 'lucide-react';
import { useLanguage } from '@/lib/journey/i18n';
export function DemoNotice({ participant = false }: { participant?: boolean }) {
  const { t } = useLanguage();
  return <aside aria-label="Demo data notice" className="mb-5 flex items-start gap-3 border-l-2 border-purple bg-secondary/50 px-4 py-3 text-sm">
    <FlaskConical className="mt-0.5 size-4 shrink-0 text-purple" aria-hidden />
    <div><p className="font-heading font-semibold text-primary">{t('Demo data · not real participant records')}</p>
      <p className="mt-1 text-muted-foreground">{participant
        ? "Priya’s profile, progress and messages are fictional. Your demo answers and replies stay in this tab and reset on reload. No demo message is sent to anyone."
        : t('People, groups, attendance and messages are sample records. Approvals and replies only update this demo; no email, SMS or WhatsApp is sent.')}</p>
    </div>
  </aside>;
}