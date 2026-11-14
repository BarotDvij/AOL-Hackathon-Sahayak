import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useJourney } from "@/lib/journey/store";
import { SahayakLink, SahayakTag } from "./bits";

/** The bell panel: everything Sahayak thinks might be forgotten, with Do it now / Snooze / Dismiss. */
export function RemindersPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { reminders, snoozeReminder, dismissReminder } = useJourney();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:w-[420px] sm:max-w-[420px]">
        <div className="border-b border-border px-6 py-5">
          <SheetTitle className="font-display text-[22px] font-normal text-primary">Sahayak reminders</SheetTitle>
          <SheetDescription className="mt-1 text-sm text-muted-foreground">
            Things you might otherwise forget. Nothing here sends itself.
          </SheetDescription>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
          {reminders.length === 0 ? (
            <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              Nothing needs you right now. Sahayak will keep watching and tell you when something changes.
            </p>
          ) : (
            reminders.map((r) => (
              <article key={r.id} className="rounded-lg border border-border bg-card p-4 shadow-soft">
                <p className="text-sm font-medium text-foreground">{r.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{r.why}</p>
                <SahayakTag className="mt-2" />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <SahayakLink to={r.to}>
                    <Button size="sm">{r.actionLabel}</Button>
                  </SahayakLink>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline"><Clock className="size-3.5" aria-hidden />Snooze</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => snoozeReminder(r.id, 1)}>1 day</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => snoozeReminder(r.id, 3)}>3 days</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => snoozeReminder(r.id, 7)}>1 week</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button size="sm" variant="ghost" onClick={() => dismissReminder(r.id)}>
                    <X className="size-3.5" aria-hidden />Dismiss
                  </Button>
                </div>
              </article>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
