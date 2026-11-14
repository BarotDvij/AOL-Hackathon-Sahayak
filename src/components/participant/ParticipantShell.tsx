import { Link, useRouterState, type LinkProps } from "@tanstack/react-router";
import { CalendarDays, Home, MessageCircle, Route as JourneyIcon, Settings, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { useDemoParticipant } from "@/components/participant/DemoParticipantContext";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/me", label: "Home", Icon: Home, exact: true },
  { to: "/me/journey", label: "My journey", Icon: JourneyIcon },
  { to: "/me/messages", label: "Messages", Icon: MessageCircle },
  { to: "/me/settings", label: "Settings", Icon: Settings },
] satisfies { to: LinkProps["to"]; label: string; Icon: typeof Home; exact?: boolean }[];

export function ParticipantShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { sahayakOn, sahayakAccess, requestSahayak } = useDemoParticipant();

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-border bg-card lg:flex">
        <div className="brand-gradient border-b border-border px-5 py-5">
          <Link to="/me" className="font-heading text-base font-semibold text-primary">Journey Companion</Link>
        </div>
        <div className="mx-3 mt-3 rounded-lg border border-border bg-secondary/60 p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-purple" aria-hidden />
            <span className="font-heading text-sm font-semibold text-primary">Sahayak</span>
            <Switch className="ml-auto" aria-label="Use Sahayak with Muse" checked={sahayakOn} onCheckedChange={requestSahayak} />
          </div>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            {sahayakOn ? `Lives in your Muse · on, ${sahayakAccess.length} of 5 allowed` : "Your Sahayak lives in your Muse. Turn it on to let it help."}
          </p>
        </div>
        <nav className="mt-2 flex flex-1 flex-col gap-1 px-3" aria-label="Participant sections">
          {NAV.map(({ to, label, Icon, exact }) => (
            <Link key={to} to={to} activeOptions={{ exact: !!exact }} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" activeProps={{ className: "bg-secondary font-semibold text-primary" }}>
              <Icon className="size-4 shrink-0" aria-hidden />{label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-[240px]">
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="flex min-h-12 items-center gap-3 px-4 py-3 sm:px-6 lg:px-8 lg:py-2">
          <Link to="/me" className="font-heading text-sm font-semibold text-primary lg:hidden">Journey Companion</Link>
          <span className="hidden items-center gap-1.5 text-xs font-medium text-purple lg:inline-flex"><Sparkles className="size-3.5" aria-hidden />Your Sahayak journey</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden rounded-full bg-stage-new px-2 py-0.5 text-xs font-medium text-stage-new-foreground sm:inline-flex">Demo · Priya</span>
            <Link to="/start" className="shrink-0 text-xs font-medium text-purple hover:underline">Switch view</Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-8 pt-6 sm:px-6 lg:px-8 lg:pt-8">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-card lg:hidden" aria-label="Participant sections">
        {NAV.map(({ to, label, Icon, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to);
          return <Link key={to} to={to} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors", active ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary")}><Icon className="size-5" aria-hidden />{label}</Link>;
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
