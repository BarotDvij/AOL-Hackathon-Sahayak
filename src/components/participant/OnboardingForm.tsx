import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ONBOARDING_QUESTIONS, type OnboardingAnswers } from "@/lib/sahayak/core";
import { cn } from "@/lib/utils";

export function OnboardingForm({ initialAnswers, onSave }: { initialAnswers: OnboardingAnswers; onSave: (answers: OnboardingAnswers) => void | Promise<void> }) {
  const [answers, setAnswers] = useState<OnboardingAnswers>(initialAnswers);
  const [index, setIndex] = useState(0);
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const question = ONBOARDING_QUESTIONS[index];

  async function save() {
    setBusy(true); setError(null);
    try {
      await onSave(Object.fromEntries(Object.entries(answers).filter((entry): entry is [string, string] => typeof entry[1] === "string")));
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
            const answer = q.options.find((option) => option.value === answers[q.id]);
            return <div key={q.id} className="py-3"><dt className="text-sm text-muted-foreground">{q.text}</dt><dd className="mt-1 text-sm font-medium text-primary">{answer?.label ?? "Skipped"}</dd></div>;
          })}
        </dl>
        <div className="mt-4 flex flex-wrap gap-2"><Button disabled={busy} onClick={save}>{busy ? "Saving…" : "Confirm and save"}</Button><Button variant="outline" onClick={() => setReview(false)}>Go back</Button></div>
        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  if (!question) return null;

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">Question {index + 1} of {ONBOARDING_QUESTIONS.length} · optional</p>
      <h3 className="mt-2 font-heading text-base font-semibold text-primary">{question.text}</h3>
      <RadioGroup aria-label={question.text} value={answers[question.id] ?? ""} onValueChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))} className="mt-4 divide-y divide-border gap-0">
        {question.options.map((option) => (
          <label key={option.value} className={cn("flex cursor-pointer items-center gap-3 px-2 py-3 text-sm transition-colors hover:bg-secondary/50", answers[question.id] === option.value ? "bg-secondary font-medium text-purple" : "text-foreground")}><RadioGroupItem value={option.value} />{option.label}</label>
        ))}
      </RadioGroup>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {index > 0 && <Button variant="outline" onClick={() => setIndex((current) => current - 1)}>Back</Button>}
        <Button onClick={() => index === ONBOARDING_QUESTIONS.length - 1 ? setReview(true) : setIndex((current) => current + 1)}>{index === ONBOARDING_QUESTIONS.length - 1 ? "Review answers" : "Continue"}</Button>
        <Button variant="accent" onClick={() => { setAnswers((current) => { const next = { ...current }; delete next[question.id]; return next; }); index === ONBOARDING_QUESTIONS.length - 1 ? setReview(true) : setIndex((current) => current + 1); }}>Skip</Button>
      </div>
    </div>
  );
}
