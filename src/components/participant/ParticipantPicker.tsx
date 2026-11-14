import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { claimMyParticipant } from "@/lib/participant.functions";

interface Option { id: string; firstName: string; lastName: string; city: string }

/** Demo identity linking happens only after sign-in; subsequent reads use that account link. */
export function ParticipantPicker({ options }: { options: Option[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function choose(id: string) {
    setBusy(id); setError(null);
    try {
      await claimMyParticipant({ data: { participantId: id } });
      await navigate({ to: "/me", replace: true });
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
      setBusy(null);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <p className="font-heading text-xs font-semibold uppercase tracking-wide text-purple">Your participant space</p>
        <h1 className="mt-2 font-display text-[32px] font-normal text-primary">Choose a sample journey</h1>
        <p className="mt-2 text-sm text-muted-foreground">For this demo, link your signed-in account to one fictional participant. You will only see that person's records.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {options.map((p) => (
            <article key={p.id} className="rounded-lg border border-border bg-card p-5 shadow-soft">
              <h2 className="font-heading text-base font-semibold text-primary">{p.firstName} {p.lastName}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{p.city} · Sample participant</p>
              <Button className="mt-4 w-full" disabled={busy !== null} onClick={() => choose(p.id)}>{busy === p.id ? "Linking…" : `Continue as ${p.firstName}`}</Button>
            </article>
          ))}
        </div>
        {error && <p role="alert" className="mt-4 rounded-lg bg-stage-dormant p-3 text-sm text-stage-dormant-foreground">{error}</p>}
      </div>
    </main>
  );
}
