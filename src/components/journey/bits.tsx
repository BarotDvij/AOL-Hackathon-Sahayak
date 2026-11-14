import { Mail, MessageCircle, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";
import { stageLabel } from "@/lib/journey/config";
import type { Channel, StageId } from "@/lib/journey/types";

const STAGE_CLASSES: Record<StageId, string> = {
  paused: "bg-stage-paused text-stage-paused-foreground",
  new: "bg-stage-new text-stage-new-foreground",
  building: "bg-stage-building text-stage-building-foreground",
  active: "bg-stage-active text-stage-active-foreground",
  serving: "bg-stage-serving text-stage-serving-foreground",
  quiet: "bg-stage-quiet text-stage-quiet-foreground",
  dormant: "bg-stage-dormant text-stage-dormant-foreground",
};
export function StageBadge({ stage, className }: { stage: StageId; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", STAGE_CLASSES[stage], className)}>{stageLabel(stage)}</span>;
}

const CHANNEL_META: Record<Channel, { label: string; Icon: typeof Mail }> = {
  whatsapp: { label: "WhatsApp", Icon: MessageCircle },
  email: { label: "Email", Icon: Mail },
  sms: { label: "SMS", Icon: MessageSquareText },
};
export const channelLabel = (c: Channel) => CHANNEL_META[c].label;
export function ChannelIcon({ channel, withLabel, className }: { channel: Channel; withLabel?: boolean; className?: string }) {
  const { label, Icon } = CHANNEL_META[channel];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-muted-foreground", className)} title={label}>
      <Icon className="size-4" aria-hidden />
      {withLabel ? <span className="text-sm">{label}</span> : <span className="sr-only">{label}</span>}
    </span>
  );
}
