import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ONBOARDING_QUESTIONS, type OnboardingAnswers } from "@/lib/sahayak/core";
import { saveMyOnboarding } from "@/lib/participant.functions";
import { cn } from "@/lib/utils";

export function OnboardingForm({ initialAnswers }: { initialAnswers: OnboardingAnswers }) {
  const [answers, setAnswers] = useState<OnboardingAnswers>(initialAnswers);
  const [index, setIndex] = useState(0);
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const question = ONBOARDING_QUESTIONS[index]!;

  async function save() {
    setBusy(true); setError(null);
    try {
      await saveMyOnboarding({ data: { answers: Object.fromEntries(Object.entries(answers).filter((entry): entry is [string, string] => typeof entry[1] === "string")) } });
      await router.invalidate();
      setReview(false); setIndex(0);
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); }
    finally { setBusy(false); }
  }

  if (review) {
    return (
      <div>
        <h3 className="font-heading text-base font-semibold text-primary">Does this look right?</h3>
        <dl className="mt-4 divide-y divide-border">
          {ONBOARDING_QUESTIONS.map((q) => {
            const answer = q.options.find((o) => o.value === answers[q.id]);
            return <div key={q.id} className="py-3"><dt className="text-sm text-muted-foreground">{q.text}</dt><dd className="mt-1 text-sm font-medium text-primary">{answer?.label ?? "Skipped"}</dd></div>;
          })}
        </dl>
        <div className="mt-4 flex flex-wrap gap-2"><Button disabled={busy} onClick={save}>{busy ? "Saving…" : "Confirm and save"}</Button><Button variant="outline" onClick={() => setReview(false)}>Go back</Button></div>
        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">Question {index + 1} of {ONBOARDING_QUESTIONS.length} · optional</p>
      <h3 className="mt-2 font-heading text-base font-semibold text-primary">{question.text}</h3>
      <div className="mt-4 grid gap-2">
        {question.options.map((o) => (
          <button key={o.value} type="button" aria-pressed={answers[question.id] === o.value} onClick={() => setAnswers((a) => ({ ...a, [question.id]: o.value }))} className={cn("rounded-lg border px-4 py-3 text-left text-sm", answers[question.id] === o.value ? "border-purple bg-secondary font-medium text-purple" : "border-border bg-card text-foreground")}>{o.label}</button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {index > 0 && <Button variant="outline" onClick={() => setIndex((i) => i - 1)}>Back</Button>}
        <Button onClick={() => index === ONBOARDING_QUESTIONS.length - 1 ? setReview(true) : setIndex((i) => i + 1)}>{index === ONBOARDING_QUESTIONS.length - 1 ? "Review answers" : "Continue"}</Button>
        <Button variant="accent" onClick={() => { setAnswers((a) => { const next = { ...a }; delete next[question.id]; return next; }); index === ONBOARDING_QUESTIONS.length - 1 ? setReview(true) : setIndex((i) => i + 1); }}>Skip</Button>
      </div>
    </div>
  );
}
