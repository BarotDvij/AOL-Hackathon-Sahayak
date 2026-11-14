import { createFileRoute } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/journey/AppShell";
import { ChannelIcon, StageBadge } from "@/components/journey/bits";
import { ProfileDialog } from "@/components/journey/ProfileDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STAGES } from "@/lib/journey/config";
import { formatShort } from "@/lib/journey/dates";
import { daysSinceLastContact, useJourney, type ParticipantView } from "@/lib/journey/store";
import type { Channel, StageId } from "@/lib/journey/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Journey dashboard · Journey Companion" },
      { name: "description", content: "See who needs a caring follow-up, what the next step is, and what still waits for review." },
      { property: "og:title", content: "Journey dashboard · Journey Companion" },
      { property: "og:description", content: "See who needs a caring follow-up, what the next step is, and what still waits for review." },
    ],
  }),
  component: DashboardPage,
});

function lastContactText(v: ParticipantView) {
  const d = daysSinceLastContact(v.history);
  if (d === null) return "never contacted";
  if (d === 0) return "contacted today";
  if (d === 1) return "contacted yesterday";
  return `last contact ${d} days ago`;
}

function DashboardPage() {
  const { views, catalog, summary, needsFollowUp } = useJourney();
  const [stage, setStage] = useState<StageId | "all">("all");
  const [city, setCity] = useState("all");
  const [channel, setChannel] = useState("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const cities = useMemo(() => [...new Set(views.map((v) => v.participant.city))].sort(), [views]);
  const matches = (v: ParticipantView) => {
    const p = v.participant;
    const needle = q.trim().toLowerCase();
    if (needle && !`${p.firstName} ${p.lastName} ${p.city} ${p.email ?? ""} ${p.phone ?? ""}`.toLowerCase().includes(needle)) return false;
    if (city !== "all" && p.city !== city) return false;
    if (channel !== "all" && (v.suggestion?.channel ?? p.preferredChannel) !== channel) return false;
    return true;
  };
  const scoped = views.filter(matches);
  const list = needsFollowUp.filter((v) => matches(v) && (stage === "all" || v.stage === stage));
  const openView = views.find((v) => v.participant.id === openId) ?? null;
  const filtered = city !== "all" || channel !== "all" || q.trim() !== "";

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Journey</h1>
        <p className="mt-1 text-sm text-muted-foreground">Where each person is, and one caring next step.</p>
      </header>

      <section className="mb-6 grid gap-3 sm:grid-cols-3" aria-label="At a glance">
        <Tile label="Participants" value={summary.total} note="in this centre" />
        <Tile label="Waiting for review" value={summary.waiting} note="drafts for you to check" />
        <Tile label="Sent this week" value={summary.sentThisWeek} note="approved by you" />
      </section>

      <section aria-label="Stages" className="mb-6">
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-7 md:gap-2 md:px-0">
          {STAGES.map((st) => {
            const count = scoped.filter((v) => v.stage === st.id).length;
            const on = stage === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setStage(on ? "all" : st.id)}
                aria-pressed={on}
                className={cn(
                  "w-36 shrink-0 rounded-xl border p-3 text-left transition-colors md:w-auto",
                  on ? "border-primary bg-secondary" : "border-border bg-card hover:border-primary/40",
                )}
              >
                <span className="block font-display text-2xl font-semibold tabular-nums">{count}</span>
                <span className="mt-0.5 block text-xs leading-tight text-muted-foreground">{st.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 basis-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, city or email" aria-label="Search participants" className="bg-card pl-9" />
        </div>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="w-36 bg-card" aria-label="Filter by city"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={channel} onValueChange={setChannel}>
          <SelectTrigger className="w-36 bg-card" aria-label="Filter by channel"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All channels</SelectItem>
            {(["whatsapp", "email", "sms"] as Channel[]).map((c) => <SelectItem key={c} value={c}>{c === "sms" ? "SMS" : c[0].toUpperCase() + c.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
      </section>

      <section aria-label="Needs follow-up">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Needs follow-up <span className="font-normal text-muted-foreground">· drifting away first</span></h2>
          {(filtered || stage !== "all") && (
            <button
              onClick={() => { setQ(""); setCity("all"); setChannel("all"); setStage("all"); }}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-3" aria-hidden />Clear filters
            </button>
          )}
        </div>

        {list.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {needsFollowUp.length === 0 ? "Everyone is up to date. Nothing needs a follow-up right now." : "No one here matches your filters."}
          </p>
        ) : (
          <ul className="space-y-3">
            {list.map((v) => <FollowUpRow key={v.participant.id} view={v} catalog={catalog} onOpen={() => setOpenId(v.participant.id)} />)}
          </ul>
        )}
      </section>

      <ProfileDialog view={openView} onOpenChange={(o) => !o && setOpenId(null)} />
    </AppShell>
  );
}

function Tile({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

function FollowUpRow({ view, catalog, onOpen }: { view: ParticipantView; catalog: ReturnType<typeof useJourney>["catalog"]; onOpen: () => void }) {
  const { participant: p, stage, suggestion: s, why } = view;
  const step = s ? catalog.get(s.nextStepId) : null;
  const channel = s?.channel ?? p.preferredChannel;
  return (
    <li>
      <button
        onClick={onOpen}
        className="flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-soft transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-ring"
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{p.firstName} {p.lastName}</span>
            <StageBadge stage={stage} />
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">{p.city} · {lastContactText(view)}</span>
          {step && (
            <span className="mt-2 block rounded-md bg-secondary px-2.5 py-1.5 text-sm font-semibold text-primary-strong">
              Next step: {step.shortTitle}{step.startDate ? ` · ${formatShort(step.startDate)}` : ""}
            </span>
          )}
          <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">{s?.why ?? why}</span>
        </span>
        {channel && <ChannelIcon channel={channel} className="mt-1 shrink-0" />}
      </button>
    </li>
  );
}
