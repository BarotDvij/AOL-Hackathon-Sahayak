import { useState } from "react";
import { AlertTriangle, ArrowLeft, MessageSquareText, Sparkles } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/journey/AppShell";
import { SahayakTag, StageBadge, StageBreakdown, Initials } from "@/components/journey/bits";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useJourney } from "@/lib/journey/store";
import { useLanguage } from "@/lib/journey/i18n";
import { groupSuggestions } from "@/lib/journey/groups";
import { VOLUNTEERS } from "@/lib/journey/operations";
import { formatShort } from "@/lib/journey/dates";
import { MessageGroupDialog } from "@/components/journey/MessageGroupDialog";

export const Route = createFileRoute("/groups/$volunteerId")({
  head: () => ({
    meta: [
      { title: "Volunteer group · Sahayak" },
      { name: "description", content: "A volunteer's group: who they led, where everyone stands, and what to do next." },
      { property: "og:title", content: "Volunteer group · Sahayak" },
      { property: "og:description", content: "A volunteer's group: who they led, where everyone stands, and what to do next." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GroupPage,
});

function GroupPage() {
  const { volunteerId } = Route.useParams();
  const {t} = useLanguage();
  const { groups, views, assignments, assign } = useJourney();
  const [messaging, setMessaging] = useState(false);
  const group = groups.find((g) => g.volunteer.id === volunteerId);
  const volunteer = VOLUNTEERS.find((v) => v.id === volunteerId);

  if (!group || !volunteer) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-soft">
          <h1 className="font-display text-[32px] font-normal text-primary">{t("This group isn't here")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("It may have been removed. Every volunteer's group is listed on the People page.")}</p>
          <Button asChild className="mt-5"><Link to="/participants">{t("Back to People")}</Link></Button>
        </div>
      </AppShell>
    );
  }

  const suggestions = groupSuggestions(group);
  const room = volunteer.capacity - group.members.length;

  return (
    <AppShell>
      <Link to="/participants" className="mb-4 inline-flex items-center gap-1.5 text-sm text-purple transition-colors hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden />{t("Back to People")}
      </Link>

      <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Initials name={volunteer.name} className="size-11 bg-secondary text-purple" />
          <div>
            <h1 className="font-display text-[32px] font-normal text-primary">{t("Group")}: {volunteer.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {volunteer.city} · {volunteer.languages.join(" / ")} · {group.members.length} {group.members.length === 1 ? "person" : "people"}
            </p>
          </div>
        </div>
        <Button onClick={() => setMessaging(true)} disabled={group.members.length === 0}>
          <MessageSquareText className="size-4" aria-hidden />{t("Message group")}
        </Button>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-label={t("What they led")} className="rounded-lg border border-border bg-card p-5 shadow-soft">
          <h2 className="font-heading text-base font-semibold text-primary">{t("What they led")}</h2>
          {group.programs.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">{t("No programs on record yet.")}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {group.programs.map((p) => (
                <li key={`${p.kind}-${p.name}`} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate">{p.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{p.people} {p.people === 1 ? "person" : "people"}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("Weekly capacity")}</span>
              <span>{group.members.length} / {volunteer.capacity}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div className={`h-full ${room < 0 ? "bg-sun-orange" : "bg-purple"}`} style={{ width: `${Math.min(100, (group.members.length / volunteer.capacity) * 100)}%` }} />
            </div>
            {room < 0 && <p className="mt-2 flex items-center gap-1 text-xs text-sun-orange-deep"><AlertTriangle className="size-3" aria-hidden />{t("Over weekly capacity")}</p>}
          </div>
          <div className="mt-5">
            <StageBreakdown counts={group.stageCounts} />
            <p className="mt-2 text-xs text-muted-foreground">
              {group.stageCounts.filter((s) => s.count > 0).map((s) => `${s.count} ${t(s.label)}`).join(" · ")}
            </p>
          </div>
        </section>

        <section aria-label={t("What to do next")} className="rounded-lg border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-base font-semibold text-primary">{t("What to do next")}</h2>
            <SahayakTag />
          </div>
          <ul className="mt-3 space-y-3">
            {suggestions.map((s) => (
              <li key={s.id} className="rounded-lg border border-border bg-secondary/40 p-3">
                <p className="text-sm text-foreground">{s.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.why}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-label={t("Everyone in this group")} className="mt-4 rounded-lg border border-border bg-card shadow-soft">
        <div className="border-b border-border p-4">
          <h2 className="font-heading text-base font-semibold text-primary">{t("Everyone in this group")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{t("The program they share, and anyone else they have done something with.")}</p>
        </div>
        <ul className="divide-y divide-border">
          {group.members.map((m) => {
            const others = views.find((v) => v.participant.id === m.participant.id)?.alsoKnows ?? [];
            return (
              <li key={m.participant.id} className="flex flex-wrap items-center gap-3 p-4">
                <Initials name={`${m.participant.firstName} ${m.participant.lastName}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">{m.participant.firstName} {m.participant.lastName}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {m.connection?.reason ?? ""}
                    {others.length > 0 && <> · {t("Also knows")}: {others.map((id) => VOLUNTEERS.find((v) => v.id === id)?.name ?? id).join(", ")}</>}
                  </span>
                </span>
                <StageBadge stage={m.stage} />
                {m.connection?.date && <span className="text-xs text-muted-foreground">{formatShort(m.connection.date)}</span>}
                <Select value={assignments[m.participant.id] ?? ""} onValueChange={(id) => assign(m.participant.id, id)}>
                  <SelectTrigger className="w-44 bg-card" aria-label={`${t("Move")} ${m.participant.firstName} ${m.participant.lastName}`}><SelectValue placeholder={t("Move to")} /></SelectTrigger>
                  <SelectContent>{VOLUNTEERS.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                </Select>
              </li>
            );
          })}
          {group.members.length === 0 && <li className="p-8 text-center text-sm text-muted-foreground">{t("Nobody is in this group yet.")}</li>}
        </ul>
      </section>

      <MessageGroupDialog key={`${group.volunteer.id}-${group.members.length}`} group={group} open={messaging} onOpenChange={setMessaging} />
    </AppShell>
  );
}
