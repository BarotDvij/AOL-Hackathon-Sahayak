import { Link, useRouterState, type LinkProps } from "@tanstack/react-router";
import { CalendarDays, Home, Route as JourneyIcon, Sparkles, MessageSquare } from "lucide-react";
import type { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { useDemoParticipant } from "@/components/participant/DemoParticipantContext";
import { cn } from "@/lib/utils";
import { ParticipantMessageBox } from "./ParticipantMessageBox";
import { DemoAccount } from '@/components/journey/DemoAccount';

const NAV = [
  { to: "/me/journey", label: "My Journey", Icon: JourneyIcon, exact:false },
  { to: "/me/sessions", label: "Upcoming Sessions", Icon: CalendarDays, exact:false },
  { to: "/me/messages", label: "Messages", Icon: MessageSquare, exact:false },
] satisfies { to: LinkProps["to"]; label: string; Icon: typeof Home; exact?: boolean }[];

export function ParticipantShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { sahayakOn, sahayakAccess, requestSahayak } = useDemoParticipant();

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-border bg-card md:flex">
        <div className="brand-gradient border-b border-border px-5 py-5">
          <Link to="/me" className="font-heading text-base font-semibold text-primary">Journey</Link>
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
      <div className="md:pl-[240px]">
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="flex min-h-12 items-center gap-3 px-4 py-3 sm:px-6 lg:px-8 lg:py-2">
          <Link to="/me" className="font-heading text-sm font-semibold text-primary md:hidden">Journey</Link>
          <span className="hidden items-center gap-1.5 text-xs font-medium text-purple md:inline-flex"><Sparkles className="size-3.5" aria-hidden />Your Sahayak journey</span>
          <div className="ml-auto min-w-0">
            <DemoAccount />
          </div>
        </div>
      </header>
      <main className="app-page mx-auto w-full max-w-[1280px] px-4 pb-8 pt-6 sm:px-6 lg:px-8 lg:pt-8">{children}</main>
      </div>
      <ParticipantMessageBox />
      <nav className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-border bg-card md:hidden" aria-label="Participant sections">
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
