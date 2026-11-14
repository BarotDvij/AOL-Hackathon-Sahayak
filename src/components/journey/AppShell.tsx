import { Link } from "@tanstack/react-router";
import { Inbox, Route as RouteIcon, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { useJourney } from "@/lib/journey/store";
import { JOURNEY_CONFIG } from "@/lib/journey/config";

export function AppShell({ children }: { children: ReactNode }) {
  const { pending } = useJourney();
  const linkCls = "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-ring";
  const active = { className: "bg-sidebar-accent text-sidebar-accent-foreground" };
  const nav = (
    <>
      <Link to="/" className={linkCls} activeProps={active} activeOptions={{ exact: true }}>
        <RouteIcon className="size-4" aria-hidden /> Journey
      </Link>
      <Link to="/review" className={linkCls} activeProps={active}>
        <Inbox className="size-4" aria-hidden /> Review queue
        <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground" aria-label={`${pending.length} pending`}>{pending.length}</span>
      </Link>
    </>
  );
  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-5 md:flex md:sticky md:top-0 md:h-screen">
        <div className="mb-8 flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full bg-secondary text-primary-strong"><Sun className="size-5" aria-hidden /></span>
          <div>
            <p className="font-display text-lg leading-tight">Journey</p>
            <p className="text-xs text-muted-foreground">Companion</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1" aria-label="Main">{nav}</nav>
        <p className="mt-auto text-xs text-muted-foreground">Signed in as {JOURNEY_CONFIG.coordinatorName}</p>
      </aside>
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-sidebar-border bg-sidebar px-4 py-2 md:hidden">
        <Sun className="size-5 text-primary-strong" aria-hidden />
        <nav className="flex flex-1 gap-1" aria-label="Main">{nav}</nav>
      </header>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
