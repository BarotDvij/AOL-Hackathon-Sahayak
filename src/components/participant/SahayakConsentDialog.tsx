import { Check, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ACCESS = [
  "Your practice log — what you have practised and the days you log",
  "Your goals and the practice rhythm you saved",
  "Your upcoming events and calendar links",
  "Messages your coordinator already approved for you",
  "A summary you approve, shared with your coordinator and marked \u201cvia Muse\u201d",
];

const NEVER = [
  "It never sends a message to anyone",
  "It never shows your records to another participant",
  "You can turn it off any time, right from this sidebar",
];

export function SahayakConsentDialog({ open, onAccept, onDecline }: { open: boolean; onAccept: () => void; onDecline: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onDecline(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-[22px] font-normal text-primary">Before Muse helps with your practice</DialogTitle>
          <DialogDescription>Muse can only use the parts of your journey listed here. Nothing is sent to anyone.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="flex items-center gap-1.5 font-heading text-xs font-semibold text-purple"><ShieldCheck className="size-3.5" aria-hidden />What Muse can use</p>
            <ul className="mt-2 space-y-1.5">
              {ACCESS.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-primary">
                  <Check className="mt-0.5 size-4 shrink-0 text-purple" aria-hidden />{item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-secondary/60 p-3">
            <p className="font-heading text-xs font-semibold text-primary">What it never does</p>
            <ul className="mt-2 space-y-1.5">
              {NEVER.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <X className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onDecline}>Not now</Button>
          <Button onClick={onAccept}>Yes, allow and turn on</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
