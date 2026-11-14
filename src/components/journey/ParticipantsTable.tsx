import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChannelIcon, channelLabel, Initials, StageBadge } from "@/components/journey/bits";
import { STAGES } from "@/lib/journey/config";
import { formatShort } from "@/lib/journey/dates";
import { contactText, daysSinceLastContact, useJourney, type ParticipantView } from "@/lib/journey/store";
import type { Channel, StageId } from "@/lib/journey/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
type SortKey = "name" | "stage" | "contact" | "step";

/** Search, filters, sortable columns and 10 rows a page — the same table on the dashboard and the Participants page. */
export function ParticipantsTable({ stage, onStage, onOpen, title = "Participants" }: { stage: StageId | "all"; onStage: (s: StageId | "all") => void; onOpen: (id: string) => void; title?: string }) {
  const { views, catalog } = useJourney();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("all");
  const [channel, setChannel] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "contact", dir: -1 });
  const [page, setPage] = useState(1);

  const cities = useMemo(() => [...new Set(views.map((v) => v.participant.city))].sort(), [views]);
  const stepOf = (v: ParticipantView) => (v.suggestion ? catalog.get(v.suggestion.nextStepId) ?? null : null);
  const channelOf = (v: ParticipantView) => v.suggestion?.channel ?? v.participant.preferredChannel;

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const value = (v: ParticipantView): string | number => {
      if (sort.key === "name") return `${v.participant.firstName} ${v.participant.lastName}`.toLowerCase();
      if (sort.key === "stage") return STAGES.findIndex((s) => s.id === v.stage);
      if (sort.key === "contact") return daysSinceLastContact(v.history) ?? 9999;
      return stepOf(v)?.shortTitle.toLowerCase() ?? "zzz";
    };
    return views
      .filter((v) => {
        const p = v.participant;
        if (needle && !`${p.firstName} ${p.lastName} ${p.city} ${p.email ?? ""} ${p.phone ?? ""}`.toLowerCase().includes(needle)) return false;
        if (stage !== "all" && v.stage !== stage) return false;
        if (city !== "all" && p.city !== city) return false;
        if (channel !== "all" && channelOf(v) !== channel) return false;
        return true;
      })
      .sort((a, b) => {
        const x = value(a), y = value(b);
        return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
      });
  }, [views, q, stage, city, channel, sort, catalog]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const shown = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const toggle = (key: SortKey) => { setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 })); setPage(1); };

  const Head = ({ label, sortKey, className }: { label: string; sortKey?: SortKey; className?: string }) => (
    <th scope="col" className={cn("px-3 py-2 text-left align-middle text-xs font-medium text-muted-foreground", className)}>
      {sortKey ? (
        <button onClick={() => toggle(sortKey)} className="inline-flex items-center gap-1 transition-colors hover:text-foreground">
          {label}
          {sort.key === sortKey ? (sort.dir === 1 ? <ChevronUp className="size-3" aria-hidden /> : <ChevronDown className="size-3" aria-hidden />) : null}
        </button>
      ) : label}
    </th>
  );

  return (
    <section aria-label={title} className="rounded-lg border border-border bg-card shadow-soft">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
        <h2 className="mr-auto font-heading text-base font-semibold text-primary">{title}</h2>
        <div className="relative min-w-0 basis-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name, city or email" aria-label="Search participants" className="bg-card pl-9" />
        </div>
        <Select value={stage} onValueChange={(s) => { onStage(s as StageId | "all"); setPage(1); }}>
          <SelectTrigger className={cn("w-40 bg-card", stage !== "all" && "border-purple text-purple")} aria-label="Filter by stage"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {STAGES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={city} onValueChange={(c) => { setCity(c); setPage(1); }}>
          <SelectTrigger className={cn("w-36 bg-card", city !== "all" && "border-purple text-purple")} aria-label="Filter by city"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={channel} onValueChange={(c) => { setChannel(c); setPage(1); }}>
          <SelectTrigger className={cn("w-36 bg-card", channel !== "all" && "border-purple text-purple")} aria-label="Filter by channel"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All channels</SelectItem>
            {(["whatsapp", "email", "sms"] as Channel[]).map((c) => <SelectItem key={c} value={c}>{channelLabel(c)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-border">
              <Head label="Participant" sortKey="name" className="w-[26%]" />
              <Head label="Stage" sortKey="stage" className="w-[15%]" />
              <Head label="Last contact" sortKey="contact" className="w-[17%]" />
              <Head label="Suggested next step" sortKey="step" className="w-[24%]" />
              <Head label="Channel" className="w-[9%]" />
              <Head label="" className="w-[9%] text-right" />
            </tr>
          </thead>
          <tbody>
            {shown.map((v) => {
              const p = v.participant;
              const paused = v.stage === "paused";
              const step = stepOf(v);
              const ch = channelOf(v);
              return (
                <tr
                  key={p.id}
                  onClick={() => onOpen(p.id)}
                  className={cn("h-14 cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-secondary/60", paused && "opacity-60")}
                >
                  <td className="px-3">
                    <span className="flex items-center gap-3">
                      <Initials name={`${p.firstName} ${p.lastName}`} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">{p.firstName} {p.lastName}</span>
                        <span className="block truncate text-xs text-muted-foreground">{p.city}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-3"><span className="flex"><StageBadge stage={v.stage} /></span></td>
                  <td className="truncate px-3 text-sm text-muted-foreground">{contactText(v.history)}</td>
                  <td className="px-3">
                    {paused ? <StageBadge stage="paused" /> : (
                      <span className="block truncate text-sm text-foreground">{step ? `${step.shortTitle}${step.startDate ? ` · ${formatShort(step.startDate)}` : ""}` : "—"}</span>
                    )}
                  </td>
                  <td className="px-3">{ch ? <ChannelIcon channel={ch} /> : <span className="text-sm text-muted-foreground">—</span>}</td>
                  <td className="px-3 text-right">
                    <Button size="sm" variant="accent" className="h-7 px-2" onClick={(e) => { e.stopPropagation(); onOpen(p.id); }}>Review</Button>
                  </td>
                </tr>
              );
            })}
            {shown.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">No one matches these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
        <p className="text-xs text-muted-foreground">
          {rows.length === 0 ? "No people to show" : `Showing ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, rows.length)} of ${rows.length}`}
        </p>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>Previous</Button>
          <span className="text-xs tabular-nums text-muted-foreground">Page {safePage} of {pages}</span>
          <Button size="sm" variant="outline" disabled={safePage === pages} onClick={() => setPage(safePage + 1)}>Next</Button>
        </div>
      </div>
    </section>
  );
}
