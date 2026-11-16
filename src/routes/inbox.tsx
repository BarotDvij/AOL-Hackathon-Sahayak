import { useLanguage } from "@/lib/journey/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronDown, ChevronUp, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/journey/AppShell";
import { ChannelIcon, Initials, SahayakTag } from "@/components/journey/bits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatFull } from "@/lib/journey/dates";
import { needsReply, type InboxStatus } from "@/lib/journey/inbox-seed";
import { useJourney } from "@/lib/journey/store";
import { suggestedReply, waitingDays, WAITING_AFTER_DAYS } from "@/lib/journey/sahayak";
import type { InboxMessage } from "@/lib/journey/inbox-seed";
import { cn } from "@/lib/utils";
import { pressurePhrases, TONE_DEMO_DRAFT } from '@/lib/journey/message-pressure';
import { messageLimitNote } from '@/lib/journey/messages';

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox · Sahayak" },
      { name: "description", content: "Messages from your participants, with the ones still waiting for an answer marked for you." },
      { property: "og:title", content: "Inbox · Sahayak" },
      { property: "og:description", content: "Messages from your participants, with the ones still waiting for an answer marked for you." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InboxPage,
});

const STATUS_LABEL: Record<InboxStatus, string> = {
  "needs-reply": "Needs reply",
  replied: "Replied",
  "no-action": "No action needed",
};

const STATUS_CLASS: Record<InboxStatus, string> = {
  "needs-reply": "bg-muted text-muted-foreground",
  replied: "bg-sun-yellow text-primary",
  "no-action": "bg-stage-paused text-stage-paused-foreground",
};

const FILTERS: { id: InboxStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "needs-reply", label: "Needs reply" },
  { id: "replied", label: "Replied" },
  { id: "no-action", label: "No action needed" },
];

function InboxPage() {
  const {t} = useLanguage();
  const { inbox, sahayak } = useJourney();
  const [filter, setFilter] = useState<InboxStatus | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(
    () => inbox.filter((m) => filter === "all" || m.status === filter).sort((a, b) => a.date.localeCompare(b.date)),
    [inbox, filter],
  );

  return (
    <AppShell>
      <div className="space-y-4">
        <header className="mb-2">
          <h1 className="font-display text-[32px] font-normal text-primary">{t('Inbox')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            What your participants have written, oldest first. Nothing is answered without you.
          </p>
        </header>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter messages">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                filter === f.id ? "border-purple bg-secondary font-semibold text-purple" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {t(f.label)}
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-soft">
            Nothing here right now.
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map((m) => (
              <li key={m.id}>
                <MessageCard message={m} open={openId === m.id} onToggle={() => setOpenId(openId === m.id ? null : m.id)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}

function MessageCard({ message: m, open, onToggle }: { message: InboxMessage; open: boolean; onToggle: () => void }) {
  const {t} = useLanguage();
  const { sahayak, views, catalogList, replyInbox } = useJourney();
  const person = views.find((v) => v.participant.id === m.participantId) ?? null;
  const waited = sahayak.on ? waitingDays(m) : null;
  const waitingLong = waited !== null && waited >= WAITING_AFTER_DAYS;
  const [draft, setDraft] = useState<string | null>(null);

  const suggested = sahayak.on && sahayak.features.autoDraft && person && needsReply(m)
    ? suggestedReply(m, person.participant, catalogList)
    : null;
  const toneDemo = m.id === 'i01';
  const text = draft ?? (toneDemo ? TONE_DEMO_DRAFT : suggested) ?? "";
  const lengthNote = messageLimitNote(text, m.channel);
  const flags = pressurePhrases(text);

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-3 p-4 text-left">
        <Initials name={m.from} />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-medium text-foreground">{m.from}</span>
            {waitingLong && (
              <span className="rounded-full bg-sun-orange px-2 py-0.5 text-[11px] font-semibold text-primary">
                Waiting {waited} {waited === 1 ? "day" : "days"}
              </span>
            )}
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", STATUS_CLASS[m.status])}>{STATUS_LABEL[m.status]}</span>
            {toneDemo && <span className="rounded-full bg-stage-quiet px-2 py-0.5 text-xs font-medium text-stage-quiet-foreground">Tone-check demo</span>}
          </span>
          <span className="mt-0.5 block truncate text-sm text-foreground">{m.subject}</span>
          <span className="block truncate text-xs text-muted-foreground">{m.preview}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <ChannelIcon channel={m.channel} />
          <span className="text-xs text-muted-foreground">{formatFull(m.date)}</span>
          {open ? <ChevronUp className="size-4 text-muted-foreground" aria-hidden /> : <ChevronDown className="size-4 text-muted-foreground" aria-hidden />}
        </span>
      </button>

      {open && (
        <div className="border-t border-border p-4">
          <p className="whitespace-pre-wrap rounded-lg border border-border bg-background p-3 text-sm leading-relaxed">{m.preview}</p>
          {person && <p className="mt-2 text-xs text-muted-foreground">{person.participant.city} · {person.participant.email ?? person.participant.phone ?? "no contact details"}</p>}

          {m.status === "replied" && m.replyText ? (
            <div className="mt-3 rounded-lg bg-secondary p-3">
              <p className="text-xs font-semibold text-primary">{t('Your reply')}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{m.replyText}</p>
            </div>
          ) : needsReply(m) ? (
            <div className="mt-3">
              <label htmlFor={`reply-${m.id}`} className="text-xs font-medium text-muted-foreground">
                {toneDemo ? 'Demo draft · intentionally includes pressure wording · not sent' : suggested ? "Suggested reply — read it, change it, then approve" : "Write a reply"}
              </label>
              <Textarea id={`reply-${m.id}`} value={text} onChange={(e) => setDraft(e.target.value)} rows={6} className="mt-1 bg-card" />
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-live="polite">
                <span className={lengthNote.ok ? 'text-muted-foreground' : 'text-destructive'}>{lengthNote.label}</span>
                {flags.length > 0 && <span className="inline-flex items-start gap-1 text-sun-orange-deep"><TriangleAlert className="size-4 shrink-0" aria-hidden /><span>Pressure phrases: {flags.map(word => `“${word}”`).join(', ')}. Consider gentler wording.</span></span>}
              </div>
              {suggested && !toneDemo && <SahayakTag className="mt-1.5" />}
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" disabled={!text.trim()} onClick={() => { replyInbox(m.id, text); setDraft(null); }}>
                  <Check className="size-4" aria-hidden />Approve and send reply
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setDraft(null)}>{t('Clear')}</Button>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">{t('No reply needed for this one.')}</p>
          )}
        </div>
      )}
    </article>
  );
}
