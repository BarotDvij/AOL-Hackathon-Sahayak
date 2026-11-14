import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Pencil, Undo2 } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/journey/AppShell";
import { ChannelIcon, StageBadge } from "@/components/journey/bits";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SKIP_REASONS } from "@/lib/journey/config";
import { formatShort } from "@/lib/journey/dates";
import { messageLimitNote } from "@/lib/journey/messages";
import { useJourney } from "@/lib/journey/store";
import type { Channel } from "@/lib/journey/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "Review queue · Journey Companion" },
      { name: "description", content: "Read each drafted follow-up one at a time, then approve, edit or skip it. Nothing is sent without you." },
      { property: "og:title", content: "Review queue · Journey Companion" },
      { property: "og:description", content: "Read each drafted follow-up one at a time, then approve, edit or skip it. Nothing is sent without you." },
    ],
  }),
  component: ReviewPage,
});

function ReviewPage() {
  const { pending, catalog, views, approve, skip, editMessage, setChannel, useAlternate } = useJourney();
  const total = views.filter((v) => v.suggestion).length;
  const reviewed = total - pending.length;
  const [i, setI] = useState(0);
  const [mode, setMode] = useState<"view" | "edit" | "skip">("view");
  const [draft, setDraft] = useState("");
  const [reason, setReason] = useState("");
  const [other, setOther] = useState("");

  const s = pending.length ? pending[Math.min(i, pending.length - 1)] : null;
  const v = s ? views.find((x) => x.participant.id === s.participantId) ?? null : null;
  const step = s ? catalog.get(s.nextStepId) ?? null : null;
  const alt = s?.alternateNextStepId ? catalog.get(s.alternateNextStepId) ?? null : null;
  const text = s ? s.editedMessage ?? s.draftMessage : "";
  const limit = s ? messageLimitNote(text, s.channel) : null;

  const done = () => { setMode("view"); setReason(""); setOther(""); setDraft(""); };
  const approveNow = () => { if (s) approve(s.id, text); done(); };
  const skipNow = () => { if (s) skip(s.id, reason === "Other" ? (other.trim() || "Other") : reason); done(); };

  if (!s || !v || !step) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
          <p className="font-display text-2xl font-semibold">All caught up!</p>
          <p className="mt-2 text-sm text-muted-foreground">Every drafted message has been reviewed. New suggestions appear here as people drift.</p>
          <Button asChild className="mt-5">
            <Link to="/">Back to dashboard</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="mb-5">
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Review queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">Nothing is ever sent without you approving it.</p>
      </header>

      <div className="mb-4">
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">{reviewed} of {total} reviewed</p>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${total ? (reviewed / total) * 100 : 0}%` }} />
        </div>
      </div>

      <article className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-xl font-semibold">{v.participant.firstName} {v.participant.lastName}</h2>
          <StageBadge stage={v.stage} />
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{v.participant.city}</p>

        <div className="mt-4 rounded-xl bg-secondary p-4">
          <p className="text-sm font-semibold text-primary-strong">Suggested next step: {step.shortTitle}{step.startDate ? ` · ${formatShort(step.startDate)}` : ""}</p>
          <p className="mt-1 text-sm text-muted-foreground">{s.why}</p>
          {alt && (
            <button onClick={() => { useAlternate(s.id); done(); }} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-strong underline-offset-4 hover:underline">
              <Undo2 className="size-3.5" aria-hidden />Try {alt.shortTitle} instead
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm text-muted-foreground"><ChannelIcon channel={s.channel} withLabel /></span>
          <Select value={s.channel} onValueChange={(c) => setChannel(s.id, c as Channel)}>
            <SelectTrigger className="w-40 bg-card" aria-label="Change channel"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(["whatsapp", "email", "sms"] as Channel[]).map((c) => <SelectItem key={c} value={c}>{c === "sms" ? "SMS" : c[0].toUpperCase() + c.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {mode === "edit" ? (
          <div className="mt-3">
            <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={9} aria-label="Message text" className="bg-card font-normal" />
            <p className={cn("mt-1 text-xs", limit?.ok ? "text-muted-foreground" : "text-destructive")}>{limit?.label}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => { editMessage(s.id, draft); done(); }}>Save changes</Button>
              <Button size="sm" variant="ghost" onClick={done}>Cancel</Button>
            </div>
          </div>
        ) : mode === "skip" ? (
          <div className="mt-3 rounded-xl border border-border p-4">
            <p className="text-sm font-medium">Why are you skipping this one?</p>
            <p className="text-xs text-muted-foreground">Optional — it helps us suggest better next time.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SKIP_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  aria-pressed={reason === r}
                  className={cn("rounded-full border px-3 py-1.5 text-sm transition-colors", reason === r ? "border-primary bg-secondary font-medium text-primary-strong" : "border-border text-muted-foreground hover:text-foreground")}
                >
                  {r}
                </button>
              ))}
            </div>
            {reason === "Other" && (
              <Inputish value={other} onChange={setOther} placeholder="Tell us in your words" />
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={skipNow}>Skip for now</Button>
              <Button size="sm" variant="ghost" onClick={done}>Back</Button>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <p className="whitespace-pre-wrap rounded-xl border border-border bg-background p-4 text-sm leading-relaxed">{text}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={approveNow}><Check className="size-4" aria-hidden />Approve and send</Button>
              <Button variant="outline" onClick={() => { setDraft(text); setMode("edit"); }}><Pencil className="size-4" aria-hidden />Edit</Button>
              <Button variant="ghost" onClick={() => setMode("skip")}>Skip for now</Button>
            </div>
          </div>
        )}
      </article>

      <p className="mt-4 flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
        {pending.length - 1 > 0 ? `${pending.length - 1} more after this one` : "This is the last one"}
        <ArrowRight className="size-3" aria-hidden />
      </p>
    </AppShell>
  );
}

function Inputish({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label="Reason for skipping"
      className="mt-3 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}
