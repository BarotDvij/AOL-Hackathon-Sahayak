import { ChevronDown, ChevronUp, ChevronsDownUp, ChevronsUpDown, Mail, Search, Sparkles, Users } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChannelIcon, channelLabel, Initials, StageBadge, StageBreakdown } from "@/components/journey/bits";
import { STAGES } from "@/lib/journey/config";
import { formatShort } from "@/lib/journey/dates";
import { contactText, daysSinceLastContact, useJourney, type ParticipantView } from "@/lib/journey/store";
import type { Channel, StageId } from "@/lib/journey/types";
import { suggestAssignments, VOLUNTEERS, type AssignmentProposal } from "@/lib/journey/operations";
import { useLanguage } from "@/lib/journey/i18n";
import { VolunteerAvatar } from "./OperationsBits";
import { MessageGroupDialog } from "./MessageGroupDialog";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

const PAGE_SIZE = 10;
type SortKey = "name" | "stage" | "contact" | "step";
/** Volunteer is the default view: coordinators work through the people they know. */
type GroupMode = "volunteer" | "city" | "none";

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Search, filters, sortable columns and grouping by volunteer, city or none. */
export function ParticipantsTable({ stage, onStage, onOpen, title = "Participants" }: { stage: StageId | "all"; onStage: (s: StageId | "all") => void; onOpen: (id: string) => void; title?: string }) {
  const { views, catalog, assignments, activeVolunteer, setActiveVolunteer, myFollowUps, setMyFollowUps, groups, unassigned, assign, confirmAssignments } = useJourney();
  const {t} = useLanguage();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("all");
  const [channel, setChannel] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "contact", dir: -1 });
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<GroupMode>("volunteer");
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [messaging, setMessaging] = useState<string | null>(null);
  const [proposals, setProposals] = useState<AssignmentProposal[] | null>(null);

  const cities = useMemo(() => [...new Set(views.map((v) => v.participant.city))].sort(), [views]);
  const stepOf = (v: ParticipantView) => (v.suggestion ? catalog.get(v.suggestion.nextStepId) ?? null : null);
  const channelOf = (v: ParticipantView) => v.suggestion?.channel ?? v.participant.preferredChannel;

  const filtered = useMemo(() => {
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
        if (myFollowUps && assignments[p.id] !== activeVolunteer) return false;
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
  }, [views, q, stage, city, channel, sort, catalog, assignments, activeVolunteer, myFollowUps]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const shown = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const toggle = (key: SortKey) => { setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 })); setPage(1); };

  const Head = ({ label, sortKey, className }: { label: string; sortKey?: SortKey; className?: string }) => (
    <th scope="col" className={cn("px-3 py-2 text-left align-middle text-xs font-medium text-muted-foreground", className)}>
      {sortKey ? (
        <button onClick={() => toggle(sortKey)} className="inline-flex items-center gap-1 transition-colors hover:text-foreground">
          {t(label)}
          {sort.key === sortKey ? (sort.dir === 1 ? <ChevronUp className="size-3" aria-hidden /> : <ChevronDown className="size-3" aria-hidden />) : null}
        </button>
      ) : t(label)}
    </th>
  );

  /** One participant row. Drag it onto another volunteer's section to move them. */
  const Row = ({ v }: { v: ParticipantView }) => {
    const p = v.participant;
    const paused = v.stage === "paused";
    const step = stepOf(v);
    const ch = channelOf(v);
    return (
      <tr
        key={p.id}
        draggable
        onDragStart={() => setDragging(p.id)}
        onDragEnd={() => setDragging(null)}
        onClick={() => onOpen(p.id)}
        className={cn("h-14 cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-secondary/60", paused && "opacity-60", dragging === p.id && "bg-secondary")}
      >
        <td className="px-3">
          <span className="flex items-center gap-3">
            <Initials name={`${p.firstName} ${p.lastName}`} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-foreground">{p.firstName} {p.lastName}</span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">{p.city}<VolunteerAvatar id={assignments[p.id] ?? v.connection?.volunteerId} /></span>
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
          <Button size="sm" variant="accent" className="h-7 px-2" onClick={(e) => { e.stopPropagation(); onOpen(p.id); }}>{t("Review")}</Button>
        </td>
      </tr>
    );
  };

  const TableBody = ({ rows, empty }: { rows: ParticipantView[]; empty: string }) => (
    <tbody>
      {rows.map((v) => <Row key={v.participant.id} v={v} />)}
      {rows.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">{t(empty)}</td></tr>}
    </tbody>
  );

  const Columns = () => (
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
  );

  /** A collapsible section: who it is, how they stand, and what you can do with them. */
  const Section = ({ id, name, sub, rows, quiet, counts, onMessage, volunteerId }: { id: string; name: string; sub: string; rows: ParticipantView[]; quiet: number; counts: { id: StageId; label: string; count: number }[]; onMessage?: () => void; volunteerId?: string | undefined }) => {
    const isOpen = !collapsed.includes(id);
    const drop = volunteerId !== undefined;
    return (
      <section
        aria-label={name}
        onDragOver={(e) => { if (drop) e.preventDefault(); }}
        onDrop={() => { if (drop && dragging) { assign(dragging, volunteerId); setDragging(null); } }}
        className={cn("overflow-hidden rounded-lg border border-border bg-card shadow-soft", drop && dragging && "border-purple ring-1 ring-purple/30")}
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <button
            onClick={() => setCollapsed((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))}
            aria-expanded={isOpen}
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
          >
            <Initials name={name} className="size-9 bg-secondary text-purple" />
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="truncate font-heading text-base font-semibold text-primary">{name}</span>
                {quiet > 0 && <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-stage-quiet px-2 py-0.5 text-xs font-medium text-stage-quiet-foreground">{plural(quiet, "person")} {t("going quiet")}</span>}
              </span>
              <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                {sub} · {plural(rows.length, "person")}
                {counts.some((c) => c.count > 0) && <StageBreakdown counts={counts} className="ml-1 w-24" />}
              </span>
            </span>
            <ChevronDown className={cn("ml-auto size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} aria-hidden />
          </button>
          {volunteerId && (
            <Link to="/groups/$volunteerId" params={{ volunteerId }} className="shrink-0 text-sm font-medium text-purple transition-colors hover:text-primary">{t("Open group")}</Link>
          )}
          {onMessage && (
            <Button size="sm" variant="outline" onClick={onMessage} disabled={rows.length === 0} className="shrink-0">
              <Mail className="size-4" aria-hidden />{t("Message group")}
            </Button>
          )}
        </div>
        {isOpen && (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <Columns />
              <TableBody rows={rows} empty="No one matches these filters." />
            </table>
          </div>
        )}
      </section>
    );
  };

  const sections = mode === "volunteer"
    ? groups.map((g) => ({
        id: g.volunteer.id,
        name: g.volunteer.name,
        sub: `${g.volunteer.city} · ${g.volunteer.languages.join(" / ")}`,
        rows: filtered.filter((v) => v.connection?.volunteerId === g.volunteer.id),
        quiet: g.goingQuiet,
        counts: g.stageCounts,
        volunteerId: g.volunteer.id,
        onMessage: () => setMessaging(g.volunteer.id),
      }))
    : mode === "city"
      ? cities.map((c) => {
          const rows = filtered.filter((v) => v.participant.city === c);
          return {
            id: `city-${c}`, name: c, sub: plural(rows.length, "person"), rows,
            quiet: rows.filter((v) => v.stage === "quiet").length,
            counts: STAGES.map((s) => ({ id: s.id, label: s.label, count: rows.filter((v) => v.stage === s.id).length })),
            volunteerId: undefined, onMessage: undefined,
          };
        })
      : [];

  const unassignedRows = filtered.filter((v) => !v.connection);
  const messagingGroup = groups.find((g) => g.volunteer.id === messaging);

  return (
    <section aria-label={title} className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-soft">
        <h2 className="mr-auto font-heading text-base font-semibold text-primary">{t(title)}</h2>
        <div className="relative min-w-0 basis-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={t("Search name, city or email")} aria-label="Search participants" className="bg-card pl-9" />
        </div>
        <Select value={stage} onValueChange={(s) => { onStage(s as StageId | "all"); setPage(1); }}>
          <SelectTrigger className={cn("w-40 bg-card", stage !== "all" && "border-purple text-purple")} aria-label="Filter by stage"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All stages")}</SelectItem>
            {STAGES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={city} onValueChange={(c) => { setCity(c); setPage(1); }}>
          <SelectTrigger className={cn("w-36 bg-card", city !== "all" && "border-purple text-purple")} aria-label="Filter by city"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All cities")}</SelectItem>
            {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={channel} onValueChange={(c) => { setChannel(c); setPage(1); }}>
          <SelectTrigger className={cn("w-36 bg-card", channel !== "all" && "border-purple text-purple")} aria-label="Filter by channel"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All channels")}</SelectItem>
            {(["whatsapp", "email", "sms"] as Channel[]).map((c) => <SelectItem key={c} value={c}>{channelLabel(c)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-2 shadow-soft">
        <span className="text-xs font-medium text-muted-foreground">{t("Group by")}</span>
        <Select value={mode} onValueChange={(m) => { setMode(m as GroupMode); setPage(1); setCollapsed([]); }}>
          <SelectTrigger className="w-36 bg-card" aria-label="Group by"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="volunteer">{t("Volunteer")}</SelectItem>
            <SelectItem value="city">{t("City")}</SelectItem>
            <SelectItem value="none">{t("None")}</SelectItem>
          </SelectContent>
        </Select>
        {mode !== "none" && (
          <Button size="sm" variant="outline" onClick={() => setCollapsed(collapsed.length ? [] : sections.map((s) => s.id).concat("unassigned"))}>
            {collapsed.length ? <ChevronsUpDown className="size-4" aria-hidden /> : <ChevronsDownUp className="size-4" aria-hidden />}
            {collapsed.length ? t("Expand all") : t("Collapse all")}
          </Button>
        )}
        <span className="mx-1 h-5 w-px bg-border" aria-hidden />
        <Button variant={myFollowUps ? "default" : "outline"} size="sm" onClick={() => { setMyFollowUps(!myFollowUps); setPage(1); }} aria-pressed={myFollowUps}>{t("My follow-ups")}</Button>
        {myFollowUps && <Select value={activeVolunteer} onValueChange={setActiveVolunteer}><SelectTrigger className="w-48" aria-label="Volunteer"><SelectValue /></SelectTrigger><SelectContent>{VOLUNTEERS.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent></Select>}
        <span className="text-xs text-muted-foreground">{myFollowUps ? VOLUNTEERS.find((v) => v.id === activeVolunteer)?.name : t("All participants")}</span>
      </div>

      {mode === "none" ? (
        <div className="rounded-lg border border-border bg-card shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <Columns />
              <TableBody rows={shown} empty="No one matches these filters." />
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
            <p className="text-xs text-muted-foreground">
              {filtered.length === 0 ? "No people to show" : `Showing ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>{t("Previous")}</Button>
              <span className="text-xs tabular-nums text-muted-foreground">Page {safePage} of {pages}</span>
              <Button size="sm" variant="outline" disabled={safePage === pages} onClick={() => setPage(safePage + 1)}>{t("Next")}</Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((s) => (
            <Section key={s.id} id={s.id} name={s.name} sub={s.sub} rows={s.rows} quiet={s.quiet} counts={s.counts} volunteerId={s.volunteerId} onMessage={s.onMessage} />
          ))}

          <section aria-label={t("Unassigned")} className="overflow-hidden rounded-lg border border-dashed border-border bg-card/60 shadow-soft">
            <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
              <button
                onClick={() => setCollapsed((c) => (c.includes("unassigned") ? c.filter((x) => x !== "unassigned") : [...c, "unassigned"]))}
                aria-expanded={!collapsed.includes("unassigned")}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground" aria-hidden><Users className="size-4" /></span>
                <span className="min-w-0">
                  <span className="block font-heading text-base font-semibold text-primary">{t("Unassigned")}</span>
                  <span className="block text-xs text-muted-foreground">{plural(unassignedRows.length, "person")} · {t("nobody has done a program with them yet")}</span>
                </span>
                <ChevronDown className={cn("ml-auto size-4 shrink-0 text-muted-foreground transition-transform", !collapsed.includes("unassigned") && "rotate-180")} aria-hidden />
              </button>
              <Button size="sm" variant="outline" onClick={() => setProposals(suggestAssignments(unassigned.map((v) => v.participant), assignments))} disabled={unassigned.length === 0}>
                <Sparkles className="size-4" aria-hidden />{t("Auto-assign")}
              </Button>
            </div>
            {!collapsed.includes("unassigned") && (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <Columns />
                  <TableBody rows={unassignedRows} empty="No one matches these filters." />
                </table>
              </div>
            )}
          </section>

          {proposals !== null && (
            <section aria-label={t("Review suggested assignments")} className="rounded-lg border border-border bg-card p-4 shadow-soft">
              <h3 className="font-heading text-base font-semibold text-primary">{t("Review suggested assignments")}</h3>
              <ul className="mt-2 max-h-64 divide-y divide-border overflow-y-auto">
                {proposals.map((p) => (
                  <li key={p.participantId} className="py-2 text-sm">
                    <span className="font-medium">{views.find((v) => v.participant.id === p.participantId)?.participant.firstName} → {VOLUNTEERS.find((v) => v.id === p.volunteerId)?.name}</span>
                    <p className="text-xs text-muted-foreground">{p.reason}</p>
                  </li>
                ))}
                {proposals.length === 0 && <li className="py-2 text-sm text-muted-foreground">{t("No compatible volunteer has room for another assignment.")}</li>}
              </ul>
              <div className="mt-3 flex gap-2">
                <Button disabled={!proposals.length} onClick={() => { confirmAssignments(proposals); setProposals(null); }}>{t("Confirm assignments")}</Button>
                <Button variant="outline" onClick={() => setProposals(null)}>{t("Cancel")}</Button>
              </div>
            </section>
          )}
        </div>
      )}

      {messagingGroup && <MessageGroupDialog group={messagingGroup} open={messaging !== null} onOpenChange={(o) => setMessaging(o ? messagingGroup.volunteer.id : null)} />}
    </section>
  );
}
