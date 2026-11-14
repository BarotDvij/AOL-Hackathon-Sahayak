import {useLanguage} from "@/lib/journey/i18n";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useJourney } from "@/lib/journey/store";

/** The first-time question. Answering it once is what stops it coming back. */
export function SahayakIntro() {
  const {t} = useLanguage();
  const { sahayak, decideSahayak } = useJourney();

  return (
    <Dialog open={!sahayak.decided}>
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
          <Button onClick={() => decideSahayak(true)}>{t("Yes, turn on Sahayak")}</Button>
          <Button variant="outline" onClick={() => decideSahayak(false)}>{t("I will do it manually")}</Button>
        </div>

        <p className="text-xs text-muted-foreground">{t("You can change this anytime in settings.")}</p>
      </DialogContent>
    </Dialog>
  );
}
