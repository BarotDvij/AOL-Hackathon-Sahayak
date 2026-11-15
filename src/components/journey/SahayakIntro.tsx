import {useLanguage} from "@/lib/journey/i18n";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useJourney } from "@/lib/journey/store";

/**
 * What Sahayak does, shown only when the coordinator asks for it from the sidebar.
 * It never opens on its own.
 */
export function SahayakIntro({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const {t} = useLanguage();
  const { sahayak, decideSahayak } = useJourney();

  const choose = (on: boolean) => {
    decideSahayak(on);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-[26px] font-normal text-primary">
            {t("Meet Sahayak, your follow-up helper")}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Sahayak means helper. It looks over your participants each day, tells you who is waiting for a
            reply and who is drifting away, and writes messages you can read and approve. Nothing is ever
            sent without you.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-wrap gap-2">
          <Button onClick={() => choose(true)}>{t("Yes, turn on Sahayak")}</Button>
          <Button variant="outline" onClick={() => choose(false)}>{t("I will do it manually")}</Button>
        </div>

        <p className="text-xs text-muted-foreground">
          {sahayak.decided ? t("You can change this anytime in settings.") : t("You can change this anytime in settings.")}
        </p>
      </DialogContent>
    </Dialog>
  );
}
