import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, LayoutDashboard, UserRound } from "lucide-react";

export const Route = createFileRoute("/start")({
  head: () => ({ meta: [
    { title: "Choose your view · Journey Companion" },
    { name: "description", content: "Open your personal Sahayak journey or the Journey Companion coordinator dashboard." },
    { property: "og:title", content: "Choose your view · Journey Companion" },
    { property: "og:description", content: "Open your personal Sahayak journey or the Journey Companion coordinator dashboard." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: StartPage,
});

function StartPage() {
  return (
    <main className="flex min-h-screen items-center bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <p className="font-heading text-xs font-semibold uppercase tracking-widest text-purple">Journey Companion</p>
        <h1 className="mt-3 font-display text-[32px] font-normal text-primary">How would you like to begin?</h1>
        <p className="mt-2 text-sm text-muted-foreground">A calm space for your own practice, or a clear view of the people you support.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link to="/me" className="group rounded-lg border border-border bg-card p-6 shadow-soft transition-colors hover:border-purple">
            <UserRound className="size-7 text-purple" aria-hidden /><h2 className="mt-5 font-heading text-lg font-semibold text-primary">I'm a participant</h2><p className="mt-2 text-sm text-muted-foreground">Your practice, journey, goals and approved messages.</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-purple">Open Sahayak <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden /></span>
          </Link>
          <Link to="/" className="group rounded-lg border border-border bg-card p-6 shadow-soft transition-colors hover:border-purple">
            <LayoutDashboard className="size-7 text-purple" aria-hidden /><h2 className="mt-5 font-heading text-lg font-semibold text-primary">I'm a coordinator</h2><p className="mt-2 text-sm text-muted-foreground">Review follow-ups and support your centre's participants.</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-purple">Open dashboard <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden /></span>
          </Link>
        </div>
      </div>
    </main>
  );
}
