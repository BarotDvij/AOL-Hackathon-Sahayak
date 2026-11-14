import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { oauthReturnPath } from "@/lib/oauth-return-path";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({ next: typeof search["next"] === "string" ? search["next"] : "/me" }),
  beforeLoad: async ({ search }) => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ href: oauthReturnPath(search.next) });
  },
  head: () => ({ meta: [
    { title: "Participant sign in · Sahayak" },
    { name: "description", content: "Sign in securely to your own Sahayak participant journey or create an account." },
    { property: "og:title", content: "Participant sign in · Sahayak" },
    { property: "og:description", content: "Sign in securely to your own Sahayak participant journey or create an account." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(null); setMessage(null);
    const target = oauthReturnPath(next);
    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) { setError(signInError.message); setBusy(false); return; }
      await navigate({ href: target });
      return;
    }
    const { error: signUpError } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: new URL(target, window.location.origin).href } });
    setBusy(false);
    if (signUpError) { setError(signUpError.message); return; }
    setMessage("Check your email to confirm your account, then come back to sign in.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-soft sm:p-8">
        <p className="font-heading text-xs font-semibold uppercase tracking-widest text-purple">Sahayak</p>
        <h1 className="mt-2 font-display text-[32px] font-normal text-primary">{mode === "signin" ? "Welcome back" : "Create your participant account"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your sign-in keeps your journey and Muse connection private to you.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><label htmlFor="email" className="mb-1 block text-sm font-medium text-primary">Email</label><Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label htmlFor="password" className="mb-1 block text-sm font-medium text-primary">Password</label><Input id="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {error && <p role="alert" className="rounded-lg bg-stage-dormant p-3 text-sm text-stage-dormant-foreground">{error}</p>}
          {message && <p role="status" className="rounded-lg bg-stage-new p-3 text-sm text-stage-new-foreground">{message}</p>}
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</Button>
        </form>
        <button type="button" className="mt-5 w-full text-center text-sm font-medium text-purple hover:underline" onClick={() => { setMode((m) => m === "signin" ? "signup" : "signin"); setError(null); setMessage(null); }}>{mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}</button>
      </section>
    </main>
  );
}
