import { useLanguage } from "@/lib/journey/i18n";
import { Link } from "@tanstack/react-router";
import { Mail, MessageCircle, MessageSquareText, Sparkles } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { stageLabel } from "@/lib/journey/config";
import type { SahayakLinkTo } from "@/lib/journey/sahayak";
import type { Channel, StageId } from "@/lib/journey/types";

/** One soft, muted colour per stage. The same classes are used in badges, the stage bar and the legend. */
export const STAGE_CLASSES: Record<StageId, string> = {
  paused: "bg-stage-paused text-stage-paused-foreground",
  new: "bg-stage-new text-stage-new-foreground",
  building: "bg-stage-building text-stage-building-foreground",
  active: "bg-stage-active text-stage-active-foreground",
  serving: "bg-stage-serving text-stage-serving-foreground",
  quiet: "bg-stage-quiet text-stage-quiet-foreground",
  dormant: "bg-stage-dormant text-stage-dormant-foreground",
};

export function StageBadge({ stage, className }: { stage: StageId; className?: string }) {
  const {t} = useLanguage();
  return <span className={cn("inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", STAGE_CLASSES[stage], className)}>{t(stageLabel(stage))}</span>;
}

export function StageDot({ stage, className }: { stage: StageId; className?: string }) {
  const {t} = useLanguage();
  return <span className={cn("inline-block size-2 shrink-0 rounded-full", STAGE_CLASSES[stage], className)} aria-hidden />;
}

/** Initials stand in for a photo: no images of real people in a demo. */
export function Initials({ name, className }: { name: string; className?: string }) {
  const {t} = useLanguage();
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
  return (
    <span className={cn("grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground", className)} aria-hidden>
      {initials}
    </span>
  );
}

const CHANNEL_META: Record<Channel, { label: string; Icon: typeof Mail }> = {
  whatsapp: { label: "WhatsApp", Icon: MessageCircle },
  email: { label: "Email", Icon: Mail },
  sms: { label: "SMS", Icon: MessageSquareText },
};
export const channelLabel = (c: Channel) => CHANNEL_META[c].label;
export function ChannelIcon({ channel, withLabel, className }: { channel: Channel; withLabel?: boolean; className?: string }) {
  const {t} = useLanguage();
  const { label, Icon } = CHANNEL_META[channel];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-muted-foreground", className)} title={label}>
      <Icon className="size-4" aria-hidden />
      {withLabel ? <span className="text-sm">{label}</span> : <span className="sr-only">{label}</span>}
    </span>
  );
}

/** The one marker for anything Sahayak wrote. Purple sparkle, never a button of its own. */
export function SahayakTag({ className }: { className?: string }) {
  const {t} = useLanguage();
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium text-purple", className)}>
      <Sparkles className="size-3 shrink-0" aria-hidden />
      Suggested by Sahayak
    </span>
  );
}

/**
 * Typed navigation for whatever page a Sahayak suggestion points at.
 * TanStack needs a literal `to`, so each allowed page gets its own branch.
 */
export function SahayakLink({ to, className, children }: { to: SahayakLinkTo; className?: string; children: ReactNode }) {
  switch (to) {
    case "/impact": return <Link to="/impact" className={className}>{children}</Link>;
    case "/inbox": return <Link to="/inbox" className={className}>{children}</Link>;
    case "/review": return <Link to="/review" className={className}>{children}</Link>;
    case "/participants": return <Link to="/participants" className={className}>{children}</Link>;
    case "/activity": return <Link to="/activity" className={className}>{children}</Link>;
    case "/sahayak": return <Link to="/sahayak" className={className}>{children}</Link>;
    default: return <Link to="/" className={className}>{children}</Link>;
  }
}

/** Set after mount so the server and the first client render say the same thing. */
export function useGreeting() {
  const [g, setG] = useState<string | null>(null);
  useEffect(() => {
    const h = new Date().getHours();
    setG(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);
  return g ?? "Hello";
}
