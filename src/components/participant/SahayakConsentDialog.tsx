import { useState } from "react";
import { ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const SAHAYAK_ACCESS = [
  { id: "practice", label: "Your practice log — what you have practised and the days you log" },
  { id: "goals", label: "Your goals and the practice rhythm you saved" },
  { id: "events", label: "Your upcoming events and calendar links" },
  { id: "messages", label: "Messages your coordinator already approved for you" },
  { id: "summary", label: "A summary you approve, shared with your coordinator and marked \u201cvia Muse\u201d" },
] as const;

export type SahayakAccessId = (typeof SAHAYAK_ACCESS)[number]["id"];

export const ALL_SAHAYAK_ACCESS_IDS = SAHAYAK_ACCESS.map((item) => item.id) as SahayakAccessId[];

const NEVER = [
  "It never sends a message to anyone",
  "It never shows your records to another participant",
  "You can turn it off any time, right from this sidebar",
];

const CHECKBOX = "mt-0.5 border-purple data-[state=checked]:border-purple data-[state=checked]:bg-purple data-[state=checked]:text-primary-foreground";

function ConsentBody({ selected, onAccept, onDecline }: { selected: SahayakAccessId[]; onAccept: (ids: SahayakAccessId[]) => void; onDecline: () => void }) {
  const [picked, setPicked] = useState<SahayakAccessId[]>(selected);
  const allOn = picked.length === SAHAYAK_ACCESS.length;

  const toggle = (id: SahayakAccessId) =>
    setPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-display text-[22px] font-normal text-primary">Before Muse helps with your practice</DialogTitle>
        <DialogDescription>
          Your Sahayak lives in your Muse and can only use what you tick here. Nothing is sent to anyone.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 font-heading text-xs font-semibold text-purple">
              <ShieldCheck className="size-3.5" aria-hidden />What Muse can use
            </p>
            <label htmlFor="sahayak-all" className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary">
              <Checkbox
                id="sahayak-all"
                aria-label="Allow all"
                checked={allOn ? true : picked.length > 0 ? "indeterminate" : false}
                onCheckedChange={() => setPicked(allOn ? [] : [...ALL_SAHAYAK_ACCESS_IDS])}
                className={CHECKBOX}
              />
              Allow all
            </label>
          </div>
          <ul className="mt-2 space-y-2">
            {SAHAYAK_ACCESS.map((item) => (
              <li key={item.id} className="flex items-start gap-2.5">
                <Checkbox
                  id={`sahayak-${item.id}`}
                  checked={picked.includes(item.id)}
                  onCheckedChange={() => toggle(item.id)}
                  className={CHECKBOX}
                />
                <label htmlFor={`sahayak-${item.id}`} className="cursor-pointer text-sm leading-snug text-primary">
                  {item.label}
                </label>
              </li>
            ))}
          </ul>
          {picked.length === 0 && <p className="mt-2 text-xs text-muted-foreground">Tick at least one item, or choose Allow all.</p>}
        </div>
        <div className="rounded-lg border border-border bg-secondary/60 p-3">
          <p className="font-heading text-xs font-semibold text-primary">What it never does</p>
          <ul className="mt-2 space-y-1.5">
            {NEVER.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <X className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <DialogFooter className="gap-2 sm:gap-2">
        <Button variant="outline" onClick={onDecline}>Not now</Button>
        <Button disabled={picked.length === 0} onClick={() => onAccept(picked)}>
          {picked.length === SAHAYAK_ACCESS.length
            ? "Allow all and turn on"
            : `Turn on with ${picked.length} of ${SAHAYAK_ACCESS.length}`}
        </Button>
      </DialogFooter>
    </>
  );
}

export function SahayakConsentDialog({
  open,
  selected,
  onAccept,
  onDecline,
}: {
  open: boolean;
  selected: SahayakAccessId[];
  onAccept: (ids: SahayakAccessId[]) => void;
  onDecline: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onDecline(); }}>
      <DialogContent className="sm:max-w-md">
        {open && <ConsentBody selected={selected} onAccept={onAccept} onDecline={onDecline} />}
      </DialogContent>
    </Dialog>
  );
}
