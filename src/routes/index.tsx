import { createFileRoute } from "@tanstack/react-router";
import { UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChannelIcon, channelLabel } from "@/components/journey/bits";
import { ProfileDialog } from "@/components/journey/ProfileDialog";
import { STAGES } from "@/lib/journey/config";
import { formatShort } from "@/lib/journey/dates";
import { useJourney, type ParticipantView } from "@/lib/journey/store";
import type { Channel } from "@/lib/journey/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Journey view · Journey Companion" },
      { name: "description", content: "See every participant by journey stage, with one gentle next step for each." },
      { property: "og:title", content: "Journey view · Journey Companion" },
      { property: "og:description", content: "See every participant by journey stage, with one gentle next step for each." },
    ],
  }),
  component: JourneyPage,
});

function JourneyPage() {
  const { views, catalog } = useJourney();
  const [city, setCity] = useState("all");
  const [channel, setChannel] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const cities = useMemo(() => [...new Set(views.map((v) => v.participant.city))].sort(), [views]);
  const filtered = views.filter((v) => (city === "all" || v.participant.city === city) && (channel === "all" || (v.suggestion?.channel ?? v.participant.preferredChannel) === channel));
  const openView = views.find((v) => v.participant.id === openId) ?? null;

  return (
    <div className="px-5 py-8 md:px-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Journey</h1>
          <p className="mt-1 text-muted-foreground">Where each person is, and one caring next step.</p>
        </div>
        <div className="flex gap-3">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-40 bg-card" aria-label="Filter by city"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger className="w-40 bg-card" aria-label="Filter by channel"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All channels</SelectItem>
              {(["whatsapp", "email", "sms"] as Channel[]).map((c) => <SelectItem key={c} value={c}>{channelLabel(c)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-4 md:-mx-10 md:px-10">
        {STAGES.map((st) => {
          const col = filtered.filter((v) => v.stage === st.id);
          return (
            <section key={st.id} className="w-72 shrink-0" aria-label={st.label}>
              <h2 className="mb-3 flex items-center justify-between px-1 text-sm font-semibold">
                {st.label}
                <span className="rounded-full bg-muted px-2 text-xs text-muted-foreground">{col.length}</span>
              </h2>
              <div className="space-y-3">
                {col.map((v) => <ParticipantCard key={v.participant.id} view={v} onOpen={() => setOpenId(v.participant.id)} catalog={catalog} />)}
                {col.length === 0 && <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">No one here</p>}
              </div>
            </section>
          );
        })}
      </div>
      <ProfileDialog view={openView} onOpenChange={(o) => !o && setOpenId(null)} />
    </div>
  );
}

function ParticipantCard({ view, onOpen, catalog }: { view: ParticipantView; onOpen: () => void; catalog: ReturnType<typeof useJourney>["catalog"] }) {
  const { participant: p, suggestion: s, stage } = view;
  const paused = stage === "paused";
  const step = !paused && s ? catalog.get(s.nextStepId) : null;
  const channel = s?.channel ?? p.preferredChannel;
  return (
    <article className={cn("relative rounded-xl border border-border bg-card p-4 shadow-soft", paused && "opacity-60")}>
      <button onClick={onOpen} className="absolute right-3 top-3 grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-primary-strong focus-visible:outline-2 focus-visible:outline-ring" aria-label={`Open profile for ${p.firstName} ${p.lastName}`}>
        <UserRound className="size-4" aria-hidden />
      </button>
      <h3 className="pr-8 font-semibold leading-snug">{p.firstName} {p.lastName}</h3>
      <p className="text-sm text-muted-foreground">{p.city}</p>
      {paused ? (
        <p className="mt-3 text-sm font-medium text-muted-foreground">{p.doNotContact ? "Do not contact" : "Contacted recently"}</p>
      ) : step ? (
        <p className="mt-3 rounded-md bg-secondary px-2.5 py-1.5 text-sm font-semibold text-primary-strong">
          Next step: {step.shortTitle}{step.startDate ? ` · ${formatShort(step.startDate)}` : ""}
        </p>
      ) : null}
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-xs leading-relaxed text-muted-foreground">{paused ? view.why : s?.why ?? view.why}</p>
        {channel && <ChannelIcon channel={channel} className="shrink-0" />}
      </div>
    </article>
  );
}
