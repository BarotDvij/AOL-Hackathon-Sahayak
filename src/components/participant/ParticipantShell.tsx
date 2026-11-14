import { Link, useRouterState, type LinkProps } from "@tanstack/react-router";
import { CalendarDays, Home, MessageCircle, Route as JourneyIcon, Settings, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/me", label: "Home", Icon: Home, exact: true },
  { to: "/me/journey", label: "My journey", Icon: JourneyIcon },
  { to: "/me/messages", label: "Messages", Icon: MessageCircle },
  { to: "/me/settings", label: "Settings", Icon: Settings },
] satisfies { to: LinkProps["to"]; label: string; Icon: typeof Home; exact?: boolean }[];

export function ParticipantShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link to="/me" className="flex items-center gap-2 font-heading text-base font-semibold text-primary">
            <Sparkles className="size-4 text-purple" aria-hidden />Sahayak
          </Link>
          <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Participant sections">
            {NAV.map(({ to, label, exact }) => (
              <Link key={to} to={to} activeOptions={{ exact: !!exact }} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-primary" activeProps={{ className: "bg-secondary text-primary" }}>{label}</Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="rounded-full bg-stage-new px-2.5 py-1 text-xs font-medium text-stage-new-foreground">Demo · Priya</span>
            <Link to="/start" className="text-xs font-medium text-purple hover:underline">Switch view</Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-card md:hidden" aria-label="Participant sections">
        {NAV.map(({ to, label, Icon, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to);
          return <Link key={to} to={to} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium", active ? "text-purple" : "text-muted-foreground")}><Icon className="size-5" aria-hidden />{label}</Link>;
        })}
      </nav>
    </div>
  );
}

export function ParticipantCard({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-lg border border-border bg-card p-5 shadow-soft", className)}>{children}</section>;
}

export function EmptyParticipantNote({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground"><CalendarDays className="mx-auto mb-2 size-5 text-purple" aria-hidden />{children}</div>;
}
