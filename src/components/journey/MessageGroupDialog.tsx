import { useMemo, useState } from "react";
import { Send, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/lib/journey/i18n";
import { JOURNEY_CONFIG as C } from "@/lib/journey/config";
import { draftGroupMessage, type VolunteerGroup } from "@/lib/journey/groups";
import { channelLabel, Initials } from "@/components/journey/bits";
import { useJourney } from "@/lib/journey/store";
import type { Channel } from "@/lib/journey/types";

const CHANNELS: Channel[] = ["whatsapp", "email", "sms"];

/** The channel most of the group already answers on. */
function bestChannel(group: VolunteerGroup): Channel {
  const count = new Map<Channel, number>();
  for (const m of group.members) {
    const ch = m.participant.preferredChannel;
    if (ch) count.set(ch, (count.get(ch) ?? 0) + 1);
  }
  return [...count.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "whatsapp";
}

/**
 * One warm invite for a whole volunteer group. The coordinator reads it, can change
 * it, and nothing is recorded until they approve it — same rule as a single message.
 */
export function MessageGroupDialog({ group, open, onOpenChange }: { group: VolunteerGroup; open: boolean; onOpenChange: (o: boolean) => void }) {
  const {t} = useLanguage();
  const { sendGroupMessage, groupMessages } = useJourney();
  const [channel, setChannel] = useState<Channel>(() => bestChannel(group));
  const [text, setText] = useState(() => draftGroupMessage(group, channel, C.coordinatorName));
  const [edited, setEdited] = useState(false);
  const previous = groupMessages.filter((m) => m.volunteerId === group.volunteer.id);

  const pickChannel = (c: Channel) => {
    setChannel(c);
    if (!edited) setText(draftGroupMessage(group, c, C.coordinatorName));
  };
  const names = useMemo(() => group.members.slice(0, 6).map((m) => m.participant.firstName).join(", "), [group]);

  const approve = () => {
    sendGroupMessage(group.volunteer.id, text, channel);
    toast.success(t("Group invite approved"), { description: `${group.members.length} ${group.members.length === 1 ? "person" : "people"} in ${group.volunteer.name}'s group marked as sent.` });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-[22px] font-normal text-primary">{t("Message group")}</DialogTitle>
          <DialogDescription>
            {t("One warm invite for")}: {group.members.length} {group.members.length === 1 ? "person" : "people"} {t("in")} {group.volunteer.name}&rsquo;s {t("group")}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 p-3">
          <Users className="size-4 shrink-0 text-purple" aria-hidden />
          <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{names}{group.members.length > 6 ? ` +${group.members.length - 6}` : ""}</p>
        </div>

        <label className="text-xs font-medium text-muted-foreground" htmlFor="group-channel">{t("Send as")}</label>
        <Select value={channel} onValueChange={pickChannel}>
          <SelectTrigger id="group-channel" className="bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>{CHANNELS.map((c) => <SelectItem key={c} value={c}>{channelLabel(c)}</SelectItem>)}</SelectContent>
        </Select>

        <label className="text-xs font-medium text-muted-foreground" htmlFor="group-text">{t("Message")}</label>
        <Textarea
          id="group-text"
          value={text}
          onChange={(e) => { setText(e.target.value); setEdited(true); }}
          rows={9}
          className="bg-card text-sm leading-relaxed"
        />

        {previous.length > 0 && (
          <p className="text-xs text-muted-foreground">{t("Last group invite sent")}: {new Date(previous[0].at).toLocaleDateString("en-CA", { month: "short", day: "numeric" })} · {channelLabel(previous[0].channel)}</p>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("Skip for now")}</Button>
          <Button onClick={approve} disabled={!text.trim() || group.members.length === 0}>
            <Send className="size-4" aria-hidden />{t("Approve and send to")} {group.members.length}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
