import { Link } from "@tanstack/react-router";
import { History, Inbox, LayoutDashboard, Menu, Settings, Users } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useJourney } from "@/lib/journey/store";
import { cn } from "@/lib/utils";

type To = "/" | "/participants" | "/review" | "/activity" | "/settings";
type NavItem = { to: To; label: string; Icon: typeof LayoutDashboard; exact?: boolean };

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { to: "/participants", label: "Participants", Icon: Users },
  { to: "/review", label: "Review Queue", Icon: Inbox },
  { to: "/activity", label: "Activity Log", Icon: History },
  { to: "/settings", label: "Settings", Icon: Settings },
];

function NavItemLink({ to, label, Icon, exact, waiting, onNavigate }: NavItem & { waiting?: number | undefined; onNavigate?: () => void }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: !!exact }}
      onClick={onNavigate}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      activeProps={{ className: "bg-secondary text-primary font-semibold" }}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="flex-1 truncate">{label}</span>
      {waiting ? <span className="rounded-full bg-sun-orange px-1.5 text-[11px] font-semibold leading-4 tabular-nums text-primary">{waiting}</span> : null}
    </Link>
  );
}

/** The coordinator's frame: a fixed 240px sidebar on wide screens, a slide-out menu on phones. */
export function AppShell({ children }: { children: ReactNode }) {
  const { summary } = useJourney();
  const [open, setOpen] = useState(false);
  const waiting = summary.waiting;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-border bg-card lg:flex">
        <div className="brand-gradient border-b border-border px-5 py-5">
          <Link to="/" className="font-heading text-base font-semibold tracking-tight text-primary">Journey Companion</Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Sections">
          {NAV.map((n) => <NavItemLink key={n.to} {...n} waiting={n.to === "/review" ? waiting : undefined} />)}
        </nav>
        <p className="px-5 py-4 text-xs leading-relaxed text-muted-foreground">Nothing is ever sent without you approving it.</p>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <Link to="/" className="font-heading text-base font-semibold tracking-tight text-primary">Journey Companion</Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button type="button" aria-label="Open menu" className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-secondary">
              <Menu className="size-4" aria-hidden />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] gap-0 p-0 sm:max-w-[240px]">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="brand-gradient border-b border-border px-5 py-5 font-heading text-base font-semibold tracking-tight text-primary">Journey Companion</div>
            <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Sections">
              {NAV.map((n) => <NavItemLink key={n.to} {...n} waiting={n.to === "/review" ? waiting : undefined} onNavigate={() => setOpen(false)} />)}
            </nav>
            <p className="px-5 py-4 text-xs leading-relaxed text-muted-foreground">Nothing is ever sent without you approving it.</p>
          </SheetContent>
        </Sheet>
      </header>

      <main className="lg:pl-[240px]">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}

/** Keeps the sheet's close button from being the only way out on wide screens. */
export function PanelClose({ children }: { children: ReactNode }) {
  return <SheetClose asChild>{children}</SheetClose>;
}
