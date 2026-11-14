import { useServerFn } from "@tanstack/react-start";
import { ArrowUp, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { askSahayak } from "@/lib/sahayak.functions";
import { useJourney } from "@/lib/journey/store";
import { answerFromData, SAHAYAK_CHIPS, snapshotRows, type SahayakAnswer } from "@/lib/journey/sahayak";
import { SahayakLink, SahayakTag } from "./bits";

interface ChatItem { id: string; question: string; answer: SahayakAnswer }

/** The floating "Ask Sahayak" panel: questions are answered from the coordinator's own records. */
export function SahayakChat() {
  const { sahayak, views, upcoming, inbox, catalog } = useJourney();
  const ask = useServerFn(askSahayak);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ChatItem[]>([]);
  const [q, setQ] = useState("");
  const [thinking, setThinking] = useState(false);

  if (!sahayak.on) return null;

  const send = async (question: string) => {
    const text = question.trim();
    if (!text || thinking) return;
    const id = `c${items.length + 1}`;
    // The answer built from the records is shown at once; the model only rewords it if it is reachable.
    setItems((all) => [...all, { id, question: text, answer: answerFromData(text, views, upcoming, inbox) }]);
    setQ("");
    setThinking(true);
    try {
      const res = await ask({ data: { question: text, rows: snapshotRows(views, catalog) } });
      const ai = res.text;
      if (ai) setItems((all) => all.map((it) => (it.id === id ? { ...it, answer: { ...it.answer, text: ai } } : it)));
    } catch {
      // The record-based answer already on screen stands as the fallback.
    } finally {
      setThinking(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 font-heading text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]"
      >
        <Sparkles className="size-4" aria-hidden />
        Ask Sahayak
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:w-[420px] sm:max-w-[420px]">
          <div className="border-b border-border px-6 py-5">
            <SheetTitle className="font-display text-[22px] font-normal text-primary">Ask Sahayak</SheetTitle>
            <SheetDescription className="mt-1 text-sm text-muted-foreground">
              Ask about your participants. Sahayak only reads your records — it never sends anything.
            </SheetDescription>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-border px-6 py-3">
            {SAHAYAK_CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => void send(c)}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-purple hover:text-purple"
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {items.length === 0 ? (
              <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                Ask a question, or tap one of the suggestions above.
              </p>
            ) : (
              items.map((it) => <Answer key={it.id} item={it} />)
            )}
            {thinking && <p className="text-xs text-muted-foreground">Sahayak is looking through your records…</p>}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); void send(q); }} className="flex items-center gap-2 border-t border-border px-6 py-4">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ask about your participants"
              aria-label="Ask Sahayak a question"
              className="bg-card"
            />
            <Button type="submit" size="icon" aria-label="Send question" disabled={!q.trim()}>
              <ArrowUp className="size-4" aria-hidden />
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

function Answer({ item }: { item: ChatItem }) {
  return (
    <div className="space-y-2">
      <p className="ml-auto w-fit rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">{item.question}</p>
      <div className="rounded-lg border border-border bg-card p-3.5 shadow-soft">
        <p className="text-sm leading-relaxed text-foreground">{item.answer.text}</p>

        {item.answer.rows.length > 0 && (
          <ul className="mt-2.5 divide-y divide-border overflow-hidden rounded-lg border border-border">
            {item.answer.rows.map((r) => (
              <li key={r.name} className="flex items-baseline justify-between gap-3 bg-background px-3 py-2">
                <span className="min-w-0 truncate text-sm font-medium text-foreground">{r.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{r.detail}</span>
              </li>
            ))}
          </ul>
        )}

        {item.answer.action && (
          <SahayakLink to={item.answer.action.to} className="mt-2.5 block w-fit text-xs font-semibold text-purple hover:underline">
            {item.answer.action.label}
          </SahayakLink>
        )}

        <SahayakTag className="mt-2 block w-fit" />
      </div>
    </div>
  );
}
