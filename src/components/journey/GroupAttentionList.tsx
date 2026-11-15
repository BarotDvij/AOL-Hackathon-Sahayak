import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useLanguage } from "@/lib/journey/i18n";
import { Button } from "@/components/ui/button";
import { Initials, StageBreakdown } from "@/components/journey/bits";
import { groupsNeedingAttention } from "@/lib/journey/groups";
import { useJourney } from "@/lib/journey/store";
import { MessageGroupDialog } from "./MessageGroupDialog";

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/**
 * The volunteer groups with people drifting away, most at-risk first.
 * Every line is evidence from the group's own records — who they did what with, and when.
 */
export function GroupAttentionList() {
  const {t} = useLanguage();
  const { groups } = useJourney();
  const [messaging, setMessaging] = useState<string | null>(null);
  const ranked = groupsNeedingAttention(groups).filter((g) => g.goingQuiet > 0 || g.dormant > 0);
  const messagingGroup = groups.find((g) => g.volunteer.id === messaging);

  return (
    <section aria-label={t("Volunteer groups needing attention")} className="flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-soft">
      <h2 className="font-heading text-base font-semibold text-primary">{t("Volunteer groups needing attention")}</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{t("Groups with people drifting away, most at-risk first.")}</p>

      {ranked.length === 0 ? (
        <p className="mt-4 rounded-lg bg-muted p-4 text-sm text-muted-foreground">{t("No group has anyone drifting away right now.")}</p>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {ranked.map((g) => (
            <li key={g.volunteer.id} className="flex flex-wrap items-center gap-3 py-3">
              <Initials name={g.volunteer.name} className="size-9 bg-secondary text-purple" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">{g.volunteer.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {plural(g.goingQuiet, "person")} {t("going quiet")} · {g.members[0]?.connection?.reason ?? g.volunteer.city}
                </span>
                <StageBreakdown counts={g.stageCounts} className="mt-1.5 w-full max-w-40" />
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <Button asChild size="sm" variant="accent"><Link to="/groups/$volunteerId" params={{ volunteerId: g.volunteer.id }}>{t("Open group")}</Link></Button>
                <Button size="sm" variant="outline" onClick={() => setMessaging(g.volunteer.id)} disabled={g.members.length === 0}>
                  <Mail className="size-4" aria-hidden /><span className="sr-only">{t("Message group")}</span>
                </Button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {messagingGroup && <MessageGroupDialog group={messagingGroup} open={messaging !== null} onOpenChange={(o) => setMessaging(o ? messagingGroup.volunteer.id : null)} />}
    </section>
  );
}
