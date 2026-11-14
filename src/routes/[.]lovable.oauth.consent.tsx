import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({ authorization_id: typeof s["authorization_id"] === "string" ? s["authorization_id"] : "" }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("This connection request is missing its authorization id.");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) throw redirect({ to: "/auth", search: { next } });
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const immediate = "redirect_url" in data ? data.redirect_url : null;
    if (immediate && !("client" in data)) throw redirect({ href: immediate });
    return data;
  },
  head: () => ({ meta: [
    { title: "Connect an assistant · Sahayak" },
    { name: "description", content: "Review and approve an AI assistant's access to your own Sahayak participant tools." },
    { property: "og:title", content: "Connect an assistant · Sahayak" },
    { property: "og:description", content: "Review and approve an AI assistant's access to your own Sahayak participant tools." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: ConsentPage,
  errorComponent: ({ error }) => <main className="flex min-h-screen items-center justify-center bg-background px-4"><div className="max-w-md rounded-lg border border-border bg-card p-6 text-center shadow-soft"><h1 className="font-display text-2xl text-primary">This connection could not be loaded</h1><p className="mt-2 text-sm text-muted-foreground">{error instanceof Error ? error.message : String(error)}</p></div></main>,
});

function ConsentPage() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!("client" in details)) return null;
  const clientName = details.client.name;

  async function decide(approve: boolean) {
    setBusy(true); setError(null);
    const { data, error: decisionError } = approve
      ? await supabase.auth.oauth.approveAuthorization(authorization_id)
      : await supabase.auth.oauth.denyAuthorization(authorization_id);
    if (decisionError) { setBusy(false); setError(decisionError.message); return; }
    const target = data?.redirect_url;
    if (!target) { setBusy(false); setError("No return address was provided. You can close this page."); return; }
    window.location.href = target;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-soft sm:p-8">
        <p className="font-heading text-xs font-semibold uppercase tracking-widest text-purple">Sahayak connection</p>
        <h1 className="mt-2 font-display text-[32px] font-normal text-primary">Connect {clientName} to Journey Companion</h1>
        <p className="mt-3 text-sm text-muted-foreground">This lets {clientName} use your participant tools as you. It can read and update only your own onboarding, practice, goals, events and approved messages.</p>
        <div className="mt-5 rounded-lg bg-secondary p-4 text-sm text-primary"><p className="font-heading font-semibold">What stays protected</p><ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground"><li>No drafts or internal journey labels</li><li>No other participant's records</li><li>No messages are sent by any tool</li></ul></div>
        {details.redirect_uri && <p className="mt-4 break-all text-xs text-muted-foreground">Return to: {details.redirect_uri}</p>}
        {error && <p role="alert" className="mt-4 rounded-lg bg-stage-dormant p-3 text-sm text-stage-dormant-foreground">{error}</p>}
        <div className="mt-6 flex flex-wrap gap-3"><Button disabled={busy} onClick={() => decide(true)}>Approve connection</Button><Button variant="outline" disabled={busy} onClick={() => decide(false)}>Cancel connection</Button></div>
      </section>
    </main>
  );
}
