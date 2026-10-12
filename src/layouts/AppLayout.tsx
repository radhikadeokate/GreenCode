import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard, FolderGit2, FlaskConical, Gauge, Leaf, Lightbulb, FileText, Settings, BookOpen, PanelLeftClose, PanelLeftOpen, Search,
  Sun, Moon, Monitor, Menu, X, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { USE_MOCK } from "@/services/api";
import { useTheme, type Theme } from "@/lib/theme";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderGit2 },
  { to: "/analyses", label: "Analyses", icon: FlaskConical },
  { to: "/performance", label: "Performance", icon: Gauge },
  { to: "/sustainability", label: "Sustainability", icon: Leaf },
  { to: "/recommendations", label: "Recommendations", icon: Lightbulb },
  { to: "/reports", label: "Reports", icon: FileText },
] as const;
const bottom = [
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/docs", label: "Documentation", icon: BookOpen },
] as const;

const AUTH_PATHS = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"];

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const opts: { v: Theme; icon: typeof Sun; label: string }[] = [
    { v: "light", icon: Sun, label: "Light" },
    { v: "dark", icon: Moon, label: "Dark" },
    { v: "system", icon: Monitor, label: "System" },
  ];
  return (
    <div role="radiogroup" aria-label="Theme" className="flex items-center rounded-md border bg-background p-0.5">
      {opts.map(({ v, icon: I, label }) => (
        <button
          key={v}
          role="radio"
          aria-checked={theme === v}
          aria-label={`${label} theme`}
          title={`${label} theme`}
          onClick={() => setTheme(v)}
          className={cn("grid size-6 place-items-center rounded text-muted-foreground transition-colors hover:text-foreground", theme === v && "bg-secondary text-foreground shadow-card")}
        >
          <I className="size-3.5" />
        </button>
      ))}
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => setMobileOpen(false), [path]);
  const active = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  if (AUTH_PATHS.includes(path)) return <>{children}</>;

  const Item = ({ to, label, icon: Icon, compact }: { to: string; label: string; icon: typeof Gauge; compact: boolean }) => (
    <Link
      to={to}
      title={label}
      aria-current={active(to) ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active(to) && "bg-sidebar-accent text-sidebar-accent-foreground",
      )}
    >
      {active(to) && <span className="absolute inset-y-1.5 -left-2 w-0.5 rounded-full bg-sidebar-primary" />}
      <Icon className={cn("size-4 shrink-0 opacity-80", active(to) && "text-sidebar-primary opacity-100")} />
      {!compact && <span>{label}</span>}
    </Link>
  );

  const sidebar = (compact: boolean) => (
    <>
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="grid size-7 shrink-0 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground"><Leaf className="size-4" /></div>
        {!compact && (
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight text-sidebar-accent-foreground">GreenCode</div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Efficiency platform</div>
          </div>
        )}
      </div>
      <nav aria-label="Main" className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {!compact && <div className="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">Workspace</div>}
        {nav.map((n) => <Item key={n.to} {...n} compact={compact} />)}
      </nav>
      <div className="flex flex-col gap-0.5 border-t border-sidebar-border p-2">
        {bottom.map((n) => <Item key={n.to} {...n} compact={compact} />)}
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen w-full">
      <aside className={cn("sticky top-0 hidden h-screen shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex", collapsed ? "w-14" : "w-60")}>
        {sidebar(collapsed)}
        <button onClick={() => setCollapsed((c) => !c)} className="m-2 mt-0 flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] hover:bg-sidebar-accent" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <PanelLeftOpen className="size-4" /> : <><PanelLeftClose className="size-4" /><span>Collapse</span></>}
        </button>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground shadow-xl">
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="absolute right-2 top-3.5 grid size-7 place-items-center rounded hover:bg-sidebar-accent"><X className="size-4" /></button>
            {sidebar(false)}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:px-6">
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="grid size-8 place-items-center rounded-md border md:hidden"><Menu className="size-4" /></button>
          <label className="flex w-full max-w-sm items-center gap-2 rounded-md border bg-background px-2.5 py-1.5 text-muted-foreground transition-colors focus-within:border-ring">
            <Search className="size-3.5 shrink-0" aria-hidden />
            <span className="sr-only">Search</span>
            <input placeholder="Search projects, analyses…" className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
            <kbd className="hidden rounded border bg-muted px-1.5 text-[10px] font-medium lg:inline">⌘K</kbd>
          </label>
          <div className="ml-auto flex items-center gap-2.5 text-xs">
            {USE_MOCK && (
              <span className="hidden items-center gap-1.5 rounded-md border border-warning/30 bg-warning/10 px-2 py-1 font-medium text-warning lg:inline-flex">
                <span className="size-1.5 rounded-full bg-warning" />Demo data · backend not connected
              </span>
            )}
            <ThemeSwitch />
            <DropdownMenu>
              <DropdownMenuTrigger aria-label="Account menu" className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-semibold transition-colors hover:bg-muted">AS</DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Signed in (demo)</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/settings"><Settings className="size-4" />Settings</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/sign-in"><LogOut className="size-4" />Sign out</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1400px] flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
