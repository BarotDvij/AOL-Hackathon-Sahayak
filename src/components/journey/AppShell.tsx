import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, CalendarDays, UserRound, Bell, BookOpen, History, Inbox, LayoutDashboard, Mail, Menu, Settings, Sparkles, Users } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { needsReply } from "@/lib/journey/inbox-seed";
import { useJourney } from "@/lib/journey/store";
import { useLanguage } from "@/lib/journey/i18n";
import { cn } from "@/lib/utils";
import { RemindersPanel } from "./RemindersPanel";
import { SahayakChat } from "./SahayakChat";
import { SahayakIntro } from "./SahayakIntro";

type To = "/" | "/impact" | "/sessions" | "/team" | "/participants" | "/programs" | "/review" | "/inbox" | "/activity" | "/settings";
type NavItem = { to: To; label: string; Icon: typeof LayoutDashboard; exact?: boolean; alsoActive?: string };

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { to: "/participants", label: "Participants", Icon: Users },
  { to: "/impact", label: "Impact", Icon: BarChart3 },
  { to: "/sessions", label: "Sessions", Icon: CalendarDays },
  { to: "/team", label: "Team", Icon: UserRound },
  { to: "/programs", label: "Programs", Icon: BookOpen },
  { to: "/review", label: "Review Queue", Icon: Inbox },
  { to: "/inbox", label: "Inbox", Icon: Mail },
  { to: "/activity", label: "Activity Log", Icon: History },
  { to: "/settings", label: "Settings", Icon: Settings, alsoActive: "/sahayak" },
];

function NavItemLink({ to, label, Icon, exact, alsoActive, waiting, onNavigate }: NavItem & { waiting?: number | undefined; onNavigate?: () => void }) {
  const {t} = useLanguage();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const highlight = !!alsoActive && pathname.startsWith(alsoActive);

  return (
    <Link
      to={to}
      activeOptions={{ exact: !!exact }}
      onClick={onNavigate}
      className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
        highlight && "bg-secondary font-semibold text-primary")}
      activeProps={{ className: "bg-secondary text-primary font-semibold" }}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="flex-1 truncate">{t(label)}</span>
      {waiting ? <span className="rounded-full bg-sun-orange px-1.5 text-[11px] font-semibold leading-4 tabular-nums text-primary">{waiting}</span> : null}
    </Link>
  );
}

/** The one place Sahayak is turned on or off without leaving the page. */
function SahayakSwitch({ onNavigate, onMeet }: { onNavigate?: () => void; onMeet: () => void }) {
  const {t} = useLanguage();
  const { sahayak, setSahayakOn } = useJourney();
  return (
    <div className="mx-3 mt-3 rounded-lg border border-border bg-secondary/60 p-3">
      <div className="flex items-center gap-2">
        <Sparkles className={cn("size-4 shrink-0", sahayak.on ? "text-purple" : "text-muted-foreground")} aria-hidden />
        <span className="min-w-0 flex-1 truncate font-heading text-sm font-semibold text-primary">Sahayak</span>
        <span className="text-xs font-medium text-muted-foreground">{t(sahayak.on ? "On" : "Off")}</span>
        <Switch checked={sahayak.on} onCheckedChange={setSahayakOn} aria-label="Turn Sahayak on or off" />
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <button type="button" onClick={onMeet} className="text-xs font-medium text-purple hover:underline">
          {t("Meet Sahayak")}
        </button>
        <Link
          to="/sahayak"
          onClick={onNavigate}
          className="text-xs font-medium text-purple hover:underline"
        >
          {t("Sahayak settings")}
        </Link>
      </div>
    </div>
  );
}

function BellButton({ count, onClick, className }: { count: number; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={count > 0 ? `Sahayak reminders, ${count} waiting` : "Sahayak reminders, none waiting"}
      className={cn("relative grid size-9 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground", className)}
    >
      <Bell className="size-4" aria-hidden />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 grid min-w-[18px] place-items-center rounded-full bg-sun-orange px-1 text-[10px] font-semibold leading-[18px] tabular-nums text-primary">
          {count}
        </span>
      )}
    </button>
  );
}

/** The coordinator's frame: a fixed 240px sidebar on wide screens, a slide-out menu on phones. */
export function AppShell({ children }: { children: ReactNode }) {
  const {t} = useLanguage();
  const { summary, sahayak, reminders, inbox } = useJourney();
  const [open, setOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const waiting = summary.waiting;
  const unread = sahayak.on ? inbox.filter(needsReply).length : 0;
  const badgeFor = (to: To) => (to === "/review" ? waiting : to === "/inbox" ? unread : undefined);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-border bg-card lg:flex">
        <div className="brand-gradient border-b border-border px-5 py-5">
          <Link to="/" className="font-heading text-base font-semibold tracking-tight text-primary">Journey Companion</Link>
        </div>
        <SahayakSwitch onMeet={() => setIntroOpen(true)} />
        <nav className="mt-2 flex flex-1 flex-col gap-1 px-3" aria-label="Sections">
          {NAV.map((n) => <NavItemLink key={n.to} {...n} waiting={badgeFor(n.to)} />)}
        </nav>
        <p className="px-5 py-4 text-xs leading-relaxed text-muted-foreground">{t("Nothing is ever sent without you approving it.")}</p>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-3 lg:hidden">
        <Link to="/" className="font-heading text-base font-semibold tracking-tight text-primary">Journey Companion</Link>
        <div className="flex items-center gap-2">
          {sahayak.on && <BellButton count={reminders.length} onClick={() => setRemindersOpen(true)} />}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button type="button" aria-label="Open menu" className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-secondary">
                <Menu className="size-4" aria-hidden />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] gap-0 p-0 sm:max-w-[240px]">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="brand-gradient border-b border-border px-5 py-5 font-heading text-base font-semibold tracking-tight text-primary">Journey Companion</div>
              <SahayakSwitch onNavigate={() => setOpen(false)} onMeet={() => { setOpen(false); setIntroOpen(true); }} />
              <nav className="mt-2 flex flex-1 flex-col gap-1 px-3" aria-label="Sections">
                {NAV.map((n) => <NavItemLink key={n.to} {...n} waiting={badgeFor(n.to)} onNavigate={() => setOpen(false)} />)}
              </nav>
              <p className="px-5 py-4 text-xs leading-relaxed text-muted-foreground">{t("Nothing is ever sent without you approving it.")}</p>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="lg:pl-[240px]">
        <div className="sticky top-0 z-20 hidden h-12 items-center justify-between gap-3 border-b border-border bg-card/90 px-8 backdrop-blur lg:flex">
          {sahayak.on ? (
            <Link to="/sahayak" className="inline-flex items-center gap-1.5 text-xs font-medium text-purple hover:underline">
              <Sparkles className="size-3.5" aria-hidden />
              Sahayak is on · {reminders.length} {reminders.length === 1 ? "reminder" : "reminders"}
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground">Sahayak is off · manual mode</span>
          )}
          <div className="flex items-center gap-3">
            <Link to="/start" className="text-xs font-medium text-purple hover:underline">{t("Switch view")}</Link>
            {sahayak.on && <BellButton count={reminders.length} onClick={() => setRemindersOpen(true)} />}
          </div>
        </div>
        <div className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-24 lg:pt-8">{children}</div>
      </main>

      <SahayakIntro open={introOpen} onOpenChange={setIntroOpen} />
      <RemindersPanel open={remindersOpen} onOpenChange={setRemindersOpen} />
      <SahayakChat />
    </div>
  );
}

/** Keeps the sheet's close button from being the only way out on wide screens. */
export function PanelClose({ children }: { children: ReactNode }) {
  return <SheetClose asChild>{children}</SheetClose>;
}
