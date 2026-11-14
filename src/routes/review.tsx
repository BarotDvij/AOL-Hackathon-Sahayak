import { createFileRoute } from "@tanstack/react-router";
import { Check, Leaf, Repeat, SkipForward } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChannelIcon, StageBadge } from "@/components/journey/bits";
import { SKIP_REASONS } from "@/lib/journey/config";
import { formatShort } from "@/lib/journey/dates";
import { messageLimitNote } from "@/lib/journey/messages";
import { useJourney } from "@/lib/journey/store";
import type { Suggestion } from "@/lib/journey/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "Review queue · Journey Companion" },
      { name: "description", content: "Read, edit and approve each personal follow-up before anything is sent." },
      { property: "og:title", content: "Review queue · Journey Companion" },
      { property: "og:description", content: "Read, edit and approve each personal follow-up before anything is sent." },
    ],
  }),
  component: ReviewPage,
});

function ReviewPage() {
  const { pending } = useJourney();
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-10">
      <h1 className="font-display text-3xl">Review queue</h1>
      <p className="mt-1 text-muted-foreground">Nothing is sent until you approve it.</p>
      {pending.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center text-muted-foreground">
          <Leaf className="size-8 text-primary" aria-hidden />
          <p className="text-lg">All caught up. No follow-ups waiting.</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-5">{pending.map((s) => <ReviewItem key={s.id} s={s} />)}</ul>
      )}
    </div>
  );
}

function ReviewItem({ s }: { s: Suggestion }) {
  const { views, catalog, approve, skip, useAlternate: swapAlternate, editMessage } = useJourney();
  const v = views.find((x) => x.participant.id === s.participantId)!;
  const step = catalog.get(s.nextStepId)!;
  const alt = s.alternateNextStepId ? catalog.get(s.alternateNextStepId) : null;
  const text = s.editedMessage ?? s.draftMessage;
  const limit = messageLimitNote(text, s.channel);
  const [skipping, setSkipping] = useState(false);
  const [reason, setReason] = useState<string>("");

  return (
    <li id={s.id} className="review-target rounded-xl border border-border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-semibold">{v.participant.firstName} {v.participant.lastName}</h2>
        <StageBadge stage={v.stage} />
        <ChannelIcon channel={s.channel} withLabel className="ml-auto" />
      </div>
      <p className="mt-3 text-sm font-semibold text-primary-strong">Next step: {step.title.charAt(0).toUpperCase() + step.title.slice(1)}{step.startDate ? ` · ${formatShort(step.startDate)}` : ""}</p>
      <p className="text-sm text-muted-foreground">{s.why}</p>
      <label className="mt-4 block text-sm font-medium" htmlFor={`${s.id}-msg`}>Message</label>
      <Textarea id={`${s.id}-msg`} value={text} onChange={(e) => editMessage(s.id, e.target.value)} rows={s.channel === "email" ? 12 : 5} className="mt-1.5 bg-background leading-relaxed" />
      <p className={cn("mt-1 text-right text-xs", limit.ok ? "text-muted-foreground" : "text-destructive")}>{limit.label}</p>

      {skipping ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="w-56" aria-label="Reason for skipping"><SelectValue placeholder="Why skip?" /></SelectTrigger>
            <SelectContent>{SKIP_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="secondary" disabled={!reason} onClick={() => { skip(s.id, reason); toast(`Skipped ${v.participant.firstName}`, { description: reason }); }}>Confirm skip</Button>
          <Button variant="ghost" onClick={() => setSkipping(false)}>Cancel</Button>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button disabled={!limit.ok || !text.trim()} onClick={() => { approve(s.id, text); toast.success(`Sent (demo) to ${v.participant.firstName}`, { description: "Nothing was actually sent." }); }}>
            <Check aria-hidden /> Approve &amp; Send
          </Button>
          {alt && <Button variant="outline" onClick={() => swapAlternate(s.id)} title={`Switch to: ${alt.title}`}><Repeat aria-hidden /> Use alternate</Button>}
          <Button variant="ghost" onClick={() => setSkipping(true)}><SkipForward aria-hidden /> Skip</Button>
        </div>
      )}
    </li>
  );
}
