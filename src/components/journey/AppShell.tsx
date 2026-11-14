import { Link } from "@tanstack/react-router";
import { History, Inbox, LayoutDashboard } from "lucide-react";
import type { ReactNode } from "react";
import { useJourney } from "@/lib/journey/store";
import { cn } from "@/lib/utils";

type To = "/" | "/review" | "/activity";
type NavItem = { to: To; label: string; short: string; Icon: typeof LayoutDashboard; exact?: boolean };

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", short: "Dashboard", Icon: LayoutDashboard, exact: true },
  { to: "/review", label: "Review queue", short: "Review", Icon: Inbox },
  { to: "/activity", label: "Activity", short: "Activity", Icon: History },
];

function NavLink({ to, label, short, Icon, exact, mobile, waiting }: NavItem & { mobile?: boolean; waiting?: number }) {
  return (
    <Link
      to={to}
      activeOptions={exact ? { exact: true } : undefined}
      className={cn(
        "relative flex flex-1 flex-col items-center gap-1 px-2 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground md:flex-none md:flex-row md:gap-2 md:rounded-full md:px-4 md:py-1.5 md:text-sm",
      )}
      activeProps={{ className: "bg-secondary text-primary-strong md:bg-secondary" }}
    >
      <Icon className="size-4 md:hidden" aria-hidden />
      <span>{mobile ? short : label}</span>
      {waiting ? <span className="absolute right-1 top-1 rounded-full bg-primary px-1.5 text-[10px] font-semibold leading-4 text-primary-foreground md:static md:ml-1">{waiting}</span> : null}
    </Link>
  );
}

/** The coordinator's frame: wordmark, section links on top, a thumb-friendly bar on phones. */
export function AppShell({ children }: { children: ReactNode }) {
  const { summary } = useJourney();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/92 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
          <Link to="/" className="font-display text-lg font-semibold tracking-tight text-foreground">Journey Companion</Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Sections">
            {NAV.map((n) => <NavLink key={n.to} {...n} waiting={n.to === "/review" ? summary.waiting : undefined} />)}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 pb-28 pt-6 md:pb-12">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-border bg-card/95 backdrop-blur md:hidden" aria-label="Sections">
        {NAV.map((n) => <NavLink key={n.to} {...n} mobile waiting={n.to === "/review" ? summary.waiting : undefined} />)}
      </nav>
    </div>
  );
}
