import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCoordinatorSummaries } from "@/lib/participant.functions";

interface Summary { id: string; text: string; source: string; createdAt: string }

/** Loaded only for a signed-in coordinator role; anonymous demo sessions never receive summaries. */
export function CoordinatorSummaries({ participantId }: { participantId: string }) {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      try {
        const result = await getCoordinatorSummaries({ data: { participantId } });
        if (active) setSummaries(result.summaries);
      } catch { if (active) setSummaries([]); }
    });
    return () => { active = false; };
  }, [participantId]);

  if (!summaries.length) return null;
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h3 className="flex items-center gap-1.5 font-heading text-sm font-semibold text-primary"><Sparkles className="size-4 text-purple" aria-hidden />Participant summaries</h3>
      <div className="mt-3 space-y-3">{summaries.map((s) => <article key={s.id} className="rounded-lg bg-secondary p-3"><span className="text-[11px] font-semibold text-purple">{s.source}</span><p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{s.text}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}</p></article>)}</div>
    </section>
  );
}
