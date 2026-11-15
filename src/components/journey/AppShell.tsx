import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, CalendarDays, UserRound, Bell, BookOpen, History, Inbox, LayoutDashboard, Mail, Menu, MoreHorizontal, Settings, Sparkles, Users } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { needsReply } from "@/lib/journey/inbox-seed";
import { useJourney } from "@/lib/journey/store";
import { useLanguage } from "@/lib/journey/i18n";
import { cn } from "@/lib/utils";
import { RemindersPanel } from "./RemindersPanel";
import { SahayakChat } from "./SahayakChat";
import { SahayakIntro } from "./SahayakIntro";
import { DemoNotice } from "./DemoNotice";

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
        <Button variant="link" size="sm" onClick={onMeet} className="h-auto p-0 text-xs font-medium text-purple hover:underline">
          {t("Meet Sahayak")}
        </Button>
        <Link
          to="/settings" search={{ tab: "sahayak" }}
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
      className={cn("relative grid size-11 md:size-9 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground", className)}
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
  const { summary, sahayak, reminders, inbox, city, setCity, views } = useJourney();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pageTitle = NAV.find((n) => n.exact ? pathname === n.to : pathname.startsWith(n.to))?.label ?? (pathname.startsWith("/groups") ? "Volunteer group" : "Sahayak");
  const cities = [...new Set(views.map((v) => v.participant.city))].sort();
  const [open, setOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const waiting = summary.waiting;
  const unread = sahayak.on ? inbox.filter(needsReply).length : 0;
  const badgeFor = (to: To) => (to === "/review" ? waiting : to === "/inbox" ? unread : undefined);

  return (
    <div className="coordinator-shell min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-border bg-card md:flex">
        <div className="brand-gradient border-b border-border px-5 py-5">
          <Link to="/" className="font-heading text-base font-semibold tracking-tight text-primary">Journey</Link>
        </div>
        <SahayakSwitch onMeet={() => setIntroOpen(true)} />
        <nav className="mt-2 flex flex-1 flex-col gap-1 px-3" aria-label="Sections">
          {NAV.map((n) => <NavItemLink key={n.to} {...n} waiting={badgeFor(n.to)} />)}
        </nav>
        <p className="px-5 py-4 text-xs leading-relaxed text-muted-foreground">{t("Nothing is ever sent without you approving it.")}</p>
      </aside>

      <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border bg-card px-4 py-2 md:hidden">
        <span className="min-w-0 truncate font-heading text-base font-semibold text-primary">{t(pageTitle)}</span>
        <div className="flex min-w-0 items-center gap-2">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger aria-label="Centre or region" className="w-28 min-w-0 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">{t("All cities")}</SelectItem>{cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <BellButton count={sahayak.on ? reminders.length : 0} onClick={() => setRemindersOpen(true)} />
        </div>
      </header>

      <main className="md:pl-[240px]">
        <div className="sticky top-0 z-20 hidden h-12 items-center justify-between gap-3 border-b border-border bg-card/90 px-8 backdrop-blur md:flex">
          {sahayak.on ? (
            <Link to="/settings" search={{ tab: "sahayak" }} className="inline-flex items-center gap-1.5 text-xs font-medium text-purple hover:underline">
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
        <div className="mx-auto w-full max-w-[1280px] app-page px-4 pb-40 pt-4 md:px-6 md:pb-24 md:pt-6 lg:px-8 lg:pt-8"><DemoNotice />{children}</div>
      </main>

      <nav aria-label="Mobile sections" className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card md:hidden">
        {(["/", "/participants", "/sessions", "/impact"] as To[]).map((to) => {
          const item = NAV.find((n) => n.to === to);
          if (!item) return null;
          return <Link key={to} to={to} activeOptions={{ exact: to === "/" }} className="flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 text-muted-foreground" activeProps={{ className: "bg-secondary text-purple" }}><item.Icon className="size-5 shrink-0" aria-hidden /><span className="max-w-full truncate text-xs font-medium">{t(item.label)}</span></Link>;
        })}
        <Button variant="ghost" onClick={() => setOpen(true)} aria-label="More sections" className="h-16 min-w-0 flex-col gap-1 rounded-none px-1 text-muted-foreground"><MoreHorizontal className="size-5" /><span className="text-xs">{t("More")}</span></Button>
      </nav>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="mobile-more-sheet max-h-[85dvh] overflow-y-auto rounded-t-lg p-4">
          <SheetTitle className="pr-12 font-heading">{t("More")}</SheetTitle>
          <nav className="mt-4 grid grid-cols-2 gap-2" aria-label="More sections">{NAV.filter((n) => !["/", "/participants", "/sessions", "/impact"].includes(n.to)).map((n) => <NavItemLink key={n.to} {...n} waiting={badgeFor(n.to)} onNavigate={() => setOpen(false)} />)}</nav>
          <SahayakSwitch onNavigate={() => setOpen(false)} onMeet={() => { setOpen(false); setIntroOpen(true); }} />
          <Link to="/start" onClick={() => setOpen(false)} className="mt-3 flex min-h-11 items-center px-3 text-sm font-medium text-purple">{t("Switch view")}</Link>
        </SheetContent>
      </Sheet>

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
